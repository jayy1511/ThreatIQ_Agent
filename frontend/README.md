# ThreatIQ Frontend

Modern, responsive web application for phishing detection and security training, built with Next.js 14, TypeScript, and ShadCN UI.

## Overview

The ThreatIQ frontend provides an intuitive user interface for interacting with the multi-agent phishing detection system. It implements secure authentication, real-time analysis, comprehensive dashboards, and adaptive learning features through a modern React-based architecture.

## Features

### User Authentication
- Email/password registration and login
- Google Sign-In integration via Firebase
- Protected route system with automatic redirects
- Persistent authentication state management
- Secure token handling with automatic refresh

### Analysis Interface
- Text input for suspicious messages (email, SMS, social media)
- Real-time processing with loading states
- Comprehensive results display with verdict, confidence, and explanation
- Tabbed interface for coaching, evidence, and quiz content
- Error handling with automatic fallback to public endpoint
- Responsive layout optimized for desktop and mobile

### Dashboard
- Visual statistics with Recharts integration
- Performance metrics by threat category
- Accuracy tracking with pie chart visualization
- Weak spot identification and recommendations
- Empty state handling for new users
- Interactive data exploration

### History
- Chronological view of all analyzed messages
- Filterable and sortable interaction list
- Detailed results for each past analysis
- Correctness indicators for self-assessment
- Timestamp tracking for progress review

### User Experience
- Light/dark theme toggle with system preference detection
- Smooth animations and transitions
- Accessible components following WAI-ARIA guidelines
- Mobile-responsive design with breakpoints
- Loading skeletons for improved perceived performance

## Technology Stack

### Core Framework
- **Next.js 14**: React framework with App Router for server-side rendering and routing
- **TypeScript**: Static type checking for improved developer experience and code quality
- **React 18**: UI library with concurrent features and hooks

### UI Components
- **ShadCN UI**: Accessible component library built on Radix UI primitives
- **TailwindCSS**: Utility-first CSS framework for rapid styling
- **Lucide React**: Icon library with consistent design language
- **next-themes**: Theme management with no flash of unstyled content

### Data Visualization
- **Recharts**: Composable charting library for statistics visualization
- Bar charts for category performance
- Pie charts for accuracy ratios
- Responsive containers for adaptive sizing

### Authentication & API
- **Firebase SDK**: Client-side authentication with Google provider
- **Axios**: HTTP client with request/response interceptors
- Automatic token injection for authenticated requests
- Error handling and retry logic

## Project Structure

```
frontend/
├── src/
│   ├── app/                        # Next.js app router pages
│   │   ├── layout.tsx             # Root layout with providers
│   │   ├── page.tsx               # Landing page
│   │   ├── login/
│   │   │   └── page.tsx           # Login page (email/password + Google)
│   │   ├── signup/
│   │   │   └── page.tsx           # Signup page (email/password + Google)
│   │   ├── analyze/
│   │   │   └── page.tsx           # Message analysis interface
│   │   ├── dashboard/
│   │   │   └── page.tsx           # User statistics and charts
│   │   ├── history/
│   │   │   └── page.tsx           # Past analysis history
│   │   └── profile/
│   │       └── page.tsx           # User profile and settings
│   ├── components/                 # Reusable React components
│   │   ├── Navbar.tsx             # Navigation header with auth menu
│   │   ├── ProtectedRoute.tsx     # Authentication guard wrapper
│   │   ├── theme-provider.tsx     # Theme context provider
│   │   └── ui/                    # ShadCN UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── alert.tsx
│   │       ├── badge.tsx
│   │       ├── tabs.tsx
│   │       ├── dropdown-menu.tsx
│   │       └── ... (additional components)
│   ├── context/                    # React context providers
│   │   └── AuthContext.tsx        # Authentication state management
│   ├── lib/                        # Utility functions
│   │   ├── firebase.ts            # Firebase configuration and initialization
│   │   ├── api.ts                 # API client with interceptors
│   │   └── utils.ts               # Helper functions
│   └── styles/
│       └── globals.css            # Global styles and Tailwind directives
├── public/                         # Static assets
├── .env.local.example             # Environment variable template
├── next.config.mjs                # Next.js configuration
├── tailwind.config.ts             # TailwindCSS configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Firebase project with Authentication enabled
- ThreatIQ backend running (see backend/README.md)

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

   Edit `.env.local` with your configuration:
   ```bash
   # Backend API URL
   NEXT_PUBLIC_API_URL=http://localhost:8000

   # Firebase Configuration (from Firebase Console > Project Settings)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Application will be available at http://localhost:3000

