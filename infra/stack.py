"""CDK Stack: API Gateway + Lambda + DynamoDB — supports test and prod environments."""
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
)
from constructs import Construct


class DataStackFormStack(Stack):
    def __init__(self, scope: Construct, id: str, env_name: str = "test", **kwargs):
        super().__init__(scope, id, **kwargs)

        prefix = f"datastack-{env_name}"

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
                "SENDER_EMAIL": "hello@datastackai.academy",
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
                "MODEL_ID": "anthropic.claude-3-haiku-20240307-v1:0",
                "CHAT_TABLE": chat_table.table_name,
                "CHAT_BUCKET": chat_bucket.bucket_name,
                "ENV": env_name,
            },
        )

        chat_fn.add_to_role_policy(
            iam.PolicyStatement(
                actions=["bedrock:InvokeModel"],
                resources=["arn:aws:bedrock:*::foundation-model/*"],
            )
        )
        chat_table.grant_write_data(chat_fn)
        chat_bucket.grant_write(chat_fn)

        chat_resource = api.root.add_resource("chat")
        chat_resource.add_method("POST", apigw.LambdaIntegration(chat_fn))

        # Output the API URL
        CfnOutput(self, "ApiUrl",
            value=api.url,
            description=f"API Gateway URL ({env_name})",
        )
