#!/usr/bin/env python3
"""CDK app for DataStack AI Academy — deploys test and prod stacks."""
import aws_cdk as cdk
from stack import DataStackFormStack

app = cdk.App()

env = cdk.Environment(account="082121306678", region="eu-west-1")

# Test environment
DataStackFormStack(app, "DataStackFormStack-test", env_name="test", env=env)

# Production environment
DataStackFormStack(app, "DataStackFormStack-prod", env_name="prod", env=env)

app.synth()
