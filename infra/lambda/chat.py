"""Lambda handler: Bedrock-powered chatbot with DynamoDB + S3 chat logging."""
import json
import boto3
import os
import uuid
from datetime import datetime, timezone

bedrock = boto3.client("bedrock-runtime", region_name=os.environ.get("AWS_REGION", "us-east-1"))
dynamodb = boto3.resource("dynamodb")
s3 = boto3.client("s3")

MODEL_ID = os.environ.get("MODEL_ID", "eu.anthropic.claude-haiku-4-5-20251001-v1:0")
CHAT_TABLE = os.environ.get("CHAT_TABLE", "datastack-chat-sessions")
CHAT_BUCKET = os.environ.get("CHAT_BUCKET", "")

table = dynamodb.Table(CHAT_TABLE)

SYSTEM_PROMPT = """You are Eche, the DataStack AI Academy assistant and course instructor. You help prospective students learn about the course. Speak in first person as the instructor — friendly, knowledgeable, and approachable.

COURSE DETAILS:
- Name: DataStack AI Academy
- Duration: 8 weeks (6 weeks learning + 2 weeks capstone) + 2 bonus modules
- Price: £399.99 one-time, live instructor lead interactive classes
- Format: Online, self-paced with weekly live Q&A sessions
- Prerequisites: None. Complete beginners welcome.

CURRICULUM:
- Week 1: SQL Foundations + Git (project: E-Commerce Sales Analysis)
- Week 2: Python from Scratch (project: Data Validation Script)
- Week 3: Pandas + APIs + First LLM API Call (project: API-to-Insight Pipeline with AI Summary)
- Week 4: Data Modeling, ETL Pipelines, Data Quality, pytest (project: Multi-Source ETL Pipeline)
- Week 5: AWS Cloud Platform — S3, Redshift, Glue PySQL, Lambda, SNS, SQS, SES, Slack, dbt, MWAA (project: Event-Driven Cloud Pipeline)
- Week 6: AI Deep Dive (Bedrock, text-to-SQL, RAG), BI Dashboards (Tableau/Power BI), AWS CDK, CodePipeline, Career Launch (project: AI-Powered Dashboard with Daily Brief)
- Weeks 7-8: Capstone Project — full production-grade data platform
- Bonus 1: "Chat With Your Data" — Production Text-to-SQL Agent on AWS
- Bonus 2: "Ask Your Docs" — Production RAG Chatbot on AWS

TOOLS TAUGHT: Python, SQL, PostgreSQL, uv, Pandas, dbt, AWS (S3, Redshift, Glue, Lambda, SNS, SQS, SES, MWAA, Bedrock, CDK, CodePipeline), Slack Webhooks, Tableau/Power BI, Git, Docker

CAREER PATHS (2026 salaries):
- Data Engineer: $131,000
- BI Analyst: $95,000
- Analytics Engineer: $125,000
- AI/ML Engineer: $155,000

WHAT'S INCLUDED: 30+ interactive notebooks, 7 portfolio projects, 2 bonus AI modules, weekly live Q&A, private community, resume + LinkedIn optimization, interview prep, certificate of completion, lifetime access.

RULES:
- Be friendly, concise, and enthusiastic
- Keep answers under 3 sentences unless the question needs more detail
- If asked about topics unrelated to the course, politely redirect
- Encourage them to apply if they seem interested
- Never make up information not in the course details above"""

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
}


def save_to_dynamodb(session_id, message, reply, history):
    """Save/update chat session in DynamoDB."""
    now = datetime.now(timezone.utc).isoformat()
    messages = [{"role": m["role"], "content": m["content"]} for m in history]
    messages.append({"role": "user", "content": message})
    messages.append({"role": "assistant", "content": reply})

    table.put_item(Item={
        "session_id": session_id,
        "updated_at": now,
        "message_count": len(messages),
        "messages": messages,
    })


def save_to_s3(session_id, message, reply, history):
    """Append chat log to S3 as a JSON file per session."""
    if not CHAT_BUCKET:
        return

    now = datetime.now(timezone.utc)
    key = f"chats/{now.strftime('%Y/%m/%d')}/{session_id}.json"

    messages = [{"role": m["role"], "content": m["content"]} for m in history]
    messages.append({"role": "user", "content": message})
    messages.append({"role": "assistant", "content": reply})

    log = {
        "session_id": session_id,
        "updated_at": now.isoformat(),
        "message_count": len(messages),
        "messages": messages,
    }

    s3.put_object(
        Bucket=CHAT_BUCKET,
        Key=key,
        Body=json.dumps(log, indent=2),
        ContentType="application/json",
    )


def handler(event, context):
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        body = json.loads(event["body"])
        message = body.get("message", "").strip()
        session_id = body.get("sessionId", str(uuid.uuid4()))

        if not message:
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "Message is required"}),
            }

        history = body.get("history", [])[-10:]

        # Build messages for Bedrock — must start with user role
        bedrock_messages = []
        started = False
        for msg in history:
            if not started and msg["role"] != "user":
                continue  # skip leading assistant messages
            started = True
            bedrock_messages.append({
                "role": msg["role"],
                "content": [{"text": msg["content"]}]
            })
        bedrock_messages.append({"role": "user", "content": [{"text": message}]})

        # Call Bedrock
        response = bedrock.converse(
            modelId=MODEL_ID,
            system=[{"text": SYSTEM_PROMPT}],
            messages=bedrock_messages,
            inferenceConfig={"maxTokens": 300, "temperature": 0.3},
        )
        reply = response["output"]["message"]["content"][0]["text"]

        # Save to both DynamoDB and S3 (fire-and-forget, don't block response)
        try:
            save_to_dynamodb(session_id, message, reply, history)
        except Exception as e:
            print(f"DynamoDB save error: {e}")

        try:
            save_to_s3(session_id, message, reply, history)
        except Exception as e:
            print(f"S3 save error: {e}")

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"reply": reply, "sessionId": session_id}),
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "Something went wrong. Please try again."}),
        }
