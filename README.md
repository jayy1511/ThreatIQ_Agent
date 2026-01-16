# ThreatIQ - Multi-Agent Phishing Detection System

An intelligent phishing detection and security training platform leveraging Google's Gemini AI and modern web technologies. Features multi-agent analysis, automated Gmail inbox triage, daily cybersecurity micro-lessons, and gamified learning with XP, levels, and streaks.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Gmail Integration](#gmail-integration)
- [Daily Lessons System](#daily-lessons-system)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Security](#security)
- [License](#license)

## Overview

ThreatIQ is a production-ready full-stack web application that combines real-time phishing detection with personalized security coaching and gamified learning. The platform uses a multi-agent AI architecture to analyze suspicious messages, provides detailed classification results, generates adaptive educational content, and maintains long-term user engagement through daily lessons and gamification.

### Core Capabilities

1. **Multi-Agent Phishing Detection**: Four specialized AI agents work together to classify messages:
   - **Classifier Agent**: Analyzes messages using Gemini AI to identify phishing indicators with confidence scores and reason tags
   - **Evidence Agent**: Uses TF-IDF similarity search to find related real-world examples from a curated phishing dataset
   - **Memory Agent**: Manages user profiles and learning context to enable personalization
   - **Coach Agent**: Generates explanations, personalized tips, and interactive quizzes based on analysis results

2. **Gmail Integration**: Automated inbox protection using OAuth 2.0:
   - Connect your Gmail account securely with server-side token exchange
   - Automatically triage up to 50 unread emails using ThreatIQ's AI classification
   - Apply labels (ThreatIQ/Safe, ThreatIQ/Suspicious, ThreatIQ/Phishing) directly in Gmail
   - Optional automatic spam marking and archiving
   - View triage history with confidence scores and classifications

3. **Daily Micro-Lessons**: Gamified learning for long-term security awareness:
   - 12 curated cybersecurity lessons covering passwords, 2FA, phishing, social engineering, mobile security, and more
   - Rotating daily lessons (2-3 minutes each) tied to the Europe/Paris timezone
   - Interactive quizzes (3 multiple-choice questions per lesson)
   - XP rewards based on quiz performance (10-50 XP per lesson)
   - Progression system with levels calculated from total XP
   - Streak tracking to encourage daily engagement (current streak, best streak)
   - Visual progress dashboard showing last 7 days of activity

4. **Personalized Learning**: Adaptive coaching based on user performance:
   - Tracks individual performance across different phishing categories
   - Identifies weak spots in security awareness
   - Provides category-specific statistics and improvement trends
   - Maintains comprehensive interaction history with correctness indicators

5. **Evidence-Based Training**: Real-world context for better learning:
   - Retrieves similar phishing examples from a curated dataset
   - Provides concrete, relatable training material
   - Shows actual reason tags and patterns from real threats

## Features

### For End Users

#### Phishing Analysis
- **Real-Time Analysis**: Submit suspicious emails, SMS, or social media messages for instant AI-powered multi-agent analysis
- **Detailed Results**: Comprehensive reports including:
  - Threat classification (Safe/Suspicious/Phishing)
  - Confidence scores (0-100%)
  - Reason tags identifying specific indicators
  - Detailed explanations of why the message was classified as such
- **Interactive Quizzes**: Test your knowledge with contextually generated questions based on the analyzed threat
- **Evidence-Based Learning**: View similar real-world phishing examples from the dataset to understand patterns

#### Gmail Inbox Protection
- **OAuth 2.0 Authentication**: Secure server-side token exchange with Google (frontend never sees tokens)
- **Automatic Label Creation**: Creates and manages ThreatIQ/Safe, ThreatIQ/Suspicious, and ThreatIQ/Phishing labels
- **Batch Processing**: Process up to 50 unread emails per triage session
- **Optional Actions**: Automatically mark phishing emails as spam or archive safe emails
- **Triage History**: View past classifications with timestamps, confidence scores, and reasoning
- **Token Security**: Gmail access tokens encrypted at rest using Fernet AES-128
- **Auto Token Refresh**: Seamless OAuth token renewal without user interaction

#### Daily Micro-Lessons
- **Curated Content**: 12 professionally written cybersecurity lessons covering:
  - **Passwords**: Creating strong passwords, using password managers
  - **Authentication**: Two-factor authentication (2FA) best practices
  - **Phishing**: Spotting phishing links and email attachments
  - **Social Engineering**: Recognizing manipulation tactics
  - **Device Security**: Mobile security, public WiFi safety, software updates
  - **Privacy**: Social media privacy settings, safe online shopping
  - **Data Protection**: Backup strategies and best practices
- **Daily Rotation**: New lesson each day based on Europe/Paris timezone
- **Interactive Quizzes**: 3 multiple-choice questions per lesson with explanations
- **Instant Feedback**: Scores calculated immediately with detailed answer explanations
- **2-3 Minute Format**: Short, digestible content designed for daily engagement

#### Gamification & Progress Tracking
- **XP System**: Earn 10-50 XP per lesson based on quiz performance:
  - Perfect score (100%): 50 XP
  - Good score (67-99%): 30 XP
  - Passing score (34-66%): 20 XP
  - Low score (1-33%): 10 XP
  - Failed (0%): 5 XP (participation reward)
- **Level Progression**: Dynamic level calculation based on total XP earned
- **Streak Tracking**: 
  - Current streak: consecutive days with completed lessons
  - Best streak: personal record streak
  - Streak resets if a day is missed
  - Visual streak indicators on the dashboard
- **7-Day Activity Calendar**: Visual representation of lesson completion over the past week
- **Learning Dashboard**: Comprehensive metrics including:
  - Total analyses performed
  - Overall accuracy rate
  - Category-specific performance
  - Weak spot identification
  - Improvement trends with charts (Recharts)
  - XP and level display
  - Streak information

#### History & Profile Management
- **Analysis History**: Access complete history of all analyzed messages with:
  - Original message content
  - Classification and confidence
  - User guess (if provided)
  - Correctness indicators
  - Timestamps
  - Session tracking
- **User Profile**: View personalized statistics and performance metrics
- **Theme Support**: Choose between light and dark modes for comfortable viewing

### Gmail Integration Features

- **OAuth 2.0 Authentication**: Secure server-side token exchange with Google
- **Automatic Label Creation**: Creates ThreatIQ/Safe, ThreatIQ/Suspicious, and ThreatIQ/Phishing labels
- **Batch Processing**: Process up to 50 unread emails per triage session
- **Optional Actions**: Mark phishing emails as spam or archive safe emails automatically
- **Triage History**: View past classifications with confidence scores and reasons
- **Token Encryption**: Gmail access tokens encrypted at rest using Fernet AES-128
- **Auto Token Refresh**: Seamless OAuth token renewal without user interaction

## Technology Stack

### Backend

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | FastAPI 0.118.3 | High-performance async API server |
| Agent System | Google ADK (genai-agents) | Multi-agent orchestration and LLM integration |
| Language Model | Gemini 2.0 Flash | Natural language understanding and generation |
| Database | MongoDB Atlas (Motor 3.6.0) | User profiles and interaction history |
| Authentication | Firebase Admin SDK | Token verification and user management |
| Gmail Integration | Google API Python Client 2.155.0 | Gmail API access and OAuth 2.0 |
| Encryption | Cryptography 44.0.0 | Fernet symmetric encryption for tokens |
| ML Tools | scikit-learn 1.4.0 | TF-IDF vectorization and similarity search |
| Validation | Pydantic 2.5.3 | Request/response schema validation |

### Frontend

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | Next.js 14 (App Router) | Server-side rendering and routing |
| Language | TypeScript | Type safety and developer experience |
| UI Components | ShadCN UI | Accessible, customizable component library |
| Styling | TailwindCSS | Utility-first CSS framework |
| Authentication | Firebase SDK | Client-side auth and token management |
| Charts | Recharts | Data visualization for dashboards |
| HTTP Client | Axios | API request handling with interceptors |
| Theme | next-themes | Dark/light mode with system preference detection |

### Infrastructure

| Service | Usage | Tier |
|---------|-------|------|
| MongoDB Atlas | Database hosting | Free M0 (512MB) |
| Firebase | Authentication service | Free Spark plan |
| Google AI Studio | Gemini API access | Free tier (15 RPM) |
| Google Cloud | Gmail API and OAuth | Free tier |
| Vercel | Frontend hosting | Free hobby plan |
| Render | Backend hosting | Free tier |

## Project Structure

```
ThreatIQ_Agent/
├── backend/
│   ├── agent.py                    # Root orchestrator agent
│   ├── app/
│   │   ├── main.py                # FastAPI application entry
│   │   ├── config.py              # Environment configuration
│   │   ├── agents/                # Specialized AI agents
│   │   │   ├── classifier.py      # Phishing classification
│   │   │   ├── evidence.py        # Similarity search
│   │   │   ├── memory.py          # Profile management
│   │   │   └── coach.py           # Educational coaching
│   │   ├── models/                # Data models and schemas
│   │   │   ├── database.py        # MongoDB connection
│   │   │   └── schemas.py         # Pydantic models
│   │   ├── routers/               # API endpoints
│   │   │   ├── analysis.py        # Message analysis routes
│   │   │   ├── profile.py         # User profile and history
│   │   │   ├── auth.py            # Token verification
│   │   │   ├── gmail.py           # Gmail integration endpoints
│   │   │   ├── metrics.py         # System metrics
│   │   │   └── eval.py            # Model evaluation
│   │   ├── services/              # Business logic services
│   │   │   ├── crypto.py          # Token encryption
│   │   │   ├── gmail_oauth.py     # OAuth 2.0 flow
│   │   │   ├── gmail_client.py    # Gmail API wrapper
│   │   │   └── gmail_triage.py    # Triage orchestration
│   │   └── tools/                 # Custom ADK tools
│   │       ├── adk_tools.py       # Core tool implementations
│   │       ├── dataset_tools.py   # Dataset management
│   │       └── profile_tools.py   # Profile utilities
│   ├── data/                      # Phishing dataset (CSV)
│   ├── requirements.txt           # Python dependencies
│   └── README.md                  # Backend documentation
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js app router pages
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── login/            # Login page
│   │   │   ├── signup/           # Signup page
│   │   │   ├── analyze/          # Analysis interface
│   │   │   ├── dashboard/        # User dashboard with Gmail integration
│   │   │   ├── history/          # Analysis history
│   │   │   ├── profile/          # User profile
│   │   │   └── layout.tsx        # Root layout
│   │   ├── components/            # Reusable components
│   │   │   ├── Navbar.tsx        # Navigation header
│   │   │   ├── GmailIntegration.tsx # Gmail triage component
│   │   │   ├── ProtectedRoute.tsx# Auth guard
│   │   │   ├── theme-provider.tsx# Theme context
│   │   │   └── ui/               # ShadCN components
│   │   ├── context/               # React contexts
│   │   │   └── AuthContext.tsx   # Authentication state
│   │   ├── types/                 # TypeScript definitions
│   │   │   └── gmail.ts          # Gmail API types
│   │   └── lib/                   # Utilities
│   │       ├── firebase.ts       # Firebase configuration
│   │       └── api.ts            # API client with Gmail endpoints
│   ├── public/                    # Static assets
│   ├── package.json              # Node dependencies
│   └── README.md                  # Frontend documentation
└── README.md                      # This file
```

## Setup Instructions

### Prerequisites

- Python 3.9 or higher
- Node.js 18 or higher
- Git
- MongoDB Atlas account (free tier)
- Firebase project
- Google AI Studio API key
- Google Cloud project (for Gmail integration)

### Backend Setup

1. **Clone and navigate**
   ```bash
   git clone <repository-url>
   cd ThreatIQ_Agent/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add:
   - `GEMINI_API_KEY`: From Google AI Studio
   - `MONGODB_URI`: MongoDB Atlas connection string
   - `MONGODB_DB_NAME`: Database name (e.g., "threatiq")
   - `FIREBASE_PROJECT_ID`: Firebase project settings
   - `FIREBASE_PRIVATE_KEY`: Firebase service account JSON
   - `FIREBASE_CLIENT_EMAIL`: Firebase service account JSON
   - `GOOGLE_CLIENT_ID`: Google Cloud OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Google Cloud OAuth client secret
   - `GOOGLE_REDIRECT_URI`: OAuth callback URL
   - `FRONTEND_URL`: Frontend URL for redirects
   - `TOKEN_ENCRYPTION_KEY`: Fernet encryption key (generate with crypto.Fernet.generate_key())
   - `CORS_ORIGINS`: Comma-separated allowed origins

5. **Start the server**
   ```bash
   uvicorn app.main:app --reload
   ```
   
   Backend available at http://localhost:8000

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add:
   - `NEXT_PUBLIC_API_URL`: Backend URL (http://localhost:8000 for local)
   - Firebase configuration (from Firebase project settings)

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   Frontend available at http://localhost:3000

### Verification

1. Access frontend at http://localhost:3000
2. Create account using email/password or Google Sign-In
3. Navigate to Analyze page and submit a test message
4. Check Dashboard for updated statistics
5. Review API documentation at http://localhost:8000/docs

## Gmail Integration

### Setup

1. **Create Google Cloud Project**
   - Go to Google Cloud Console
   - Create new project or select existing
   - Enable Gmail API

2. **Configure OAuth Consent Screen**
   - Select "External" user type
   - Add app information
   - Add scopes: `gmail.readonly`, `gmail.modify`, `userinfo.email`
   - Add test users (required for unverified apps)

3. **Create OAuth 2.0 Credentials**
   - Application type: Web application
   - Add authorized JavaScript origins (frontend URL)
   - Add authorized redirect URIs (backend callback URL)
   - Save Client ID and Client Secret

4. **Configure Backend Environment**
   ```bash
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/gmail/callback
   FRONTEND_URL=http://localhost:3000
   TOKEN_ENCRYPTION_KEY=your_fernet_key
   ```

5. **Generate Encryption Key**
   ```python
   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
   ```

### Usage

1. Navigate to Dashboard
2. Click "Connect Gmail" button
3. Authorize ThreatIQ in Google consent screen
4. Select message limit and options
5. Click "Run Triage" to process inbox
6. View results with labels, confidence scores, and reasons
7. Check Gmail for applied labels (ThreatIQ/Safe, ThreatIQ/Suspicious, ThreatIQ/Phishing)

### Security

- OAuth tokens encrypted at rest using Fernet AES-128
- Server-side token exchange (frontend never sees tokens)
- State parameter prevents CSRF attacks
- Automatic token refresh before expiry
- CORS restricted to specific origins
- Scoped permissions (minimal required access)

## API Documentation

### Interactive Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Core Endpoints

#### Analysis

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/analyze-public` | Public analysis | No |
| POST | `/api/analyze` | Full analysis with profile tracking | Yes |

#### Gmail Integration

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/gmail/connect` | Get OAuth authorization URL | Yes |
| GET | `/api/gmail/callback` | OAuth callback (state validated) | No |
| GET | `/api/gmail/status` | Check Gmail connection status | Yes |
| POST | `/api/gmail/disconnect` | Revoke tokens and disconnect | Yes |
| POST | `/api/gmail/triage` | Run inbox triage | Yes |
| GET | `/api/gmail/history` | Get triage history | Yes |

#### User Profile

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/profile/{user_id}` | Get user profile and statistics | Yes |
| GET | `/api/profile/{user_id}/summary` | Get learning progress summary | Yes |
| GET | `/api/profile/{user_id}/history` | Get recent analysis history | Yes |

#### System

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | API information and version | No |
| GET | `/health` | Health check status | No |
| GET | `/api/metrics` | System-wide metrics | Yes (Admin) |
| POST | `/admin/eval-sample` | Run evaluation on sample data | Yes (Admin) |

## Deployment

### Backend (Render.com)

1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure build settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
4. Add environment variables from `.env`
5. Deploy

### Frontend (Vercel)

1. Install Vercel CLI: `npm install -g vercel`
2. Navigate to frontend directory
3. Run: `vercel`
4. Add environment variables in Vercel dashboard
5. Deploy production: `vercel --prod`

### Database (MongoDB Atlas)

1. Create free cluster on MongoDB Atlas
2. Configure network access (allow deployment IPs)
3. Create database user with read/write permissions
4. Copy connection string to `MONGODB_URI`

### Authentication (Firebase)

1. Create Firebase project
2. Enable Email/Password and Google authentication
3. Generate service account key for backend
4. Copy web configuration for frontend
5. Add environment variables to deployments

### Gmail Integration (Production)

1. Update Google Cloud OAuth client with production URLs
2. Set production environment variables on Render
3. Update CORS origins to include production frontend
4. Test OAuth flow on production
5. Verify Gmail labels are applied correctly

## Security

### Authentication Flow

1. User authenticates with Firebase (email/password or Google)
2. Frontend receives Firebase ID token
3. Token included in Authorization header for API requests
4. Backend verifies token with Firebase Admin SDK
5. User identity extracted and validated

### Gmail Security

1. OAuth 2.0 Authorization Code flow (server-side)
2. State parameter binding prevents CSRF attacks
3. Tokens encrypted with Fernet (AES-128-CBC + HMAC)
4. Automatic token refresh before expiry
5. Tokens stored in MongoDB with encryption
6. Scoped permissions (gmail.readonly, gmail.modify)
7. HTTPS-only OAuth redirects

### Data Protection

- API keys stored in environment variables
- Firebase private keys properly escaped
- CORS configured for specific origins
- No sensitive data in version control
- MongoDB connection uses TLS encryption
- Firebase tokens expire after 1 hour
- Gmail tokens refreshed automatically

## License

MIT License

## Author

Built as a capstone project demonstrating multi-agent AI systems, full-stack development, and production-ready software engineering practices.

## Acknowledgments

- Google for Gemini API and Agent Development Kit
- MongoDB Atlas for database infrastructure
- Firebase for authentication services
- Vercel and Next.js team for frontend framework
- FastAPI team for backend framework
- The open-source community

## Contact

For questions, issues, or contributions, please open an issue on the GitHub repository.
