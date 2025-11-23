# ThreatIQ Backend

Multi-agent AI system for phishing detection and security training, built with Google ADK, FastAPI, and MongoDB.

## Overview

The ThreatIQ backend implements a sophisticated multi-agent architecture using Google's Agent Development Kit (ADK). The system coordinates five specialized AI agents to analyze messages, detect phishing attempts, retrieve relevant examples, manage user learning profiles, and generate personalized educational coaching.

This backend serves as the core intelligence platform, exposing RESTful APIs for frontend consumption while maintaining session state, user profiles, and interaction history in MongoDB.

## Architecture

### Multi-Agent System Design

The backend implements a sequential agent workflow pattern where each agent performs a specific task and passes its output to the next agent in the pipeline:

```
User Request
     │
     ├──> Root Orchestrator Agent (agent.py)
     │    └──> Session Management (InMemorySessionService)
     │
     ├──> 1. Classifier Agent ──────────────┐
     │    - Model: Gemini 2.0 Flash          │
     │    - Input: Raw message text          │
     │    - Output: {label, confidence,      │
     │              reason_tags, explanation}│
     │    - Techniques: Few-shot prompting,  │
     │                  JSON mode output    <─┘
     │
     ├──> 2. Evidence Agent ────────────────┐
     │    - Tools: TF-IDF vectorization      │
     │    - Input: Message + classification  │
     │    - Output: Top 3 similar examples   │
     │    - Techniques: Cosine similarity    │
     │                  on TF-IDF vectors   <─┘
     │
     ├──> 3. Memory Agent ──────────────────┐
     │    - Database: MongoDB Atlas          │
     │    - Input: User ID + classification  │
     │    - Output: Updated profile stats    │
     │    - Functions: CRUD operations,      │
     │                 weak spot detection  <─┘
     │
     ├──> 4. Coach Agent ───────────────────┐
     │    - Model: Gemini 2.0 Flash          │
     │    - Input: All previous outputs      │
     │    - Output: {explanation, tips,      │
     │              similar_examples, quiz}  │
     │    - Tailored to user weaknesses     <─┘
     │
     └──> Interaction Logging (MongoDB)
          - Complete request/response
          - Session ID for tracing
          - Timestamp for analytics
```

### Agent Implementations

#### 1. Classifier Agent (`app/agents/classifier.py`)

Analyzes message content to determine phishing likelihood using natural language understanding.

**Key Features:**
- Structured system instruction defining phishing indicators
- JSON mode output for reliable parsing
- Multi-strategy fallback for JSON extraction
- Confidence calibration based on evidence strength
- Reason tagging for explainability

**Phishing Indicators:**
- suspicious_link, urgency, request_info, impersonation
- spelling_errors, too_good_offer, sender_mismatch
- threatening_language, generic_greeting, suspicious_attachment

**Output Schema:**
```python
{
    "label": str,           # "phishing" | "safe" | "unclear"
    "confidence": float,    # 0.0 to 1.0
    "reason_tags": list,    # E.g., ["urgency", "suspicious_link"]
    "explanation": str      # Human-readable justification
}
```

#### 2. Evidence Agent (`app/agents/evidence.py`)

Retrieves similar phishing examples from the dataset using information retrieval techniques.

**Key Features:**
- TF-IDF vectorization of phishing dataset
- Cosine similarity search
- Category-based filtering
- Sample diversity to show varied examples

**Process:**
1. Load phishing dataset on initialization
2. Compute TF-IDF matrix for all messages
3. Transform query message to TF-IDF vector
4. Calculate cosine similarities
5. Return top K results with category and similarity score

#### 3. Memory Agent (`app/agents/memory.py`)

Manages user learning profiles and performance tracking in MongoDB.

**Profile Schema:**
```python
{
    "user_id": str,
    "total_messages": int,
    "correct_guesses": int,
    "by_category": {
        "fake_bank": {"seen": int, "mistakes": int},
        # ... other categories
    },
    "weak_spots": list,      # Categories with >40% error rate
    "last_updated": datetime
}
```

**Functions:**
- `load_user_profile`: Retrieve or create profile
- `update_user_profile`: Increment counters and recalculate weak spots
- `get_user_summary`: Aggregate statistics for dashboard

#### 4. Coach Agent (`app/agents/coach.py`)

Generates personalized educational content based on classification results and user history.

**Key Features:**
- Adaptive explanations based on user performance
- Contextual safety tips tailored to threat type
- Similar examples with explanatory context
- Auto-generated quiz questions for active learning

**Output Schema:**
```python
{
    "explanation": str,          # Detailed coaching message
    "tips": list,                # 3-5 actionable safety tips
    "similar_examples": list,    # Examples with context
    "quiz": {
        "question": str,
        "options": list,         # 3-4 multiple choice
        "correct_answer": str
    }
}
```

### Custom ADK Tools

All tools follow the Google ADK specification and are registered in `app/tools/adk_tools.py`:

