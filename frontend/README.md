# ThreatIQ Frontend

Next.js 14 application providing the user interface for phishing detection, Gmail integration, and daily security lessons.

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **UI Components** | ShadCN UI (Radix primitives) |
| **Styling** | TailwindCSS |
| **Auth** | Firebase SDK |
| **Charts** | Recharts |
| **HTTP Client** | Axios |
| **Theme** | next-themes (dark/light) |

## Directory Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   ├── analyze/           # Message analysis interface
│   │   ├── dashboard/         # Stats + Gmail integration
│   │   ├── lessons/today/     # Daily micro-lesson
│   │   ├── history/           # Analysis history
│   │   ├── profile/           # User profile
│   │   └── layout.tsx         # Root layout with providers
│   ├── components/
│   │   ├── Navbar.tsx         # Navigation header
│   │   ├── GmailIntegration.tsx # Gmail triage UI
│   │   ├── ProtectedRoute.tsx # Auth guard
│   │   └── ui/                # ShadCN components
│   ├── context/
│   │   └── AuthContext.tsx    # Firebase auth state
│   ├── lib/
│   │   ├── api.ts             # Axios client with auth
│   │   ├── firebase.ts        # Firebase config
│   │   └── utils.ts           # Helper functions
│   └── types/
│       └── gmail.ts           # TypeScript definitions
├── public/                     # Static assets
├── tailwind.config.ts
└── package.json
```

## Quick Start

```bash
npm install
cp .env.local.example .env.local  # Configure Firebase
npm run dev
```

Frontend runs at `http://localhost:3000`

## Environment Variables

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Pages

| Route | Description | Auth |
|-------|-------------|------|
| `/` | Landing page | No |
| `/login` | Email/password + Google Sign-In | No |
| `/signup` | Account creation | No |
| `/analyze` | Submit message for AI analysis | Yes |
| `/dashboard` | Performance stats, Gmail card | Yes |
| `/lessons/today` | Daily micro-lesson with quiz | Yes |
| `/history` | Past analysis results | Yes |
| `/profile` | User stats and weak spots | Yes |

## Features

### Analysis Interface
- Text input for suspicious messages
- User guess selection (Safe/Suspicious/Phishing)
- Real-time AI analysis with loading states
- Detailed results: classification, confidence, reason tags
- Interactive quiz questions
- Similar real-world examples

### Gmail Integration
- OAuth 2.0 secure connection
- Configurable triage (message limit, auto-actions)
- Batch email processing
- Color-coded results (green/yellow/red)
- Confidence scores and reason tags

### Daily Lessons
- Read 2-3 min lesson content
- 3-question quiz with instant feedback
- XP rewards based on score
- Level and streak tracking
- 7-day activity calendar

### Dashboard
- Performance charts (Recharts)
- Accuracy by phishing category
- Weak spot identification
- Gmail integration card
- XP/level display

## Key Components

| Component | Purpose |
|-----------|---------|
| `Navbar` | Navigation, theme toggle, user menu |
| `ProtectedRoute` | Auth guard with redirect |
| `GmailIntegration` | OAuth flow, triage UI, results |
| `ui/*` | ShadCN primitives (Button, Card, etc.) |

## API Client

The Axios client (`lib/api.ts`) automatically:
- Attaches Firebase ID token to requests
- Handles token refresh
- Manages error responses

## Scripts

```bash
npm run dev       # Development server
npm run build     # Production build
npm run lint      # ESLint
npm run start     # Start production server
```

## Deployment (Vercel)

```bash
vercel --prod
```

Add environment variables in Vercel dashboard:
- All `NEXT_PUBLIC_*` variables
- Update `NEXT_PUBLIC_API_URL` to production backend URL

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Firebase auth errors | Check API keys, ensure auth methods enabled |
| API connection fails | Verify `NEXT_PUBLIC_API_URL`, check CORS |
| Gmail OAuth fails | Check redirect URIs, add test users |
| Build errors | Run `npm run lint`, check env vars |

## License

MIT
