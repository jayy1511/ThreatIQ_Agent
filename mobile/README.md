# ThreatIQ Mobile

React Native mobile app for ThreatIQ phishing detection platform.

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app (for testing on physical device)
- EAS CLI (for building APK)

## Setup

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your values (see "Configuration" below).

3. **Start development:**
   ```bash
   npx expo start
   ```
   Scan QR code with Expo Go app.

## Configuration

Edit `.env` file with your values:

```bash
# Gateway API URL (your Render deployment)
EXPO_PUBLIC_API_BASE_URL=https://threatiq-gateway-service.onrender.com

# Firebase Client Config (from Firebase Console)
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Building APK

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Initialize EAS (first time only):**
   ```bash
   eas init
   ```

4. **Build APK:**
   ```bash
   eas build -p android --profile preview
   ```

The APK will be available for download from Expo dashboard.

## Project Structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth screens (login, register)
│   ├── (tabs)/            # Main tab screens
│   └── _layout.tsx        # Root layout with auth guard
├── src/
│   ├── components/        # Reusable UI components
│   ├── lib/               # Config, Firebase, Auth context
│   └── theme/             # Colors and styling
├── app.config.js          # Expo configuration
└── eas.json               # EAS build profiles
```

## Features

### Implemented ✅
- Expo + TypeScript + expo-router
- Dark theme matching web app
- Firebase email/password auth
- Auth guard (login required)
- Full API client with all endpoints
- **Dashboard**: Stats, quick analyze, lesson card
- **Analyze**: Full phishing analysis with AI coach
- **Lessons**: Daily lessons with quiz and XP system
- **Profile**: Stats, progress, weak spots, history
- **Settings**: Logout, API test, config status
- EAS APK build config

### Coming Soon
- Push notifications (expo-notifications)
- Offline mode
