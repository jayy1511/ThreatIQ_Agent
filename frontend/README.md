# ThreatIQ Frontend

Next.js 14 application providing the user interface for ThreatIQ phishing detection and Gmail integration.

## Architecture

### Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **UI**: ShadCN UI components with Tailwind CSS
- **Authentication**: Firebase SDK
- **State Management**: React Context API
- **HTTP Client**: Axios with request interceptors
- **Charts**: Recharts for data visualization
- **Theme**: next-themes for dark/light mode

### Directory Structure

```
frontend/
├── src/
│   ├── app/                   # Next.js app router pages
│   │   ├── page.tsx          # Landing page
│   │   ├── login/            # Login page
│   │   ├── signup/           # Signup page
│   │   ├── analyze/          # Message analysis interface
│   │   ├── dashboard/        # User dashboard with Gmail integration
│   │   ├── history/          # Analysis history viewer
│   │   ├── profile/          # User profile page
│   │   └── layout.tsx        # Root layout with providers
│   ├── components/            # Reusable components
│   │   ├── Navbar.tsx        # Navigation header
│   │   ├── GmailIntegration.tsx # Gmail triage UI
│   │   ├── ProtectedRoute.tsx# Authentication guard
│   │   ├── theme-provider.tsx# Theme context provider
│   │   └── ui/               # ShadCN UI components
│   ├── context/               # React context providers
│   │   └── AuthContext.tsx   # Firebase authentication state
│   ├── types/                 # TypeScript type definitions
│   │   └── gmail.ts          # Gmail API response types
│   └── lib/                   # Utility functions
│       ├── firebase.ts       # Firebase configuration
│       └── api.ts            # Axios API client
├── public/                    # Static assets
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── next.config.js            # Next.js configuration
└── .env.local.example        # Environment variable template
```

## Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Backend API running
- Firebase project configured

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Required variables:
   ```bash
   # Backend API
   NEXT_PUBLIC_API_URL=http://localhost:8000
   
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   Application runs on http://localhost:3000

## Features

### Authentication

- Email/password authentication via Firebase
- Google Sign-In integration
- Protected routes with automatic redirection
- Persistent authentication state
- Automatic token refresh

### Analysis Interface

- Text input for suspicious messages
- User guess selection (Safe/Suspicious/Phishing)
- Real-time AI analysis with loading states
- Detailed results with confidence scores
- Reason tags and explanations
- Interactive quiz questions
- Similar example messages

### Gmail Integration

- OAuth 2.0 connection flow
- Real-time connection status display
- Configurable triage settings (message limit, options)
- Batch email processing
- Results display with label badges
- Color-coded classification (Green/Yellow/Red)
- Confidence scores and reason tags
- Error handling with user feedback

### Dashboard

- Performance statistics with charts
- Accuracy tracking over time
- Category-specific performance breakdown
- Weak spot identification
- Gmail integration card
- OAuth callback handling with toast notifications

### History

- Chronological analysis history
- Filtering and search capabilities
- Correctness indicators
- Category badges
- Expandable details

### Profile

- User information display
- Performance statistics
- Learning progress tracking
- Category-specific weak spots

## Components

### Core Components

**Navbar**
- Responsive navigation with mobile menu
- Theme toggle (light/dark)
- User authentication status
- Profile dropdown

**ProtectedRoute**
- Authentication guard wrapper
- Automatic redirect to login
- Loading state handling

**GmailIntegration**
- OAuth connection management
- Triage configuration UI
- Results display with badges
- Status indicators
- Disconnect functionality

### UI Components (ShadCN)

- Button
- Card
- Input
- Label
- Select
- Textarea
- Badge
- Alert
- Dropdown Menu
- Tabs
- Separator
- Avatar
- Dialog

## API Integration

### API Client (lib/api.ts)

The Axios client automatically:
- Attaches Firebase ID token to requests
- Handles token refresh
- Includes proper headers
- Manages error responses

### Gmail API Functions

```typescript
// Connection management
getGmailStatus() -> { connected, email, scopes }
getGmailConnectUrl() -> { url }
disconnectGmail() -> { ok }

// Triage operations
runGmailTriage({ limit, mark_spam, archive_safe }) -> { processed, results }
getGmailHistory(limit) -> { items }

// Analysis
analyzeMessage({ message, user_guess }) -> { classification, coach_response }

// Profile
getUserProfile(userId) -> { profile, stats }
getUserHistory(userId) -> { history }
```

## Styling

### Tailwind CSS

Utility-first CSS framework with custom configuration:

- Custom color palette
- Dark mode support
- Responsive breakpoints
- Custom animations
- Typography utilities

### Theme Support

- System preference detection
- Manual light/dark toggle
- Persistent theme selection
- CSS variable-based theming

### Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexible grid layouts
- Collapsible navigation
- Adaptive components

## Development

### Running Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

## Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add environment variables in Vercel dashboard**
   - Go to Project Settings > Environment Variables
   - Add all `NEXT_PUBLIC_*` variables
   - Deploy production: `vercel --prod`

### Environment Variables (Production)

Update `.env.local` for production:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
# Keep Firebase config same as development
```

### Build Optimization

Next.js automatically:
- Server-side renders pages
- Generates static pages where possible
- Code splits by route
- Optimizes images
- Minifies JavaScript and CSS

## Troubleshooting

### Common Issues

**Firebase authentication errors**

- Verify Firebase project configuration
- Check API keys are correct
- Ensure authentication methods enabled in Firebase Console

**API connection failures**

- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings on backend
- Ensure backend is running and accessible

**Build errors**

- Run `npm run type-check` to find TypeScript errors
- Check for unused imports
- Verify all environment variables are set

**Gmail OAuth not working**

- Check Google Cloud Console redirect URIs
- Verify user is in test users list
- Ensure frontend URL matches authorized origins

## Security

### Authentication

- Firebase ID tokens in Authorization header
- Tokens automatically refreshed
- Protected routes require authentication
- No sensitive data in localStorage

### Data Handling

- No OAuth tokens stored in frontend
- API keys use `NEXT_PUBLIC_` prefix (safe for client)
- User data fetched only when authenticated
- HTTPS enforced in production

## Performance

### Optimization Techniques

- Lazy loading for heavy components
- Image optimization with Next.js Image component
- Code splitting by route
- React.memo for expensive renders
- Debounced search inputs
- Efficient state management

### Lighthouse Scores (Target)

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

## License

MIT License

## Contact

For frontend-specific issues, please open an issue on the GitHub repository.
