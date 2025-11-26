# ThreatIQ Backend

FastAPI-based backend for the ThreatIQ phishing detection system featuring multi-agent AI orchestration and Gmail integration.

## Architecture

### Multi-Agent System

The backend implements a sequential multi-agent workflow using Google's Agent Development Kit (ADK):

1. **Classifier Agent** - Analyzes messages for phishing indicators using Gemini 2.0 Flash
2. **Evidence Agent** - Searches phishing dataset for similar examples using TF-IDF vectorization
3. **Memory Agent** - Manages user profiles and updates performance statistics
4. **Coach Agent** - Generates personalized educational content and interactive quizzes
5. **Root Orchestrator** - Coordinates agent workflow and maintains session state

### Gmail Integration Services

- **Crypto Service** - Fernet symmetric encryption for OAuth token storage
- **Gmail OAuth Service** - OAuth 2.0 authorization code flow with state-based CSRF protection
- **Gmail Client** - Gmail API wrapper for message retrieval, parsing, and label management
- **Gmail Triage Service** - Orchestrates inbox analysis using ThreatIQ classification pipeline

## Directory Structure

```
backend/
├── agent.py                    # Root orchestrator agent
├── app/
│   ├── main.py                # FastAPI application entry point
│   ├── config.py              # Environment configuration with validation
│   ├── agents/                # Specialized AI agents
│   │   ├── classifier.py      # Phishing classification with Gemini
│   │   ├── evidence.py        # TF-IDF similarity search
│   │   ├── memory.py          # User profile management
│   │   └── coach.py           # Educational content generation
│   ├── models/                # Data models and schemas
│   │   ├── database.py        # MongoDB connection and utilities
│   │   └── schemas.py         # Pydantic request/response models
│   ├── routers/               # API route handlers
│   │   ├── analysis.py        # Message analysis endpoints
│   │   ├── profile.py         # User profile and history
│   │   ├── auth.py            # Firebase token verification
│   │   ├── gmail.py           # Gmail integration endpoints
│   │   ├── metrics.py         # System metrics and analytics
│   │   └── eval.py            # Model evaluation endpoint
│   ├── services/              # Business logic services
│   │   ├── crypto.py          # Token encryption/decryption
│   │   ├── gmail_oauth.py     # OAuth 2.0 flow implementation
│   │   ├── gmail_client.py    # Gmail API wrapper
│   │   └── gmail_triage.py    # Triage orchestration
│   └── tools/                 # Custom ADK tools
│       ├── adk_tools.py       # Core tool implementations
│       ├── dataset_tools.py   # Dataset loading and search
│       └── profile_tools.py   # Profile CRUD operations
├── data/                      # Phishing dataset (CSV)
├── requirements.txt           # Python dependencies
└── .env.example              # Environment variable template
```

## Setup

### Prerequisites

- Python 3.9 or higher
- MongoDB Atlas account
- Firebase project with service account
- Google AI Studio API key
- Google Cloud project (for Gmail integration)

### Installation

1. **Create virtual environment**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Required variables:
   ```bash
   # Gemini API
   GEMINI_API_KEY=your_gemini_api_key
   
   # MongoDB
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
   MONGODB_DB_NAME=threatiq
   
   # Firebase Admin SDK
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY=your_private_key
   FIREBASE_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
   
   # Gmail OAuth 2.0
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/gmail/callback
   FRONTEND_URL=http://localhost:3000
   TOKEN_ENCRYPTION_KEY=your_fernet_encryption_key
   
   # CORS
   CORS_ORIGINS=http://localhost:3000,http://localhost:3001
   
   # API Configuration
   API_HOST=0.0.0.0
   API_PORT=8000
   ENVIRONMENT=development
   ```

4. **Generate encryption key**
   ```python
   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
   ```

5. **Start server**
   ```bash
   uvicorn app.main:app --reload
   ```
   
   Server runs on http://localhost:8000

## API Endpoints

### Analysis

- `POST /api/analyze-public` - Public analysis without authentication
- `POST /api/analyze` - Full analysis with profile tracking (requires auth)

### Gmail Integration

- `GET /api/gmail/connect` - Generate OAuth authorization URL (requires auth)
- `GET /api/gmail/callback` - OAuth callback handler (state validated)
- `GET /api/gmail/status` - Check Gmail connection status (requires auth)
- `POST /api/gmail/disconnect` - Revoke tokens and disconnect (requires auth)
- `POST /api/gmail/triage` - Run inbox triage (requires auth)
- `GET /api/gmail/history` - Get triage history (requires auth)

### User Profile

- `GET /api/profile/{user_id}` - Get user profile and statistics (requires auth)
- `GET /api/profile/{user_id}/summary` - Get learning progress summary (requires auth)
- `GET /api/profile/{user_id}/history` - Get recent analysis history (requires auth)

### System

