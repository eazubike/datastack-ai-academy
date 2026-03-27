"""CDK Stack: Full website hosting + API backend on AWS."""
from aws_cdk import (
    Stack,
    Duration,
    RemovalPolicy,
    CfnOutput,
    aws_dynamodb as dynamodb,
    aws_lambda as _lambda,
    aws_apigateway as apigw,
    aws_iam as iam,
    aws_s3 as s3,
    aws_s3_deployment as s3deploy,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_certificatemanager as acm,
    aws_route53 as route53,
    aws_route53_targets as targets,
)
from constructs import Construct


class DataStackFormStack(Stack):
    def __init__(self, scope: Construct, id: str, env_name: str = "test", **kwargs):
        super().__init__(scope, id, **kwargs)

        prefix = f"datastack-{env_name}"
        domain_name = "datastackai.academy" if env_name == "prod" else None

        # ---- Frontend Hosting (S3 + CloudFront) ----

        # S3 bucket for website files
        site_bucket = s3.Bucket(
            self, "SiteBucket",
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
        )

        # SSL certificate + CloudFront (only for prod with domain)
        certificate = None
        if domain_name:
            # Look up the hosted zone
            hosted_zone = route53.HostedZone.from_lookup(
                self, "Zone", domain_name=domain_name
            )

            # SSL certificate (must be in us-east-1 for CloudFront)
            certificate = acm.DnsValidatedCertificate(
                self, "SiteCert",
                domain_name=domain_name,
                subject_alternative_names=[f"www.{domain_name}"],
                hosted_zone=hosted_zone,
                region="us-east-1",
            )

        # CloudFront distribution
        distribution = cloudfront.Distribution(
            self, "SiteDistribution",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3BucketOrigin.with_origin_access_control(site_bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            ),
            default_root_object="index.html",
            error_responses=[
                cloudfront.ErrorResponse(
                    http_status=404,
                    response_http_status=200,
                    response_page_path="/index.html",
                    ttl=Duration.seconds(0),
                ),
                cloudfront.ErrorResponse(
                    http_status=403,
                    response_http_status=200,
                    response_page_path="/index.html",
                    ttl=Duration.seconds(0),
                ),
            ],
            domain_names=[domain_name, f"www.{domain_name}"] if domain_name else None,
            certificate=certificate,
        )

        # Deploy built website to S3
        s3deploy.BucketDeployment(
            self, "DeploySite",
            sources=[s3deploy.Source.asset("../dist")],
            destination_bucket=site_bucket,
            distribution=distribution,
            distribution_paths=["/*"],
        )

        # Route 53 DNS records (prod only)
        if domain_name and hosted_zone:
            route53.ARecord(
                self, "SiteARecord",
                zone=hosted_zone,
                target=route53.RecordTarget.from_alias(
                    targets.CloudFrontTarget(distribution)
                ),
                record_name=domain_name,
            )
            route53.ARecord(
                self, "SiteWwwRecord",
                zone=hosted_zone,
                target=route53.RecordTarget.from_alias(
                    targets.CloudFrontTarget(distribution)
                ),
                record_name=f"www.{domain_name}",
            )

        # ---- Backend API ----

        # DynamoDB table for applications
        table = dynamodb.Table(
            self, "Applications",
            table_name=f"{prefix}-applications",
            partition_key=dynamodb.Attribute(
                name="id", type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.RETAIN,
        )

        table.add_global_secondary_index(
            index_name="email-index",
            partition_key=dynamodb.Attribute(
                name="email", type=dynamodb.AttributeType.STRING
            ),
        )

        # Lambda: form submission
        submit_fn = _lambda.Function(
            self, "SubmitApplication",
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="submit_application.handler",
            code=_lambda.Code.from_asset("lambda"),
            timeout=Duration.seconds(10),
            environment={
                "TABLE_NAME": table.table_name,
                "SENDER_EMAIL": "echeone@gmail.com",#"hello@datastackai.academy",
                "ENV": env_name,
            },
        )

        table.grant_write_data(submit_fn)
        submit_fn.add_to_role_policy(
            iam.PolicyStatement(
                actions=["ses:SendEmail", "ses:SendRawEmail"],
                resources=["*"],
            )
        )

        # API Gateway
        api = apigw.RestApi(
            self, "FormAPI",
            rest_api_name=f"DataStack API ({env_name})",
            default_cors_preflight_options=apigw.CorsOptions(
                allow_origins=apigw.Cors.ALL_ORIGINS,
                allow_methods=["POST", "OPTIONS"],
                allow_headers=["Content-Type"],
            ),
        )

        apply_resource = api.root.add_resource("apply")
        apply_resource.add_method("POST", apigw.LambdaIntegration(submit_fn))

        # ---- Chat resources ----

        chat_table = dynamodb.Table(
            self, "ChatSessions",
            table_name=f"{prefix}-chat-sessions",
            partition_key=dynamodb.Attribute(
                name="session_id", type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.RETAIN,
        )

        chat_bucket = s3.Bucket(
            self, "ChatLogs",
            removal_policy=RemovalPolicy.RETAIN,
        )

        chat_fn = _lambda.Function(
            self, "ChatBot",
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="chat.handler",
            code=_lambda.Code.from_asset("lambda"),
            timeout=Duration.seconds(30),
            environment={
                "MODEL_ID": "eu.anthropic.claude-haiku-4-5-20251001-v1:0",
                "CHAT_TABLE": chat_table.table_name,
                "CHAT_BUCKET": chat_bucket.bucket_name,
                "ENV": env_name,
            },
        )

        chat_fn.add_to_role_policy(
            iam.PolicyStatement(
                actions=["bedrock:InvokeModel"],
                resources=[
                    "arn:aws:bedrock:*::foundation-model/*",
                    "arn:aws:bedrock:*:*:inference-profile/*",
                ],
            )
        )
        chat_fn.add_to_role_policy(
            iam.PolicyStatement(
                actions=[
                    "aws-marketplace:ViewSubscriptions",
                    "aws-marketplace:Subscribe",
                ],
                resources=["*"],
            )
        )
        chat_table.grant_write_data(chat_fn)
        chat_bucket.grant_write(chat_fn)

        chat_resource = api.root.add_resource("chat")
        chat_resource.add_method("POST", apigw.LambdaIntegration(chat_fn))

        # ---- Outputs ----

        CfnOutput(self, "ApiUrl", value=api.url, description=f"API Gateway URL ({env_name})")
        CfnOutput(self, "SiteUrl", value=f"https://{distribution.distribution_domain_name}", description="CloudFront URL")
        if domain_name:
            CfnOutput(self, "DomainUrl", value=f"https://{domain_name}", description="Custom domain URL")