1. **load_dataset**: Loads phishing CSV, computes TF-IDF vectors, returns dataset size
2. **search_similar_messages**: Takes message text and category, returns similar examples
3. **get_user_profile**: Retrieves user profile from MongoDB, creates if missing
4. **update_user_profile**: Updates performance stats, detects new weak spots
5. **log_interaction**: Records full interaction to interactions collection

## API Endpoints

### Analysis Endpoints (`app/routers/analysis.py`)

#### POST `/api/analyze`
**Authentication:** Required (Firebase token)  
**Description:** Full analysis with profile tracking and dashboard updates

**Request:**
```json
{
  "message": "string",
  "user_guess": "phishing" | "safe" | "unclear",
  "user_id": "string"
}
```

**Response:**
```json
{
  "classification": { /* Classifier output */ },
  "similar_examples": [ /* Evidence output */ ],
  "coach_response": { /* Coach output */ },
  "user_performance": { /* Memory output */ }
}
```

#### POST `/api/analyze-public`
**Authentication:** None  
**Description:** Public endpoint for testing, does not save to profiles

### Profile Endpoints (`app/routers/profile.py`)

#### GET `/api/profile/{user_id}`
**Authentication:** Required  
**Description:** Retrieve full user profile and summary

**Response:**
```json
{
  "profile": {
    "user_id": "string",
    "total_messages": 42,
    "correct_guesses": 35,
    "by_category": { /* category stats */ }
  },
  "summary": {
    "accuracy": 0.83,
    "weak_spots": ["fake_shipping"],
    "strongest_categories": ["fake_bank"]
  }
}
```

#### GET `/api/profile/{user_id}/summary`
**Authentication:** Required  
**Description:** Get condensed learning progress summary

#### GET `/api/profile/{user_id}/history`
**Authentication:** Required  
**Description:** Retrieve recent analysis history (last 50 interactions)

**Response:**
```json
{
  "history": [
    {
      "id": "string",
      "message": "string",
      "classification": { /* label, confidence */ },
      "was_correct": true,
      "timestamp": "ISO 8601"
    }
  ]
}
```

### Admin Endpoints

#### GET `/api/metrics`
**Authentication:** Required  
**Description:** System-wide observability metrics

**Response:**
```json
{
  "total_users": 127,
  "total_messages": 1543,
  "total_interactions": 1543,
  "avg_accuracy": 0.79
}
```

#### POST `/api/admin/eval-sample`
**Authentication:** Required  
**Description:** Run evaluation agent on recent interactions

**Parameters:**
- `limit`: Number of interactions to evaluate (default: 5, max: 20)

**Response:**
```json
{
  "evaluated": 5,
  "sample_size": 5,
  "message": "Evaluation completed."
}
```

## Database Schema

### Collections

#### user_profiles
**Purpose:** Store user learning statistics and progress tracking

**Indexes:**
- `user_id` (unique)
- `last_updated`

**Average Document Size:** ~500 bytes

#### interactions
**Purpose:** Log all message analysis interactions for observability and evaluation

**Indexes:**
- `user_id`
- `timestamp` (descending)
- `session_id`

**Average Document Size:** ~2KB

**Retention:** Unlimited (consider implementing TTL for production)

#### model_evaluations
**Purpose:** Store evaluation agent results for model performance tracking

**Indexes:**
- `interaction_id`
- `evaluated_at` (descending)

**Average Document Size:** ~400 bytes

## Environment Configuration

### Required Variables

```bash
# Google Gemini API
GEMINI_API_KEY=your_api_key_here

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
MONGODB_DB_NAME=threatiq

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Server Configuration
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
LOG_LEVEL=INFO
```

### Optional Variables

```bash
# Rate Limiting
MAX_REQUESTS_PER_MINUTE=15

# Database Connection Pool
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=1

# Session Management
SESSION_TIMEOUT_MINUTES=60
```

## Setup Instructions

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

**Core Dependencies:**
- fastapi==0.109.0
- uvicorn[standard]==0.27.0
- motor==3.3.2 (async MongoDB driver)
- google-generativeai==0.8.3
- genai-agents (Google ADK)
- firebase-admin==6.4.0
- pydantic==2.5.3
- python-dotenv==1.0.0
- scikit-learn==1.4.0

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

**Getting Credentials:**

