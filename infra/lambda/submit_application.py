"""Lambda handler: receives form submission, writes to DynamoDB, sends confirmation email via SES."""
import json
import boto3
import os
import uuid
from datetime import datetime

dynamodb = boto3.resource("dynamodb")
ses = boto3.client("ses")
table = dynamodb.Table(os.environ["TABLE_NAME"])
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "")

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
}


def send_confirmation_email(name, email):
    """Send a welcome email to the applicant."""
    if not SENDER_EMAIL:
        print("SENDER_EMAIL not configured — skipping email")
        return

    first_name = name.split()[0] if name else "there"

    html = f"""
    <html><body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #1B1B2F, #2D3A4A); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #4F8CFF; margin: 0;">DataStack AI Academy</h1>
    </div>
    <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 12px 12px;">
        <h2 style="color: #1B1B2F;">Hi {first_name}! 🎉</h2>
        <p>Thanks for applying to <strong>DataStack AI Academy</strong>. We've received your application and we're excited to have you.</p>
        <p><strong>What happens next:</strong></p>
        <ul>
            <li>We'll review your application within 24 hours</li>
            <li>You'll receive an email with enrollment details and payment instructions</li>
            <li>Once enrolled, you'll get immediate access to the course materials</li>
        </ul>
        <p><strong>Quick reminder of what you're getting:</strong></p>
        <ul>
            <li>8 weeks of structured curriculum (SQL, Python, AWS, AI)</li>
            <li>30+ interactive Jupyter notebooks</li>
            <li>7 portfolio projects + capstone</li>
            <li>2 bonus AI modules (Text-to-SQL Agent + RAG Chatbot)</li>
            <li>Lifetime access + career support</li>
        </ul>
        <p>In the meantime, feel free to chat with our AI assistant on the website if you have any questions.</p>
        <p>See you soon!<br><strong>The DataStack AI Academy Team</strong></p>
    </div>
    </body></html>
    """

    try:
        ses.send_email(
            Source=SENDER_EMAIL,
            Destination={"ToAddresses": [email]},
            Message={
                "Subject": {"Data": "Welcome to DataStack AI Academy! 🚀"},
                "Body": {
                    "Html": {"Data": html},
                    "Text": {"Data": f"Hi {first_name}! Thanks for applying to DataStack AI Academy. We'll review your application within 24 hours and send you enrollment details."}
                }
            }
        )
        print(f"Confirmation email sent to {email}")
    except Exception as e:
        print(f"Email send failed: {e}")


def handler(event, context):
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        body = json.loads(event["body"])

        name = body.get("name", "").strip()
        email = body.get("email", "").strip()
        if not name or not email:
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "Name and email are required"}),
            }

        item = {
            "id": str(uuid.uuid4()),
            "name": name,
            "email": email.lower(),
            "background": body.get("background", ""),
            "submitted_at": datetime.utcnow().isoformat(),
            "status": "applied",
        }
        table.put_item(Item=item)

        # Send confirmation email
        send_confirmation_email(name, email.lower())

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"message": "Application received", "id": item["id"]}),
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "Internal server error"}),
        }