- `GET /` - API information and version
- `GET /health` - Health check and database status
- `GET /api/metrics` - System-wide metrics (requires admin auth)
- `POST /admin/eval-sample` - Run model evaluation (requires admin auth)

### Interactive Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## MongoDB Collections

### gmail_tokens

Stores encrypted OAuth tokens for Gmail integration:

```javascript
{
  user_id: "firebase_uid",              // Unique index
  email: "user@gmail.com",
  scopes: ["gmail.readonly", "gmail.modify", "userinfo.email"],
  encrypted_access_token: "encrypted_string",
  encrypted_refresh_token: "encrypted_string",
  expiry_ts: 1234567890,               // Unix timestamp
  created_at: ISODate("2025-01-01T00:00:00.000Z"),
  updated_at: ISODate("2025-01-01T00:00:00.000Z")
}
```

### gmail_triage

Stores Gmail triage history and results:

```javascript
{
  user_id: "firebase_uid",
  gmail_message_id: "message_id",
  thread_id: "thread_id",
  from: "sender@example.com",
  subject: "Email subject",
  date: "Mon, 1 Jan 2025 12:00:00",
  snippet: "Email preview text...",
  body_excerpt: "First 500 chars of body...",
  label: "SAFE" | "SUSPICIOUS" | "PHISHING",
  confidence: 0.95,
  reasons: ["reason_tag1", "reason_tag2"],
  label_applied: true,
  created_at: ISODate("2025-01-01T00:00:00.000Z")
}
```

Indexes: `(user_id, created_at)` descending

### user_profiles

Stores user performance statistics:

```javascript
{
  user_id: "firebase_uid",              // Unique index
  total_messages: 100,
  correct_guesses: 85,
  by_category: {
    fake_bank: { seen: 20, mistakes: 2 },
    // ... other categories
  },
  weak_spots: ["tax_scam", "prize_scam"],
  created_at: ISODate(),
  last_active: ISODate()
}
```

### interaction_logs

Stores complete analysis history:

```javascript
{
  user_id: "firebase_uid",
  session_id: "uuid",
  message: "Original message text",
  classification: { label, confidence, reason_tags, explanation },
  user_guess: "phishing",
  was_correct: true,
  timestamp: ISODate(),
  category: "fake_bank"
}
```

## Security

### Authentication

All protected endpoints require Firebase ID token in Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

Token verification performed by `verify_firebase_token` dependency in `app/routers/auth.py`.

### Gmail OAuth Security

- State parameter binds OAuth request to Firebase user ID
- Tokens encrypted at rest using Fernet (AES-128-CBC + HMAC)
- Server-side token exchange (frontend never sees tokens)
- Automatic token refresh before expiry
- HTTPS-only OAuth redirects in production

### Data Protection

- Environment variables for all secrets
- No hardcoded credentials in source code
- CORS restricted to specific origins
- MongoDB connection uses TLS encryption
- Structured logging (no token/key logging)

## Development

### Running Tests

```bash
pytest tests/
```

### Code Quality

```bash
# Linting
flake8 app/

# Type checking
mypy app/

# Format code
black app/
```

### Database Migrations

MongoDB is schema-less. Indexes are created automatically on first use.

To manually create indexes:

```python
# In MongoDB shell or Compass
db.gmail_tokens.createIndex({ user_id: 1 }, { unique: true })
db.gmail_triage.createIndex({ user_id: 1, created_at: -1 })
db.user_profiles.createIndex({ user_id: 1 }, { unique: true })
db.interaction_logs.createIndex({ user_id: 1, timestamp: -1 })
```

## Deployment

### Production Environment Variables

Update `.env` for production:

```bash
GOOGLE_REDIRECT_URI=https://your-backend.onrender.com/api/gmail/callback
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGINS=https://your-frontend.vercel.app
ENVIRONMENT=production
```

### Render.com Deployment

1. Build Command: `pip install -r requirements.txt`
2. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
3. Add all environment variables from `.env`
4. Deploy

### Health Monitoring

Check `/health` endpoint for:
- API status
- Database connectivity
- Dataset loading status

## Troubleshooting

### Common Issues

**Gmail OAuth errors**

- Verify `GOOGLE_REDIRECT_URI` matches Google Cloud Console settings exactly
- Ensure user is added to test users in OAuth consent screen
- Check `TOKEN_ENCRYPTION_KEY` is properly set

**Database connection fails**

- Verify MongoDB Atlas network access allows your IP
- Check connection string format and credentials
- Ensure database user has read/write permissions

**Gemini API rate limits**

- Free tier: 15 requests per minute
- Process fewer emails per triage (5-10 instead of 50)
- Wait between consecutive triage runs

**CORS errors**

- Add frontend URL to `CORS_ORIGINS` environment variable
- Ensure format: `http://localhost:3000,https://production-url.com`
- Restart backend after changing CORS settings

## License

MIT License

## Contact

For backend-specific issues, please open an issue on the GitHub repository.