1. **Gemini API Key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **MongoDB URI**: Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
3. **Firebase**: Create project at [Firebase Console](https://console.firebase.google.com/), download service account JSON

### 4. Prepare Dataset

Place your phishing dataset CSV in `data/phishing_dataset.csv` with columns:
- `message`: The phishing message text
- `label`: "phishing" or "safe"
- `category`: Optional category classification

### 5. Start Server

```bash
# Development with auto-reload
uvicorn app.main:app --reload

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 6. Verify Installation

```bash
# Check health endpoint
curl http://localhost:8000/health

# View API docs
open http://localhost:8000/docs
```

## Testing

### Automated Test Suite

Run the comprehensive test suite:

```bash
python test_backend.py
```

**Tests Include:**
- Classifier agent accuracy across phishing categories
- Evidence retrieval relevance and diversity
- Profile creation and update correctness
- Coach output completeness and quiz generation
- End-to-end multi-agent workflow integration

### Manual Testing with Swagger UI

1. Navigate to http://localhost:8000/docs
2. Expand `/api/analyze-public` endpoint
3. Click "Try it out"
4. Enter test message and parameters
5. Execute and review response

### Sample Test Cases

**Fake Bank Phishing:**
```
URGENT: Your Chase account has been locked due to suspicious activity. 
Verify your identity now: http://chase-verify.net/login
```

**Fake Shipping:**
```
Your USPS package is awaiting delivery. Confirm address and pay $2.95 
shipping fee: http://usps-tracking.com/confirm
```

**Legitimate Message:**
```
Hi team, reminder that our weekly standup is at 10am tomorrow. Please 
have your updates ready. See you then!
```

## Deployment

### Render.com Deployment

1. **Create Web Service**
   - Connect GitHub repository
   - Select backend directory as root

2. **Build Settings**
   ```
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port 10000
   ```

3. **Environment Variables**
   - Add all variables from `.env`
   - Set `ENVIRONMENT=production`

4. **Health Check**
   - Path: `/health`
   - Expected response: `{"status": "healthy"}`

### Railway Deployment

1. **Create New Project**
   - Import from GitHub
   - Select backend service

2. **Configure Settings**
   ```
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

3. **Add Variables**
   - Import from `.env`
   - Update `CORS_ORIGINS` with production frontend URL

### Performance Optimization

**For Production:**
- Increase Uvicorn workers: `--workers 4`
- Enable MongoDB connection pooling
- Implement Redis caching for user profiles
- Add rate limiting middleware
- Enable response compression

## Observability

### Logging

All logs use Python's standard logging module with structured format:

```python
logger.info(
    "Analysis completed",
    extra={
        "session_id": session_id,
        "user_id": user_id,
        "classification": label,
        "duration_ms": duration
    }
)
```

### Monitoring Recommendations

1. **Application Performance**
   - Track API response times per endpoint
   - Monitor Gemini API latency and errors
   - Measure MongoDB query performance

2. **Business Metrics**
   - Users registered per day
   - Messages analyzed per day
   - Average user accuracy trends

3. **Error Tracking**
   - Classification JSON parsing failures
   - MongoDB connection issues
   - Firebase token verification errors

### Log Levels

- **DEBUG**: Detailed diagnostic information
- **INFO**: General operational messages
- **WARNING**: Non-critical issues (e.g., fallback strategies used)
- **ERROR**: Serious problems requiring attention

## Troubleshooting

### Common Issues

**MongoDB Connection Timeout**
```
Fix: Ensure your IP is whitelisted in MongoDB Atlas network access settings
```

**Firebase Token Invalid**
```
Fix: Check that FIREBASE_PRIVATE_KEY has escaped newlines (\n not actual newlines)
```

**Gemini Rate Limit Exceeded**
```
Fix: Free tier allows 15 RPM. Implement request queuing or upgrade to paid tier
```

**Dataset Not Found**
```
Fix: Ensure data/phishing_dataset.csv exists and has correct columns
```

### Debug Mode

Enable detailed logging:

```bash
LOG_LEVEL=DEBUG uvicorn app.main:app --reload
```

## Development Guidelines

### Adding New Agents

1. Create agent file in `app/agents/`
2. Follow the pattern: `__init__` with model setup, async method for logic
3. Register in `agent.py` orchestrator workflow
4. Add corresponding API endpoints if external access needed

### Creating Custom Tools

1. Define function in `app/tools/adk_tools.py`
2. Follow ADK tool specification with docstring and type hints
3. Add to `ADK_TOOLS` dictionary
4. Reference in agent implementations

### Code Quality

- Use type hints throughout
- Write docstrings for all public functions
- Run `black` for code formatting
- Use `mypy` for static type checking
- Follow PEP 8 style guidelines

## Performance Benchmarks

Measured on free tier deployment:

| Operation | Average Time |
|-----------|-------------|
| Classification (Gemini) | 1.2s |
| Evidence retrieval (TF-IDF) | 0.15s |
| Profile update (MongoDB) | 0.08s |
| Coach generation (Gemini) | 1.5s |
| **Total workflow** | **3.2s** |
| Cold start penalty | +2-3s |

## Security Best Practices

1. **Never commit** `.env` or service account JSON files
2. **Rotate credentials** periodically (API keys, database passwords)
3. **Validate user input** using Pydantic models
4. **Verify Firebase tokens** on every protected endpoint
5. **Use environment variables** for all secrets
6. **Enable MongoDB IP whitelist** in production
7. **Implement rate limiting** to prevent abuse

## License

MIT License

## Contributing

This is a capstone project, but suggestions and bug reports are welcome via GitHub issues.
