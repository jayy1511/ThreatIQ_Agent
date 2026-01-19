# Microservices Verification Checklist

Use this to verify everything works. Delete after testing.

---

## Step 1: Start Analysis Service

```bash
cd services/analysis-service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8010 --reload
```

**Check:** http://localhost:8010/health returns `{"status": "ok"}`

---

## Step 2: Start Gateway (separate terminal)

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Check:** http://localhost:8000/health returns healthy response

---

## Step 3: Test Public Analysis

```bash
curl -X POST http://localhost:8000/api/analyze-public \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"URGENT: Your account suspended! Click here to verify now!\", \"user_id\": \"test123\"}"
```

**Expected:**
- Status 200
- Response contains `classification`, `coach_response`, `was_correct`
- `classification.label` should be `phishing`

---

## Step 4: Test Authenticated Analysis (via Frontend)

1. Open http://localhost:3000
2. Login with your account
3. Go to Analyze page
4. Paste a test message and analyze

**Expected:**
- Analysis works same as before
- History entry appears in your profile

---

## Step 5: Verify Other Routes Still Work

- `/api/lessons/today` - Should return today's lesson
- `/api/gmail/status` - Should return connection status
- `/api/profile/{uid}/summary` - Should return user summary

---

## Common Issues

| Issue | Solution |
|-------|----------|
| `Analysis service unavailable` | Check port 8010 is running |
| `Cannot connect to analysis service` | Check ANALYSIS_SERVICE_URL in .env |
| `500 error on gateway` | Check both services logs |

---

## Docker Test (Optional)

```bash
# From repo root
docker-compose up --build

# In another terminal
curl http://localhost:8000/health
curl http://localhost:8010/health
```

---

**Delete this file after verification!**
