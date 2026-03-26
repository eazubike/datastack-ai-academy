#!/usr/bin/env python3
"""CDK app for DataStack AI Academy — deploys test and prod stacks."""
import aws_cdk as cdk
from stack import DataStackFormStack

app = cdk.App()

# Test environment
DataStackFormStack(app, "DataStackFormStack-test", env_name="test")

# Production environment
DataStackFormStack(app, "DataStackFormStack-prod", env_name="prod")

app.synth()
