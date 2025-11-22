# ThreatIQ - Multi-Agent Phishing Trainer

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> An AI-powered multi-agent system that teaches users to identify phishing attacks through interactive analysis and personalized coaching.

## 🎯 Project Overview

ThreatIQ is a capstone project demonstrating multi-agent AI systems in action. It uses 5 specialized AI agents to analyze messages, provide evidence-based coaching, and track user learning progress over time.

### Features

- 🤖 **Multi-Agent Architecture** - Coordinated AI agents for classification, evidence gathering, memory management, and coaching
- 🎓 **Personalized Learning** - Adaptive coaching based on user's weak spots and progress
- 📊 **Progress Tracking** - MongoDB-backed user profiles with detailed statistics
- 🔍 **Evidence-Based Analysis** - TF-IDF similarity search to find relevant phishing examples
- 🎮 **Interactive Quizzes** - AI-generated quizzes to test understanding
- 🔐 **Firebase Authentication** - Secure user authentication and authorization
- 📱 **Modern UI** - Next.js 14 with ShadCN UI components

## 🏗️ Architecture

### Backend (Python + FastAPI)

```
┌─────────────────┐
│  Orchestrator   │  ← Coordinates workflow
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌──────┐  ┌──────┐
│Class │  │Evid  │  ← Specialized agents
│-ifier│  │-ence │
└──────┘  └──────┘
    ▼         ▼
┌──────┐  ┌──────┐
│Memory│  │Coach │
└──────┘  └──────┘
    │         │
    └────┬────┘
         ▼
    ┌─────────┐
    │ MongoDB │  ← User profiles & logs
    └─────────┘
```

### Tech Stack

**Backend:**
- Python 3.9+
- FastAPI
- Google Gemini AI (via google-generativeai)
- MongoDB Atlas
- Firebase Admin SDK
- scikit-learn (TF-IDF)

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- ShadCN UI
- TailwindCSS
- Firebase Auth

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- MongoDB Atlas account
- Firebase project
- Google AI Studio API key

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Validate configuration
python validate_env.py

# Start server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Start dev server
npm run dev
```

Visit http://localhost:3000 🎉

## 📖 Documentation

- [Backend README](backend/README.md) - API documentation and backend setup
- [Testing Guide](backend/TESTING_GUIDE.md) - Comprehensive testing instructions
- [Setup Guide](backend/SETUP_GUIDE.md) - Detailed environment configuration

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Validate environment
python validate_env.py

# Run automated tests
python test_backend.py

# Manual API test
curl -X POST "http://localhost:8000/api/analyze-public" \
  -H "Content-Type: application/json" \
  -d '{"message": "URGENT: Click here to verify your account!", "user_id": "test"}'
```

## 📊 API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | Health check |
| `/api/analyze-public` | POST | No | Public analysis (testing) |
| `/api/analyze` | POST | Yes | Full analysis with profile |
| `/api/profile/{user_id}` | GET | Yes | Get user profile |
| `/api/verify-token` | POST | Yes | Verify Firebase token |

API Documentation: http://localhost:8000/docs

## 🧠 Multi-Agent System

### 1. Classifier Agent
Analyzes messages using Gemini AI to detect phishing indicators and assigns confidence scores.

### 2. Evidence Agent
Searches phishing dataset using TF-IDF similarity to find relevant examples.

### 3. Memory Agent
Manages user profiles in MongoDB, tracking progress and identifying weak spots.

### 4. Coach Agent
Generates personalized educational responses, tips, and quizzes based on user context.

### 5. Orchestrator Agent
Coordinates the entire workflow, ensuring proper sequencing and data flow.

## 🎓 Learning from ThreatIQ

Users learn by:
1. **Analyzing** - Paste suspicious messages
2. **Guessing** - Make a prediction (phishing/safe/unclear)
3. **Learning** - See detailed analysis and red flags
4. **Comparing** - View similar real phishing examples
5. **Practicing** - Take AI-generated quizzes
6. **Tracking** - Monitor progress and weak spots

## 🔒 Security

- All API keys stored in environment  variables (never in code)
- Firebase Authentication for user management
- MongoDB with authentication and IP whitelisting
- CORS properly configured for production
- Rate limiting on API endpoints

## 📈 Future Enhancements

- [ ] Add more phishing datasets
- [ ] Implement A/B testing for coaching strategies
- [ ] Add team/organization features
- [ ] Export learning analytics
- [ ] Mobile app version
- [ ] Browser extension for real-time analysis

## 🤝 Contributing

This is a capstone project, but suggestions are welcome! Please open an issue to discuss proposed changes.

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 👨‍💻 Author

Built as a capstone project demonstrating multi-agent AI systems, agentic workflows, and full-stack development.

## 🙏 Acknowledgments

- Google Gemini AI for powerful language models
- MongoDB Atlas for database services
- Firebase for authentication
- Kaggle for phishing datasets
- The open-source community

---

**Note:** This project uses free tiers of all services. For production deployment, consider upgrading to paid plans for better performance and reliability.