### Firebase Setup

1. **Create Firebase Project**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the wizard

2. **Enable Authentication**
   - Navigate to Authentication > Sign-in method
   - Enable "Email/Password" provider
   - Enable "Google" provider and configure OAuth consent screen

3. **Register Web App**
   - Project Settings > General > Your apps
   - Click web app icon and register new app
   - Copy configuration values to `.env.local`

4. **Update Backend**
   - Ensure backend has matching Firebase project credentials
   - Update CORS_ORIGINS to include frontend URL

### Verify Installation

1. Visit http://localhost:3000
2. Click "Sign up" and create an account
3. Navigate to Analyze page
4. Submit a test message
5. Check Dashboard for updated statistics

## Application Architecture

### Authentication Flow

```
User Action (Login/Signup)
         │
         ├──> AuthContext.signInWithEmail/signInWithGoogle
         │    └──> Firebase SDK authentication
         │
         ├──> Firebase returns ID token
         │    └──> Token stored in auth.currentUser
         │
         ├──> AuthContext updates user state
         │    └──> Components re-render with user data
         │
         └──> Protected routes check user state
              └──> Redirect to /login if null
```

### API Request Flow

```
Component calls API function (e.g., analyzeMessage)
         │
         ├──> lib/api.ts wraps Axios instance
         │    │
         │    ├──> Request interceptor
         │    │    └──> Gets current Firebase user
         │    │    └──> Retrieves fresh ID token
         │    │    └──> Adds Authorization header
         │    │
         │    └──> Sends request to backend
         │
         ├──> Backend verifies token
         │    └──> Returns response or error
         │
         └──> Component updates state with data
              └──> UI re-renders with new content
```

### State Management

The application uses React's built-in state management:

- **AuthContext**: Global authentication state (user, loading, auth functions)
- **Component State**: Local UI state (forms, loading, errors)
- **URL State**: Navigation and routing (Next.js App Router)

No external state management library (Redux, Zustand) is required due to the relatively simple state structure.

## Key Components

### AuthContext (`src/context/AuthContext.tsx`)

Provides authentication state and methods throughout the application.

**Exports:**
- `useAuth()` hook for consuming auth context
- `AuthProvider` component for wrapping app

**State:**
- `user`: Current Firebase user object or null
- `loading`: Boolean indicating auth initialization status

**Methods:**
- `signInWithGoogle()`: Initiates Google OAuth flow
- `signUpWithEmail(email, password)`: Creates new account
- `signInWithEmail(email, password)`: Authenticates existing user
- `logout()`: Signs out current user

### ProtectedRoute (`src/components/ProtectedRoute.tsx`)

Higher-order component that wraps pages requiring authentication.

**Behavior:**
- Shows loading state during auth check
- Redirects to /login if user is null
- Renders children if user is authenticated

