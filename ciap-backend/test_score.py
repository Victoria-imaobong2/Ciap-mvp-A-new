import sys
import os
import asyncio

# Setup path
sys.path.append(os.path.abspath("."))

from app.main import app
from app.dependencies import get_current_user
from fastapi.testclient import TestClient

def override_get_current_user():
    # Use a dummy UUID
    return {"id": "123e4567-e89b-12d3-a456-426614174000", "email": "test@test.com", "role": "CREATOR"}

app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

response = client.get("/api/v1/score/123e4567-e89b-12d3-a456-426614174000")
print(f"Status Code: {response.status_code}")
try:
    print(response.json())
except Exception as e:
    print(response.text)
