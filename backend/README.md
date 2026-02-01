# ThreatIQ Backend

FastAPI backend with multi-agent AI orchestration for phishing detection, Gmail integration, and gamified learning.

## Architecture

### Multi-Agent System

Sequential workflow of specialized agents:

| Agent | File | Purpose |
|-------|------|---------|
| **Classifier** | `agents/classifier.py` | Gemini-powered phishing classification with confidence scores |
| **Evidence** | `agents/evidence.py` | TF-IDF similarity search against phishing dataset |
| **Memory** | `agents/memory.py` | User profile management and performance tracking |
| **Coach** | `agents/coach.py` | Personalized tips and quiz generation |
| **Root Orchestrator** | `agent.py` | Coordinates agent workflow and session state |

### Services

| Service | Purpose |
|---------|---------|
| `crypto.py` | Fernet AES-128 encryption for OAuth tokens |
| `gmail_oauth.py` | OAuth 2.0 authorization code flow |
| `gmail_client.py` | Gmail API wrapper (messages, labels) |
| `gmail_triage.py` | Inbox analysis orchestration |

## Directory Structure

```
backend/
├── agent.py                 # Root orchestrator
├── app/
│   ├── main.py             # FastAPI entry point
│   ├── config.py           # Environment config (Pydantic)
│   ├── agents/             # AI agents (classifier, coach, evidence, memory)
│   ├── routers/            # API endpoints
│   │   ├── analysis.py     # /api/analyze, /api/analyze-public
│   │   ├── gmail.py        # /api/gmail/*
│   │   ├── lessons.py      # /api/lessons/*
│   │   ├── profile.py      # /api/profile/*
│   │   ├── auth.py         # Firebase token verification
│   │   ├── eval.py         # /api/admin/eval-sample
│   │   └── metrics.py      # /api/metrics
│   ├── services/           # Gmail OAuth, client, triage, crypto
│   ├── models/             # Pydantic models, database
│   ├── data/               # Lessons content
│   ├── llm/                # Gemini client utilities
│   └── tools/              # Dataset utilities
├── data/                   # Phishing dataset (CSV)
└── requirements.txt
```

## Quick Start

```bash
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
cp .env.example .env           # Add your keys
uvicorn app.main:app --reload
```

Server runs at `http://localhost:8000`

## Environment Variables

```bash
# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
MONGODB_DB_NAME=threatiq

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@project.iam.gserviceaccount.com

# Gmail OAuth 2.0 (optional)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/gmail/callback
FRONTEND_URL=http://localhost:3000
TOKEN_ENCRYPTION_KEY=your_fernet_key

# CORS
CORS_ORIGINS=http://localhost:3000
```

Generate encryption key:
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

## API Endpoints

### Analysis
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/analyze` | Yes | Full analysis with profile tracking |
| POST | `/api/analyze-public` | No | Demo analysis |

### Gmail
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gmail/connect` | Get OAuth authorization URL |
| GET | `/api/gmail/callback` | OAuth callback (state validated) |
| GET | `/api/gmail/status` | Check connection status |
| POST | `/api/gmail/triage` | Run inbox triage |
| POST | `/api/gmail/disconnect` | Revoke tokens |
| GET | `/api/gmail/history` | Get triage history |

### Daily Lessons
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lessons/today` | Get today's lesson |
| POST | `/api/lessons/complete` | Submit quiz, earn XP |
| GET | `/api/lessons/progress` | Get XP, level, streaks |
| GET | `/api/lessons/list` | List all 12 lessons |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/{user_id}` | User profile & stats |
| GET | `/api/profile/{user_id}/history` | Analysis history |
| GET | `/api/profile/{user_id}/summary` | Learning summary |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |

**Interactive Docs:** `http://localhost:8000/docs`

## MongoDB Collections

| Collection | Purpose |
|------------|---------|
| `user_profiles` | Performance stats, weak spots |
| `interaction_logs` | Analysis history |
| `gmail_tokens` | Encrypted OAuth tokens |
| `gmail_triage` | Triage results |
| `lesson_progress` | XP, streaks, completed lessons |

## Development

```bash
# Run tests
pytest tests/

# Lint
flake8 app/

# Type check
mypy app/
```

## Deployment (Render)

- **Build:** `pip install -r requirements.txt`
- **Start:** `uvicorn app.main:app --host 0.0.0.0 --port 10000`
- Add all env vars in Render dashboard

## Security

- Firebase ID token verification on protected routes
- Gmail tokens encrypted with Fernet (AES-128-CBC + HMAC)
- Server-side OAuth token exchange
- CORS restricted to allowed origins
- State parameter prevents OAuth CSRF

## License

MIT