**Usage:**
```tsx
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

### Navbar (`src/components/Navbar.tsx`)

Responsive navigation header with theme toggle and user menu.

**Features:**
- Logo and branding
- Conditional navigation links based on auth status
- Dropdown menu for authenticated users
- Theme toggle button
- Mobile-responsive with hidden elements on small screens

### API Client (`src/lib/api.ts`)

Centralized API client with authentication integration.

**Configuration:**
- Base URL from environment variable
- JSON content-type header
- Request interceptor for token injection

**Exported Functions:**
- `analyzeMessage(message, userGuess, userId)`
- `analyzePublicMessage(message, userGuess, userId)`
- `getUserProfile(userId)`
- `getUserSummary(userId)`
- `getUserHistory(userId)` (added in recent update)

**Error Handling:**
- Automatic retry on 401 Unauthorized (token refresh)
- Console logging for debugging
- Propagates errors to calling components

## Pages

### Landing Page (`src/app/page.tsx`)

Public homepage introducing ThreatIQ features.

**Sections:**
- Hero with call-to-action buttons
- Feature showcase with icons
- Value proposition for security awareness

**Interactions:**
- "Start Analysis" → `/analyze`
- "Sign In" → `/login`
- "Sign Up" → `/signup`

### Login Page (`src/app/login/page.tsx`)

Authentication page with multiple sign-in methods.

**Features:**
- Email/password form with validation
- Google Sign-In button
- Error message display
- Link to signup page
- Loading states for both methods
- Auto-redirect to dashboard on success

### Signup Page (`src/app/signup/page.tsx`)

User registration with account creation.

**Features:**
- Email/password form with confirmation
- Password matching validation
- Google Sign-Up button
- Error message display
- Link to login page
- Auto-redirect to dashboard on success

### Analyze Page (`src/app/analyze/page.tsx`)

Main interface for message analysis.

**Layout:**
- Two-column responsive grid
- Left: Message input and tips
- Right: Results display and tabs

**Features:**
- Multi-line text area for message input
- Analyze button with loading state
- Results with color-coded verdict (red=phishing, green=safe, yellow=unclear)
- Tabbed content: AI Coach, Evidence, Quiz
- Error alert for failed analyses
- Fallback to public endpoint if auth fails

**Results Structure:**
- **Verdict Card**: Label, confidence, explanation, reason tags
- **Coach Tab**: Personalized explanation and safety tips
- **Evidence Tab**: Similar phishing examples with similarity scores
- **Quiz Tab**: Interactive multiple-choice question

### Dashboard Page (`src/app/dashboard/page.tsx`)

User statistics and progress visualization.

**Metrics Cards:**
- Total messages analyzed
- Accuracy percentage
- Correct guesses count
- Current streak

**Charts:**
- Bar chart: Performance by threat category (seen vs mistakes)
- Pie chart: Overall accuracy (correct vs incorrect)

**Tabs:**
- Overview: Visual charts
- Analytics: Weak spots with recommendations

**Empty States:**
- Shows placeholders when no data available
- Encourages users to analyze messages

### History Page (`src/app/history/page.tsx`)

Chronological list of past analyses.

**Features:**
- Sorted by timestamp (newest first)
- Each item shows:
  - Message preview (truncated)
  - Classification label and confidence
  - Timestamp
  - Correctness indicator
- Full message text in expandable card
- Empty state for new users

### Profile Page (`src/app/profile/page.tsx`)

User account information and settings.

**Features:**
- Display name and email
- Firebase user ID
- Account creation date
- Logout button
- (Future: Settings and preferences)

## Styling

### TailwindCSS Configuration

The application uses a custom Tailwind configuration with:

**Colors:**
- CSS variables for theme compatibility
- Light/dark mode variants
- Semantic naming (background, foreground, primary, accent, muted, destructive)

**Typography:**
- System font stack with fallbacks
- Responsive font sizes
- Consistent line heights

**Animations:**
- Accordion expand/collapse
- Fade in/out transitions
- Skeleton loading shimmer

### Component Styling Patterns

**Cards:**
```tsx
<Card className="border-l-4 border-l-red-500">
  {/* Left border accent for phishing verdict */}
</Card>
```

**Responsive Typography:**
```tsx
<h1 className="text-2xl sm:text-3xl lg:text-4xl">
  {/* Scales with viewport */}
