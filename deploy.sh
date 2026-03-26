#!/bin/bash
# Deploy DataStack AI Academy to AWS
# Usage: ./deploy.sh [test|prod]

ENV=${1:-test}
echo "Deploying $ENV environment..."

# Step 1: Build the frontend
echo "Building frontend..."
VITE_API_URL="" npm run build
if [ $? -ne 0 ]; then
    echo "Frontend build failed"
    exit 1
fi
echo "Frontend built → dist/"

# Step 2: Deploy CDK stack
echo "Deploying CDK stack (DataStackFormStack-$ENV)..."
cd infra

# Create venv if it doesn't exist
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi
source .venv/bin/activate
pip install -r requirements.txt --quiet

cdk deploy DataStackFormStack-$ENV --require-approval never
if [ $? -ne 0 ]; then
    echo "CDK deploy failed"
    exit 1
fi

echo ""
echo "=== DEPLOYMENT COMPLETE ==="
echo "Environment: $ENV"
echo ""
echo "Next steps:"
echo "1. Check the outputs above for your API URL and Site URL"
echo "2. Update VITE_API_URL in .env with the API URL"
echo "3. Run: npm run build (to rebuild with the API URL)"
echo "4. Run: ./deploy.sh $ENV (to redeploy with the updated build)"
echo ""
echo "For prod: Your site will be live at https://datastackai.academy"
echo "For test: Use the CloudFront URL from the outputs above"
