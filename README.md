# ThreatIQ - Multi-Agent Phishing Detection System

AI-powered phishing detection and security training platform built with Google ADK and modern web technologies.

## Overview

ThreatIQ is a capstone project demonstrating a production-ready multi-agent AI system. The platform helps users identify phishing attacks through interactive analysis and personalized coaching, using specialized AI agents that work together to provide comprehensive security training.

## Features

- **Multi-Agent Architecture** - Five specialized AI agents coordinate to analyze messages and provide coaching
- **Real-time Analysis** - Instant phishing detection with confidence scores and detailed explanations
- **Personalized Learning** - Adaptive coaching based on user performance and identified weak spots
- **Evidence-Based Training** - Shows real phishing examples similar to analyzed messages
- **Progress Tracking** - MongoDB-backed profiles track user improvement over time
- **Interactive Quizzes** - AI-generated questions to reinforce learning

## Architecture

### Backend (Python + FastAPI)

Multi-agent system built with Google ADK:

- **Orchestrator Agent** - Coordinates workflow and manages sessions
- **Classifier Agent** - Analyzes messages using Gemini AI
- **Evidence Agent** - Searches phishing dataset for similar examples
- **Memory Agent** - Manages user profiles and learning history
- **Coach Agent** - Generates personalized educational content

### Frontend (Next.js 14)

Modern web interface with:

- TypeScript for type safety
- ShadCN UI components
- Firebase Authentication
- Real-time API integration
- Responsive design

## Technology Stack

**Backend:**
- Python 3.9+
- FastAPI
- Google ADK (Agent Development Kit)
- Gemini 2.0 Flash
- MongoDB Atlas
- Firebase Admin SDK

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- ShadCN UI
- TailwindCSS
- Firebase Auth

**Infrastructure:**
- MongoDB Atlas (Database)
- Firebase (Authentication)
- Vercel (Frontend hosting)
- Render/Railway (Backend hosting)

## Capstone Requirements

This project demonstrates:

1. **Multi-agent system** - Sequential LLM-powered agents with coordination
2. **Custom tools** - Dataset search, profile management, and interaction logging
3. **Sessions & Memory** - InMemorySessionService pattern with MongoDB persistence
4. **Observability** - Structured logging with session tracing
5. **Agent evaluation** - Automated testing with accuracy metrics

## Project Structure

```
ThreatIQ_Agent/
├── backend/              # Python FastAPI backend
│   ├── agent.py         # Root ADK agent
│   ├── app/
│   │   ├── agents/      # AI agent implementations
│   │   ├── models/      # Data models and schemas
│   │   ├── routers/     # API endpoints
│   │   └── tools/       # Custom ADK tools
│   └── data/            # Phishing dataset
├── frontend/            # Next.js 14 frontend (TBD)
└── README.md           # This file
```

## Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment and install dependencies:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Start the server:
```bash
uvicorn app.main:app --reload
```

API available at http://localhost:8000

See [backend/README.md](backend/README.md) for detailed setup instructions.

### Frontend Setup

Coming soon - Next.js 14 application

## API Endpoints

**Public:**
- `GET /` - API information
- `GET /health` - Health check
- `POST /api/analyze-public` - Public analysis endpoint

**Protected (Firebase Auth):**
- `POST /api/analyze` - Full analysis with profile tracking
- `GET /api/profile/{user_id}` - User profile and statistics
- `POST /api/verify-token` - Token verification

Full API documentation: http://localhost:8000/docs

## Development

### Prerequisites

- Python 3.9+
- Node.js 18+
- MongoDB Atlas account
- Firebase project
- Google AI Studio API key

### Environment Setup

**Backend:**
- `GEMINI_API_KEY` - Google AI Studio
- `MONGODB_URI` - MongoDB Atlas connection string
- `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` - Firebase credentials

**Frontend:**
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase web config
- `NEXT_PUBLIC_API_URL` - Backend API URL

### Testing

Backend automated tests:
```bash
cd backend
python test_backend.py
```

## Deployment

**Backend:**
- Platform: Render.com or Railway
- Requirements: Python 3.9+, environment variables
- Cold start: ~2-5 seconds on free tier

**Frontend:**
- Platform: Vercel or Netlify
- Build: Next.js automatic optimization
- CDN: Global edge network

**Database:**
- MongoDB Atlas free tier (512MB)

**Authentication:**
- Firebase free tier

## Performance

- Classification: ~1 second
- Full multi-agent workflow: ~3-5 seconds
- First request (cold start): 2-5 seconds
- Rate limit: 15 requests/minute (Gemini free tier)

## Security

- API keys stored in environment variables
- Firebase Authentication for user management
- MongoDB with IP whitelisting
- CORS properly configured
- No sensitive data in version control

## Future Enhancements

- Additional phishing datasets
- A/B testing for coaching strategies
- Team/organization features
- Browser extension for real-time analysis
- Mobile application

## License

MIT License

## Author

Built as a capstone project demonstrating multi-agent AI systems and full-stack development.

## Acknowledgments

- Google Gemini AI for language models
- MongoDB Atlas for database services
- Firebase for authentication
- The open-source community

## Contact

For questions or issues, please open a GitHub issue.