</h1>
```

**Theme-Aware Colors:**
```tsx
<div className="bg-background text-foreground dark:bg-slate-900">
  {/* Adapts to theme */}
</div>
```

## Development

### Running Locally

```bash
# Development with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Adding New Pages

1. Create file in `src/app/[route]/page.tsx`
2. Export default React component
3. Add navigation link in `Navbar.tsx` if needed
4. Add to protected routes if auth required

### Adding UI Components

Using ShadCN UI:

```bash
# Add new component (e.g., dialog)
npx shadcn-ui@latest add dialog

# Component will be added to src/components/ui/
```

### Environment Variables

All public environment variables must be prefixed with `NEXT_PUBLIC_`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=...
```

Access in code:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

## Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from frontend directory**
   ```bash
   cd frontend
   vercel
   ```

4. **Add environment variables**
   - Go to Vercel dashboard > Project Settings > Environment Variables
   - Add all `NEXT_PUBLIC_*` variables
   - Set `NEXT_PUBLIC_API_URL` to production backend URL

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

### Netlify Deployment

1. **Build settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment variables**
   - Add all `NEXT_PUBLIC_*` variables in Netlify dashboard

3. **Deploy**
   - Connect GitHub repository
   - Trigger deployment

### Custom Server Deployment

```bash
# Build production bundle
npm run build

# Start Next.js server
npm start
```

Ensure Node.js runtime is available on hosting platform.

## Performance Optimization

### Implemented Optimizations

1. **Next.js Automatic Optimizations**
   - Code splitting per route
   - Image optimization (if using next/image)
   - Font optimization with next/font

2. **Component-Level**
   - Lazy loading of heavy components
   - Memoization of expensive computations
   - Debouncing of input handlers

3. **API Efficiency**
   - Token caching to reduce Firebase calls
   - Request deduplication in Axios
   - Optimistic UI updates where applicable

### Performance Metrics

Target Lighthouse scores:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

## Accessibility

### WCAG 2.1 Compliance

- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Readers**: Semantic HTML and ARIA labels throughout
- **Color Contrast**: Meets AA standard for text readability
- **Focus Indicators**: Visible focus rings on all focusable elements

### Implemented Features

- Alt text for informational icons
- Form labels properly associated with inputs
- Error messages announced to screen readers
- Skip navigation links for keyboard users

## Browser Support

Tested and supported in:
- Chrome 90+ (desktop and mobile)
- Firefox 88+ (desktop and mobile)
- Safari 14+ (desktop and mobile)
- Edge 90+ (desktop)

## Troubleshooting

### Firebase Authentication Errors

**Issue:** "Firebase: Error (auth/configuration-not-found)"  
**Fix:** Ensure all Firebase environment variables are set correctly

**Issue:** "Firebase: Error (auth/popup-closed-by-user)"  
**Fix:** User closed Google Sign-In popup; retry authentication

### API Connection Issues

**Issue:** Network error when calling backend  
**Fix:** Verify `NEXT_PUBLIC_API_URL` matches running backend, check CORS configuration

**Issue:** 401 Unauthorized responses  
**Fix:** Firebase token expired; logout and login again

### Build Errors

**Issue:** "Module not found" during build  
**Fix:** Run `npm install` to ensure all dependencies are installed

**Issue:** Environment variables not available  
**Fix:** Prefix with `NEXT_PUBLIC_` and restart dev server

## Security Considerations

1. **Never commit** `.env.local` to version control
2. **Validate user input** on both client and server
3. **Use HTTPS** in production for all API calls
4. **Implement CSP headers** for XSS protection
5. **Regular dependency updates** to patch vulnerabilities

## Future Enhancements

- Real-time updates with WebSocket connections
- Offline support with Progressive Web App (PWA)
- Advanced filtering and search in history
- Export analysis results to PDF
- Customizable coaching intensity levels
- Social features (leaderboards, sharing)

## License

MIT License

## Contributing

This is a capstone project. For questions or issues, please open a GitHub issue.
