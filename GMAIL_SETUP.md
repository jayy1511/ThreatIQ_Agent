# Gmail Integration - Environment Variables & Deployment Guide

## 📋 Table of Contents
1. [Environment Variables](#environment-variables)
2. [Google Cloud Console Setup](#google-cloud-console-setup)
3. [Deployment](#deployment)
4. [Testing](#testing)

---

## 🔐 Environment Variables

### Backend (Render)

Add these to your Render environment variables:

```bash
# Existing Firebase Variables
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GEMINI_API_KEY=your-gemini-api-key
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB_NAME=threatiq

# New Gmail OAuth Variables
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-backend.onrender.com/api/gmail/callback
FRONTEND_URL=https://threat-iq-agent.vercel.app
TOKEN_ENCRYPTION_KEY=<generated_fernet_key>

# Updated CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,https://threat-iq-agent.vercel.app
```

#### Generate TOKEN_ENCRYPTION_KEY

Run this Python command locally to generate a Fernet encryption key:

```python
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Example output: `gAAAAABh...` (44 characters)

**⚠️ IMPORTANT**: Store this key securely. If lost, all encrypted tokens become unrecoverable.

### Frontend (Vercel)

No new variables needed! Existing configuration works:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
# Firebase config (existing)
```

---

## ☁️ Google Cloud Console Setup

### Step 1: Create/Select Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Name: "ThreatIQ" (or your preferred name)
4. Click "Create"

**💰 Cost**: Free (no billing required for Gmail API)

### Step 2: Enable Gmail API

1. Navigate to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select **External** user type
3. Click "Create"

#### App Information
- **App name**: ThreatIQ
- **User support email**: your-email@example.com
- **App logo**: (optional)
- **Application home page**: https://threat-iq-agent.vercel.app
- **Application privacy policy link**: (optional, recommended)
- **Application terms of service link**: (optional)
- **Authorized domains**: 
  - `vercel.app`
  - `onrender.com`
- **Developer contact email**: your-email@example.com

Click "Save and Continue"

#### Scopes

Click "Add or Remove Scopes" and add:
- `https://www.googleapis.com/auth/gmail.readonly` - Read email messages
- `https://www.googleapis.com/auth/gmail.modify` - Manage labels
- `https://www.googleapis.com/auth/userinfo.email` - See email address

Click "Update" → "Save and Continue"

#### Test Users (Critical!)

**⚠️ Without verification, only test users can use the app.**

1. Click "Add Users"
2. Enter email addresses of users who will test (including yourself)
3. Click "Add"
4. Click "Save and Continue"

**To add more users later**: Return to OAuth consent screen → Test users → Add

#### Publishing Status

Keep in "Testing" mode (no verification needed for test users).

To allow **anyone** to connect (requires verification):
1. Click "Publish App"
2. Submit for verification (review takes days/weeks)

### Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Web application**
4. Name: "ThreatIQ Backend"

#### Authorized JavaScript Origins

Add both development and production URLs:
```
http://localhost:3000
https://threat-iq-agent.vercel.app
```

#### Authorized Redirect URIs

Add both development and production callback URLs:
```
http://localhost:8000/api/gmail/callback
https://your-backend.onrender.com/api/gmail/callback
```

**⚠️ Replace** `your-backend.onrender.com` with your actual Render URL.

5. Click "Create"
6. **Copy** the **Client ID** and **Client Secret**
7. Save them securely (add to Render environment variables)

---

## 🚀 Deployment

### Backend (Render)

#### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### 2. Set Environment Variables

In Render dashboard:
1. Select your backend service
2. Go to "Environment"
3. Add all Gmail variables listed above
4. Click "Save Changes" (triggers redeploy)

#### 3. Verify Startup

Check Render logs for:
```
INFO: ThreatIQ API started successfully!
```

If you see Gmail env var warnings:
```
ERROR: Missing required Gmail environment variables: ...
```
→ Add the missing variables and redeploy.

#### 4. Test OAuth Callback

Visit: `https://your-backend.onrender.com/docs`

You should see Gmail endpoints:
- `GET /api/gmail/connect`
- `GET /api/gmail/callback`
- `GET /api/gmail/status`
- `POST /api/gmail/disconnect`
- `POST /api/gmail/triage`
- `GET /api/gmail/history`

### Frontend (Vercel)

#### 1. Install Dependencies

```bash
cd frontend
npm install
```

#### 2. Build Locally

```bash
npm run build
```

**Ensure no errors**:
- ✅ No TypeScript errors
- ✅ No unused imports
- ✅ No React warnings

If build fails, fix errors before deploying.

#### 3. Deploy to Vercel

```bash
vercel --prod
```

Or use Vercel dashboard (auto-deploy from Git).

#### 4. Verify Deployment

Visit: `https://threat-iq-agent.vercel.app/dashboard`

You should see:
- "Gmail Integration" card
- "Connect Gmail" button

---

## 🧪 Testing

### Local Testing

#### 1. Start Backend

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

Backend runs on: `http://localhost:8000`

#### 2. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:3000`

#### 3. Test OAuth Flow

1. Sign in with Firebase
2. Go to Dashboard
3. Click "Connect Gmail"
4. Should redirect to Google OAuth consent screen
5. Select test user account
6. Grant permissions
7. Should redirect back to dashboard with success message
8. Status should show "Connected" with email

#### 4. Test Triage

1. Ensure you have unread emails in Gmail
2. Click "Run Triage"
3. Select options (limit, mark spam, archive safe)
4. Wait for processing
5. Check Gmail inbox for applied labels:
   - `ThreatIQ/Safe`
   - `ThreatIQ/Suspicious`
   - `ThreatIQ/Phishing`

#### 5. Test Disconnect

1. Click "Disconnect Gmail"
2. Status should show "Not Connected"
3. Check MongoDB: `gmail_tokens` collection should have no record for user

### Production Testing

Repeat steps above on production URLs:
- Frontend: `https://threat-iq-agent.vercel.app`
- Backend: `https://your-backend.onrender.com`

### Common Issues

#### ❌ "Failed to connect Gmail"

**Cause**: Redirect URI mismatch

**Fix**: 
1. Go to Google Cloud Console → Credentials
2. Edit OAuth client
3. Ensure redirect URI matches **exactly**: `https://your-backend.onrender.com/api/gmail/callback`
4. Save and retry

#### ❌ "CORS error"

**Cause**: CORS_ORIGINS not configured

**Fix**:
1. Add frontend URL to `CORS_ORIGINS` in Render
2. Redeploy backend

#### ❌ "Only test users can use this app"

**Cause**: App not verified, user not in test users list

**Fix**:
1. Go to OAuth consent screen
2. Add user email to Test users
3. Retry connection

#### ❌ "Invalid encrypted token"

**Cause**: TOKEN_ENCRYPTION_KEY changed/missing

**Fix**:
1. Generate new key (see above)
2. Set in Render environment
3. All users must reconnect Gmail

---

## 📊 MongoDB Collections

Gmail integration creates two collections:

### `gmail_tokens`

Stores encrypted OAuth tokens:
```javascript
{
  user_id: "firebase_uid",
  email: "user@gmail.com",
  scopes: [...],
  encrypted_access_token: "...",
  encrypted_refresh_token: "...",
  expiry_ts: 1234567890,
  created_at: Date,
  updated_at: Date
}
```

### `gmail_triage`

Stores triage history:
```javascript
{
  user_id: "firebase_uid",
  gmail_message_id: "msg_id",
  thread_id: "thread_id",
  from: "sender@example.com",
  subject: "Email Subject",
  date: "Mon, 1 Jan 2024 12:00:00",
  snippet: "Email preview...",
  body_excerpt: "First 500 chars...",
  label: "PHISHING",
  confidence: 0.95,
  reasons: ["urgent_language", "suspicious_link"],
  label_applied: true,
  created_at: Date
}
```

---

## 🔒 Security Checklist

- ✅ Tokens encrypted at rest (Fernet AES-128)
- ✅ State parameter prevents CSRF
- ✅ Server-side token exchange (frontend never sees tokens)
- ✅ Automatic token refresh
- ✅ HTTPS-only OAuth redirects
- ✅ Scoped permissions (minimal required)
- ✅ Firebase auth required for all endpoints (except callback)
- ✅ No secrets logged
- ✅ CORS restricted to specific domains

---

## 📝 Quick Reference

### Gmail API Quotas
- **Quota**: 1 billion units/day (free)
- **Read message**: 5 units
- **Modify message**: 10 units
- **Example**: 50,000 triages/day = well within quota

### Useful Commands

```bash
# Generate encryption key
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Test backend locally
uvicorn app.main:app --reload

# Build frontend
npm run build

# Check Render logs
# (Use Render dashboard)

# Query MongoDB
# Use MongoDB Compass or Atlas UI
```

---

## 🆘 Support

If you encounter issues:
1. Check Render logs for backend errors
2. Check browser console for frontend errors
3. Verify all environment variables are set
4. Ensure user is in Google Cloud test users list
5. Check MongoDB connections in Atlas

---

**🎉 Setup Complete!** Users can now connect Gmail and auto-triage their inboxes using ThreatIQ.
