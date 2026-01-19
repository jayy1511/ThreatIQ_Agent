# Microservices Architecture

ThreatIQ uses a microservices architecture with two main services:

## Architecture Overview

```
┌─────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   Frontend  │──────►│  Gateway API     │──────►│ Analysis Service │
│  (Next.js)  │       │  (port 8000)     │       │   (port 8010)    │
└─────────────┘       └────────┬─────────┘       └──────────────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │    MongoDB       │
                      │  (persistence)   │
                      └──────────────────┘
```

### Gateway API (port 8000)
- Authentication (Firebase token verification)
- Database writes (MongoDB): history, profiles, lessons, Gmail tokens
- Routes: `/api/analyze`, `/api/profile`, `/api/lessons`, `/api/gmail`
- Calls analysis-service for AI processing

### Analysis Service (port 8010)
- Stateless AI analysis pipeline
- Gemini LLM classification
- Evidence/similarity search
- Coaching response generation
- No database access

## Local Development

### Option 1: Docker Compose (Recommended)

```bash
# From repository root
docker-compose up --build
```

This starts:
- Gateway on http://localhost:8000
- Analysis Service on http://localhost:8010

### Option 2: Manual (Two Terminals)

**Terminal 1 - Analysis Service:**
```bash
cd services/analysis-service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8010 --reload
```

**Terminal 2 - Gateway:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Environment Variables

### Gateway (.env)
```
# Microservices
ANALYSIS_SERVICE_URL=http://localhost:8010

# Existing vars...
GEMINI_API_KEY=...
MONGODB_URI=...
```

### Analysis Service (.env)
```
GEMINI_API_KEY=...
# or
GEMINI_API_KEYS=key1,key2,key3
```

## Production Deployment

Deploy as two separate services:

1. **Gateway API** → Deploy `backend/` to Render/Railway
   - Set `ANALYSIS_SERVICE_URL` to deployed analysis-service URL

2. **Analysis Service** → Deploy `services/analysis-service/` separately
   - Set `GEMINI_API_KEY`

## Health Checks

```bash
# Gateway
curl http://localhost:8000/health

# Analysis Service
curl http://localhost:8010/health
```

## API Flow

1. Frontend calls `POST /api/analyze` on Gateway
2. Gateway verifies Firebase auth
3. Gateway calls Analysis Service for AI processing
4. Analysis Service returns classification + coaching
5. Gateway writes to MongoDB (history, profile)
6. Gateway returns response to Frontend
