# ThreatIQ - Multi-Agent Phishing Detection System

An intelligent phishing detection and security training platform leveraging Google's Agent Development Kit (ADK) and modern web technologies. Built as a capstone project demonstrating production-ready multi-agent AI systems.

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Performance](#performance)
- [Security](#security)
- [Future Work](#future-work)

## Problem Statement

Phishing attacks remain one of the most prevalent cyber threats, with attackers constantly evolving their tactics to deceive users. Traditional detection systems often fail to provide the educational context needed for users to improve their security awareness. There is a need for an intelligent system that not only detects phishing attempts but also teaches users to recognize them independently through personalized, adaptive training.

## Solution

ThreatIQ addresses this challenge through a multi-agent AI system that combines real-time phishing detection with personalized security coaching. The platform analyzes suspicious messages, provides detailed classification results, and generates adaptive educational content based on each user's performance patterns.

### Core Capabilities

1. **Intelligent Detection**: Multi-agent system analyzes messages using natural language processing and pattern matching to identify phishing indicators with confidence scores and detailed explanations.

2. **Personalized Learning**: Tracks individual user performance, identifies weak spots in security awareness, and adapts coaching strategies based on historical interaction data.

3. **Evidence-Based Training**: Retrieves similar real-world phishing examples from a curated dataset to provide concrete, relatable training material.

4. **Interactive Assessment**: Generates contextual quizzes and safety tips to reinforce learning and measure comprehension.

5. **Progress Tracking**: Maintains comprehensive user profiles with performance metrics, category-specific statistics, and learning trajectory visualization.

### Agent Workflow

The system implements a sequential multi-agent workflow coordinated by the root orchestrator:

1. **Classification Phase**: The Classifier Agent receives the input message and analyzes it for phishing indicators using Gemini 2.0 Flash. It returns a structured classification with label (phishing/safe/unclear), confidence score, reason tags, and explanation.

2. **Evidence Retrieval Phase**: The Evidence Agent searches the phishing dataset using TF-IDF vectorization to find the top 3 most similar historical examples based on the classified label.

3. **Memory Management Phase**: The Memory Agent retrieves the user's profile from MongoDB, calculates the correctness of their guess (if provided), and updates performance statistics including category-specific metrics and weak spot detection.

4. **Coaching Phase**: The Coach Agent synthesizes all previous outputs to generate personalized educational content, including explanations tailored to the user's knowledge level, actionable safety tips, similar examples with context, and an interactive quiz question.

5. **Session Persistence**: The orchestrator logs the complete interaction to MongoDB for future analysis and evaluation, maintaining session continuity through the InMemorySessionService pattern.

### Custom ADK Tools

The system implements five custom tools following the Google ADK specification:

- **load_dataset**: Loads and preprocesses the phishing dataset with TF-IDF vectorization
- **search_similar_messages**: Performs similarity search using cosine similarity on TF-IDF vectors
- **get_user_profile**: Retrieves user profile data from MongoDB with fallback creation
- **update_user_profile**: Updates performance statistics and weak spot analysis
- **log_interaction**: Records complete interaction history for observability and evaluation

## Key Features

### For End Users

- **Real-Time Analysis**: Submit suspicious emails, SMS, or social media messages for instant AI-powered analysis
- **Detailed Results**: Receive comprehensive reports including threat classification, confidence scores, reason tags, and detailed explanations
- **Learning Dashboard**: Track progress with visual charts showing accuracy rates, category performance, and improvement trends
- **Personalized Coaching**: Get adaptive tips and explanations based on individual weak spots and learning history
- **Interactive Quizzes**: Test knowledge with contextually generated questions related to analyzed threats
- **History Review**: Access complete analysis history with timestamps and correctness indicators
- **Theme Support**: Choose between light and dark modes for comfortable viewing

### For Administrators

- **System Metrics**: Monitor total users, message volume, interaction counts, and average accuracy
- **Model Evaluation**: Run automated evaluation on sample interactions to assess classifier performance
- **Observability**: Access structured logs with session tracing for debugging and performance analysis
- **User Analytics**: View aggregated statistics on common weak spots and learning patterns

## Technology Stack

### Backend

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | FastAPI 0.109.0 | High-performance async API server |
| Agent System | Google ADK (genai-agents) | Multi-agent orchestration and LLM integration |
| Language Model | Gemini 2.0 Flash | Natural language understanding and generation |
| Database | MongoDB Atlas (Motor 3.3.2) | User profiles and interaction history |
| Authentication | Firebase Admin SDK | Token verification and user management |
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
| Vercel | Frontend hosting | Free hobby plan |
| Render/Railway | Backend hosting | Free tier |

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
│   │   │   ├── metrics.py         # System metrics
│   │   │   └── eval.py            # Model evaluation
│   │   └── tools/                 # Custom ADK tools
│   │       ├── adk_tools.py       # Core tool implementations
│   │       ├── dataset_tools.py   # Dataset management
│   │       └── profile_tools.py   # Profile utilities
│   ├── data/                      # Phishing dataset (CSV)
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example              # Environment template
│   └── README.md                 # Backend documentation
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js app router pages
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── login/            # Login page
│   │   │   ├── signup/           # Signup page
│   │   │   ├── analyze/          # Analysis interface
│   │   │   ├── dashboard/        # User dashboard
│   │   │   ├── history/          # Analysis history
│   │   │   ├── profile/          # User profile
│   │   │   └── layout.tsx        # Root layout
│   │   ├── components/            # Reusable components
│   │   │   ├── Navbar.tsx        # Navigation header
│   │   │   ├── ProtectedRoute.tsx# Auth guard
│   │   │   ├── theme-provider.tsx# Theme context
│   │   │   └── ui/               # ShadCN components
│   │   ├── context/               # React contexts
│   │   │   └── AuthContext.tsx   # Authentication state
│   │   └── lib/                   # Utilities
│   │       ├── firebase.ts       # Firebase configuration
│   │       └── api.ts            # API client
│   ├── public/                    # Static assets
│   ├── package.json              # Node dependencies
│   ├── .env.local.example        # Environment template
│   └── README.md                 # Frontend documentation
└── README.md                     # This file
```

## Setup Instructions

### Prerequisites

Before starting, ensure you have:

- Python 3.9 or higher
- Node.js 18 or higher
- Git
- A MongoDB Atlas account (free tier)
- A Firebase project
- A Google AI Studio API key

### Backend Setup

1. **Clone the repository**
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
   
   Edit `.env` and add your credentials:
   - `GEMINI_API_KEY`: From [Google AI Studio](https://makersuite.google.com/app/apikey)
   - `MONGODB_URI`: From MongoDB Atlas connection string
   - `MONGODB_DB_NAME`: Your database name (e.g., "threatiq")
   - `FIREBASE_PROJECT_ID`: From Firebase project settings
   - `FIREBASE_PRIVATE_KEY`: From Firebase service account JSON
   - `FIREBASE_CLIENT_EMAIL`: From Firebase service account JSON

5. **Start the server**
   ```bash
   uvicorn app.main:app --reload
   ```
   
   Backend will be available at http://localhost:8000

### Frontend Setup

1. **Navigate to frontend directory**
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
   - `NEXT_PUBLIC_FIREBASE_API_KEY`: From Firebase project settings
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: From Firebase project settings
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: From Firebase project settings
   - Additional Firebase configuration values

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   Frontend will be available at http://localhost:3000

### Verification

1. Access the frontend at http://localhost:3000
2. Create an account using email/password or Google Sign-In
3. Navigate to the Analyze page and submit a test message
4. Check the Dashboard to see updated statistics
5. Review the API documentation at http://localhost:8000/docs

## API Documentation

### Interactive Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Core Endpoints

#### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information and version |
| GET | `/health` | Health check status |
| POST | `/api/analyze-public` | Public analysis (no auth required) |

#### Protected Endpoints (Require Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Full analysis with profile tracking |
| GET | `/api/profile/{user_id}` | Get user profile and statistics |
| GET | `/api/profile/{user_id}/summary` | Get learning progress summary |
| GET | `/api/profile/{user_id}/history` | Get recent analysis history |
| GET | `/api/metrics` | System-wide metrics (admin) |
| POST | `/admin/eval-sample` | Run evaluation on sample data |

### Example Request

```bash
curl -X POST "http://localhost:8000/api/analyze-public" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "URGENT: Your account will be suspended unless you verify now at http://fake-bank.com",
    "user_guess": "phishing",
    "user_id": "test_user"
  }'
```

### Example Response

```json
{
  "classification": {
    "label": "phishing",
    "confidence": 0.95,
    "reason_tags": ["urgency", "suspicious_link", "threatening_language"],
    "explanation": "This message exhibits multiple phishing indicators including urgent language, threats of account suspension, and a suspicious URL that does not match legitimate banking domains."
  },
  "similar_examples": [
    {
      "message": "ALERT: Verify your account immediately...",
      "category": "fake_bank",
      "similarity": 0.87
    }
  ],
  "coach_response": {
    "explanation": "This is a classic phishing attempt...",
    "tips": [
      "Always verify URLs before clicking",
      "Legitimate banks never request urgent action via email"
    ],
    "quiz": {
      "question": "What is the main red flag in this message?",
      "options": ["Spelling errors", "Urgent threatening tone", "Poor grammar"],
      "correct_answer": "Urgent threatening tone"
    }
  },
  "user_performance": {
    "was_correct": true,
    "total_analyzed": 15,
    "accuracy": 0.87
  }
}
```

## Deployment

### Backend Deployment (Render.com)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure build settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
4. Add environment variables from `.env`
5. Deploy

### Frontend Deployment (Vercel)

1. Install Vercel CLI: `npm install -g vercel`
2. Navigate to frontend directory
3. Run: `vercel`
4. Add environment variables in Vercel dashboard
5. Deploy production: `vercel --prod`

### Database Setup (MongoDB Atlas)

1. Create a free cluster on MongoDB Atlas
2. Configure network access (allow your deployment IPs)
3. Create database user with read/write permissions
4. Copy connection string to `MONGODB_URI` environment variable

### Authentication Setup (Firebase)

1. Create Firebase project
2. Enable Email/Password and Google authentication
3. Generate service account key for backend
4. Copy web configuration for frontend
5. Add environment variables to both deployments

## Performance

### Response Times

- Cold start (first request): 2-5 seconds
- Classifier agent: ~1 second
- Complete multi-agent workflow: 3-5 seconds
- Database queries: <100ms
- Frontend page load: <2 seconds

### Rate Limits

- Gemini API (free tier): 15 requests per minute
- MongoDB Atlas (free tier): No hard limit, 512MB storage
- Firebase Auth (free tier): No hard limit, adequate for testing

### Optimization Techniques

- TF-IDF vectors pre-computed and cached
- MongoDB indexes on user_id and timestamp fields
- Next.js automatic code splitting and optimization
- Firebase token caching with refresh logic
- Async/await throughout for non-blocking I/O

## Security

### Authentication Flow

1. User authenticates with Firebase (email/password or Google)
2. Frontend receives Firebase ID token
3. Token included in Authorization header for API requests
4. Backend verifies token with Firebase Admin SDK
5. User identity extracted and validated against request data

### Data Protection

- API keys stored in environment variables
- Firebase private keys properly escaped
- CORS configured for specific origins
- No sensitive data in version control
- MongoDB connection uses TLS encryption
- Firebase tokens expire after 1 hour

### Input Validation

- Pydantic schemas validate all API requests
- Message content sanitized before processing
- User IDs validated against authentication context
- SQL injection not applicable (NoSQL database)

## Capstone Requirements Coverage

This project fulfills all capstone requirements for multi-agent AI systems:

| Requirement | Implementation |
|-------------|----------------|
| **Multi-agent system** | Five specialized agents (Classifier, Evidence, Memory, Coach) coordinated by Orchestrator using Google ADK |
| **LLM integration** | Gemini 2.0 Flash for classification and coaching with structured prompts and JSON outputs |
| **Custom tools** | Five ADK tools for dataset search, profile management, and interaction logging |
| **Sessions & Memory** | InMemorySessionService pattern for workflow state, MongoDB for long-term user persistence |
| **Observability** | Structured logging with session IDs, request/response tracking, and error monitoring |
| **Agent evaluation** | Evaluation endpoint with Gemini-powered assessment of classification accuracy |

## Future Work

### Planned Enhancements

- **Expanded Dataset**: Integrate additional phishing datasets from PhishTank and OpenPhish APIs
- **Advanced Analytics**: Add time-series analysis of user improvement and prediction of risk areas
- **Team Features**: Multi-user organizations with admin dashboards and team leaderboards
- **Browser Extension**: Real-time analysis of emails and websites before user interaction
- **Mobile Application**: Native iOS/Android apps with push notification alerts
- **A/B Testing**: Experiment with different coaching strategies to optimize learning outcomes
- **Multilingual Support**: Extend phishing detection and coaching to additional languages
- **API Webhooks**: Allow integration with security tools and SIEM systems

### Research Directions

- Fine-tuning specialized models on domain-specific phishing corpus
- Reinforcement learning from human feedback (RLHF) to improve coaching effectiveness
- Adversarial testing to evaluate robustness against sophisticated attacks
- Explainable AI techniques to provide more transparent decision-making

## License

MIT License - See LICENSE file for full text

## Author

Built as a capstone project demonstrating multi-agent AI systems, full-stack development, and production-ready software engineering practices.

## Acknowledgments

This project leverages several open-source technologies and cloud services:

- Google for the Gemini API and Agent Development Kit
- MongoDB Atlas for database infrastructure
- Firebase for authentication services
- Vercel and Next.js team for frontend framework
- FastAPI team for backend framework
- The open-source community for countless libraries and tools

## Contact

For questions, issues, or contributions, please open an issue on the GitHub repository.
