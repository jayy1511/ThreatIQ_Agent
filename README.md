# ThreatIQ - AI Phishing Detection Platform

An intelligent phishing detection system using multi-agent AI architecture with Gmail integration and gamified security training.

## Features

### Multi-Agent AI Analysis
Four specialized agents collaborate to analyze suspicious messages:

| Agent | Role |
|-------|------|
| **Classifier** | Gemini AI-powered classification with confidence scores and reason tags |
| **Evidence** | TF-IDF similarity search to find related real-world phishing examples |
| **Memory** | Manages user profiles, tracks performance, and identifies weak spots |
| **Coach** | Generates personalized tips, explanations, and interactive quizzes |

### Gmail Integration
- OAuth 2.0 secure connection with encrypted token storage
- Batch triage of up to 50 unread emails
- Auto-labeling: `ThreatIQ/Safe`, `ThreatIQ/Suspicious`, `ThreatIQ/Phishing`
- Optional: auto-archive safe emails, mark phishing as spam

### Daily Micro-Lessons
- 12 curated cybersecurity lessons (passwords, 2FA, phishing, social engineering, etc. for now we only have 12 lessons but we can add more later)
- 3-question quiz per lesson with instant feedback
- XP rewards (10-50 XP based on score)
- Level progression and streak tracking
- 7-day activity calendar

### Learning Dashboard
- Performance statistics with charts (Recharts)
- Category-specific accuracy tracking
- Weak spot identification
- Analysis history with correctness indicators

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 14, TypeScript, TailwindCSS, ShadCN UI, Recharts |
| **Backend** | FastAPI, Python 3.11, Google Gemini API, scikit-learn |
| **Auth** | Firebase (Email/Password + Google Sign-In) |
| **Database** | MongoDB Atlas (free tier) |
| **Hosting** | Vercel (frontend), Render (backend) |

## Project Structure

```
ThreatIQ_Agent/
├── frontend/                 # Next.js 14 web app
│   ├── src/app/             # Pages (analyze, dashboard, lessons, history)
│   ├── src/components/      # UI components (Navbar, GmailIntegration)
│   └── src/lib/             # API client, Firebase config
├── backend/                  # FastAPI Gateway (port 8000)
│   ├── app/agents/          # Classifier, Evidence, Memory, Coach
│   ├── app/routers/         # API endpoints (analysis, gmail, lessons, profile)
│   ├── app/services/        # Gmail OAuth, crypto, triage
│   └── app/data/            # Lessons content
├── services/
│   └── analysis-service/    # Stateless AI microservice (port 8010)
├── mobile/                   # Expo React Native app
│   ├── app/                 # Expo Router screens
│   └── src/                 # Components, lib, theme
├── docs/                     # Architecture documentation
└── docker-compose.yml        # Local microservices orchestration
```

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB Atlas account
- Firebase project
- Google AI Studio API key

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
cp .env.example .env         # Configure your keys
uvicorn app.main:app --reload
```
Backend runs at `http://localhost:8000`

### Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local  # Configure Firebase
npm run dev
```
Frontend runs at `http://localhost:3000`

### Mobile App (Expo)
```bash
cd mobile
npm install
cp .env.example .env             # Configure Firebase + API URL
npx expo start                   # Scan QR with Expo Go
```

**Build APK:**
```bash
eas build -p android --profile preview
```

### Mobile (PWA)
The web app is also installable on mobile devices:
1. Open the deployed Vercel URL on your phone
2. Install via browser menu: **"Add to Home Screen"** (iOS) or **"Install App"** (Android)
3. Runs as standalone app with offline support

## Environment Variables

### Backend (.env)
```bash
# Required
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
MONGODB_DB_NAME=threatiq

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@project.iam.gserviceaccount.com

# Gmail OAuth (optional)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/gmail/callback
TOKEN_ENCRYPTION_KEY=your_fernet_key  # Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# CORS
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## API Endpoints

### Analysis
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/analyze` | Full analysis with profile tracking | Yes |
| POST | `/api/analyze-public` | Demo analysis (no auth) | No |

### Gmail Integration
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gmail/connect` | Get OAuth URL |
| GET | `/api/gmail/status` | Check connection |
| POST | `/api/gmail/triage` | Run inbox triage |
| POST | `/api/gmail/disconnect` | Revoke tokens |

### Daily Lessons
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lessons/today` | Get today's lesson |
| POST | `/api/lessons/complete` | Submit quiz answers |
| GET | `/api/lessons/progress` | Get XP, level, streaks |

### User Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/{user_id}` | Profile & stats |
| GET | `/api/profile/{user_id}/history` | Analysis history |

**Interactive Docs:** `http://localhost:8000/docs`

## CI/CD

GitHub Actions runs on every push/PR:
- **Frontend:** `npm ci` → `npm run lint` → `npm run build`
- **Backend:** `pip install` → `python -m compileall` → `pytest`

Deployment auto-triggers on `main` branch merge.

## Deployment

### Frontend → Vercel
```bash
vercel --prod
```
Add `NEXT_PUBLIC_*` env vars in Vercel dashboard.

### Backend → Render
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
- Add all `.env` variables in Render dashboard.

## Security

- Firebase ID tokens for all protected endpoints
- Gmail OAuth tokens encrypted with Fernet (AES-128)
- Server-side token exchange (frontend never sees OAuth tokens)
- CORS restricted to specific origins
- MongoDB TLS encryption

## License

MIT

## Author

Built with love by Jay & Eman 
