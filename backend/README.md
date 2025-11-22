# ThreatIQ Backend

Multi-agent AI system for phishing detection and security training built with Google ADK, FastAPI, and MongoDB.

## Overview

ThreatIQ uses a specialized multi-agent architecture to analyze messages, detect phishing attempts, and provide personalized security coaching. This backend serves as the core intelligence system for the platform.

## Architecture

### Multi-Agent System

The system employs 5 specialized AI agents coordinated by a root orchestrator:

1. **Classifier Agent** - Analyzes messages using Gemini AI to detect phishing indicators
2. **Evidence Agent** - Searches phishing dataset using TF-IDF similarity to find relevant examples
3. **Memory Agent** - Manages user profiles and learning history in MongoDB
4. **Coach Agent** - Generates personalized educational responses and quizzes
5. **Orchestrator Agent** - Coordinates the entire workflow and manages session state

### Technology Stack

**Core Framework:**
- Python 3.9+
- FastAPI for REST API
- Google ADK (Agent Development Kit)
- Gemini 2.0 Flash for LLM capabilities

**Data & Storage:**
- MongoDB Atlas (async with Motor)
- Firebase Admin SDK for authentication
- scikit-learn for TF-IDF similarity search

**Observability:**
- Structured logging with session tracing
- Request/response tracking
- Error monitoring

## Capstone Requirements

This implementation demonstrates:

- **Multi-agent system**: Sequential agent workflow with LlmAgent pattern
- **Custom tools**: 5 custom ADK tools for dataset search and profile management
- **Sessions & Memory**: InMemorySessionService pattern with MongoDB for long-term storage
- **Observability**: Structured logging and tracing throughout the system
- **Agent evaluation**: Test suite with accuracy metrics and performance monitoring

## Setup

### Prerequisites

- Python 3.9 or higher
- MongoDB Atlas account
- Firebase project
- Google AI Studio API key (Gemini)

### Installation

1. Create and activate virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- `GEMINI_API_KEY` - From Google AI Studio
- `MONGODB_URI` - MongoDB Atlas connection string
- `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` - From Firebase Console
- Additional configuration as needed

4. Validate configuration:
```bash
python validate_env.py
```

5. Start the server:
```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

Once running, view the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Endpoints

**Public (No Authentication)**
- `GET /` - API information
- `GET /health` - Health check
- `POST /api/analyze-public` - Public analysis endpoint for testing

**Protected (Require Firebase Authentication)**
- `POST /api/analyze` - Full analysis with user profile tracking
- `GET /api/profile/{user_id}` - Get user profile and statistics
- `GET /api/profile/{user_id}/summary` - Get learning progress summary
- `POST /api/verify-token` - Verify Firebase authentication token

## Testing

### Environment Validation
```bash
python validate_env.py
```

### Automated Test Suite
```bash
python test_backend.py
```

The test suite validates:
- Classification accuracy across different phishing types
- Evidence retrieval functionality
- Profile management and statistics
- Coaching response generation
- End-to-end multi-agent workflow

### Manual Testing

Use the Swagger UI at http://localhost:8000/docs to test endpoints interactively.

Example request to `/api/analyze-public`:
```json
{
  "message": "URGENT: Your bank account has been suspended. Click here to verify: http://fake-bank.com",
  "user_guess": "phishing",
  "user_id": "test_user"
}
```

## Project Structure

```
backend/
├── agent.py                    # Root ADK agent (orchestrator)
├── app/
│   ├── main.py                # FastAPI application
│   ├── config.py              # Environment configuration
│   ├── agents/                # AI agent implementations
│   │   ├── classifier.py      # Phishing classification
│   │   ├── evidence.py        # Evidence retrieval
│   │   ├── memory.py          # User profile management
│   │   └── coach.py           # Educational coaching
│   ├── models/                # Data models
│   │   ├── database.py        # MongoDB connection
│   │   └── schemas.py         # Pydantic schemas
│   ├── routers/               # API route handlers
│   │   ├── analysis.py        # Analysis endpoints
│   │   ├── profile.py         # Profile endpoints
│   │   └── auth.py            # Authentication
│   └── tools/                 # ADK custom tools
│       ├── adk_tools.py       # Core ADK tools
│       ├── dataset_tools.py   # Dataset management
│       └── profile_tools.py   # Profile utilities
├── data/                      # Phishing dataset storage
├── requirements.txt           # Python dependencies
├── .env.example              # Environment template
└── README.md                 # This file
```

## Development

### Adding New Agents

1. Create agent file in `app/agents/`
2. Implement agent logic using Gemini model
3. Register with orchestrator in `agent.py`
4. Update API endpoints as needed

### Adding Custom Tools

1. Define tool functions in `app/tools/adk_tools.py`
2. Add to `ADK_TOOLS` registry
3. Reference in agent implementations

### Database Collections

**user_profiles**
- User learning statistics
- Weak spots and strengths
- Category performance

**interactions**
- Message analysis history
- User guesses and correctness
- Timestamps and session IDs

## Deployment

The system is designed for deployment on:

**Backend**: Render.com or Railway (free tier compatible)
**Database**: MongoDB Atlas (free tier)
**Authentication**: Firebase (free tier)

### Environment Variables for Production

Ensure these are set in your deployment environment:
- `GEMINI_API_KEY`
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `CORS_ORIGINS`
- `ENVIRONMENT=production`

## Performance Notes

**Free Tier Limitations:**
- Gemini API: 15 requests per minute
- MongoDB Atlas: 512MB storage
- Render.com: Cold starts after inactivity

**Response Times:**
- First request (cold start): 2-5 seconds
- Classification: ~1 second
- Full workflow: ~3-5 seconds

## Troubleshooting

### MongoDB Connection Issues
- Verify IP whitelist in MongoDB Atlas
- Check connection string format
- Ensure database user has proper permissions

### Firebase Authentication Errors
- Confirm private key is properly escaped in .env
- Verify service account permissions
- Check project ID matches Firebase console

### Gemini API Errors
- Validate API key is active
- Check rate limits (15 requests/minute on free tier)
- Ensure using compatible model name (gemini-2.0-flash)

## License

MIT License - See LICENSE file for details

## Contributing

This is a capstone project. For questions or issues, please open a GitHub issue.
