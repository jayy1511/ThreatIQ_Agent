### Problem Statement -- the problem you're trying to solve, and why you think it's an important or interesting problem to solve

Most people (including me) see phishing almost every day: fake delivery emails, “account blocked” messages, random links on social media, etc. The issue is that these scams look increasingly realistic, while traditional awareness training is usually boring, generic, and rare.

I wanted to build a tool that does two things at the same time:
1. **Help you decide if a single message is phishing or not.**
2. **Teach you over time so you actually get better at spotting scams.**

So the core question for this project was:

> "Can I build an AI system that acts like a personal phishing coach, not only giving a verdict, but also explaining the reasoning, showing examples, and tracking how you improve over time?"

Beyond individual message analysis, I also wanted to tackle **email overload**. Many people have dozens or hundreds of unread emails, and checking each one manually is slow. So I added a **Gmail integration** that triages your inbox using the same classification system and applies labels (Safe/Suspicious/Phishing), helping you identify threats faster without analyzing each email individually.

I think this is interesting because it combines security, education, automation, and AI in a practical way. It’s not only “is this phishing, yes/no”, but turning suspicious messages into learning moments, while also providing a real productivity feature that protects your inbox in the background. This fits the *Agents for Good* track well.


### Why agents? -- Why are agents the right solution to this problem

A single LLM prompt can classify one message, but as soon as you add explanations, examples, memory, user profiles, quizzes, evaluation, and Gmail automation, the “one big prompt” approach becomes messy and hard to control.

Using **agents** with clear responsibilities is closer to how a real system should work:

- A **Classifier Agent** reads the message and outputs clean JSON (label, confidence, reasons).
- An **Evidence Agent** searches a phishing dataset and returns similar examples/categories.
- A **Memory Agent** manages user profiles/history, so the system adapts over time.
- A **Coach Agent** turns the data into explanations, tips, and a quiz.
- An **Evaluation Agent** audits decisions later to measure quality.

For Gmail integration, I added service layers that behave like agents in the broader architecture:
- **OAuth Service**: secure token exchange + refresh.
- **Gmail Client Service**: fetch/parse emails + manage labels.
- **Triage Service**: batch workflow that connects Gmail messages to the ThreatIQ pipeline.

This setup gives:
- **Modularity:** change one part without rewriting everything.
- **Better context engineering:** each agent gets only what it needs.
- **Easy extension:** add evaluation/metrics/automation as new modules and endpoints.


### What you created -- What's the overall architecture?

At a high level, ThreatIQ_Agent is a **full-stack web app** with a multi-agent backend:

- **Frontend**
  - Next.js 14, TypeScript, Tailwind, ShadCN UI.
  - Authentication via **Firebase Auth** (Google or email/password).
  - Pages:
    - `/analyze` – paste a message and get analysis + coaching
    - `/dashboard` – stats, accuracy, weak spots, Gmail controls
    - `/history` – previous analyses and outcomes
  - Gmail UI:
    - Connect/disconnect Gmail (OAuth)
    - Configure triage options (limit, spam/archiving)
    - View results and triage history

- **Backend**
  - **FastAPI** REST API.
  - Endpoints:
    - `POST /api/analyze` (protected)
    - `POST /api/analyze-public` (testing)
    - `GET /api/profile/{user_id}` + `/summary` + `/history`
    - `GET /api/metrics`, `POST /api/admin/eval-sample`
    - Gmail:
      - `GET /api/gmail/connect`, `GET /api/gmail/callback`
      - `GET /api/gmail/status`, `POST /api/gmail/disconnect`
      - `POST /api/gmail/triage`, `GET /api/gmail/history`
  - Analyze pipeline (Orchestrator):
    1. Classifier Agent (Gemini)
    2. Evidence Agent (TF-IDF similarity search)
    3. Memory Agent (MongoDB profile + learning context)
    4. Coach Agent (Gemini: explanation, tips, quiz)
  - Gmail triage reuses the classifier and applies labels automatically.
  - Includes logging + dataset tools + encrypted token storage + Gmail API utilities.

- **Data and services**
  - **MongoDB Atlas** collections:
    - `user_profiles`, `interactions`, `model_evaluations`
    - `gmail_tokens` (encrypted), `gmail_triage` (triage history)
  - **Firebase Admin SDK** verifies tokens for protected endpoints.
  - **Gemini** powers classifier/coach/evaluation.
  - **Gmail API** supports inbox triage + labeling.
  - **Fernet encryption** secures OAuth tokens at rest.

Overall loop: each analysis gives a verdict and updates the user’s learning profile; Gmail triage applies the same intelligence automatically in the inbox.


### Demo -- Show your solution

1. **Sign up / log in** (Google or email/password) → land on **Dashboard**  
2. **Analyze a message** → paste text, optional guess, click analyze  
3. **See result** → label + confidence + reason tags, then:
   - **AI Coach** explanation + tips
   - **Evidence** similar examples
   - **Quiz** short question
4. **Track progress** on Dashboard → totals, accuracy, categories, weak spots, charts  
5. **Review History** → past analyses, verdicts, confidence, correctness, timestamps  
6. **Gmail Inbox Triage**
   - Connect Gmail (OAuth) → status + disconnect option
   - Choose triage settings (limit, optionally spam/archive)
   - Run triage → see labeled results in the app
   - Check Gmail labels: `ThreatIQ/Safe`, `ThreatIQ/Suspicious`, `ThreatIQ/Phishing`
   - View triage history inside the app


### The Build -- How you created it, what tools or technologies you used.

- **Backend and agents**
  - FastAPI + Pydantic models and structured responses.
  - Gemini calls wrapped in agent modules.
  - Phishing dataset search using TF-IDF + cosine similarity (scikit-learn).
  - MongoDB via Motor (async) for profiles, interactions, evaluations, Gmail tokens, triage logs.
  - Gmail integration with OAuth 2.0 flow, token refresh, Gmail API client, batch triage, label creation/apply.
  - Tokens encrypted before storage (Fernet).

- **Auth and security**
  - Firebase Auth on frontend; Firebase Admin verification on backend.
  - Axios attaches Firebase ID token automatically.
  - OAuth security: state-based CSRF protection, server-side token exchange (frontend never sees access/refresh), encrypted token storage, restricted CORS origins.

- **Frontend**
  - Next.js App Router + AuthContext + protected routes.
  - ShadCN UI components for cards/tabs/charts and Gmail integration UI.
  - Typed API calls and user-friendly error handling.
  - Iterated on prompts for clean JSON output (classifier) and concise coaching.


### If I had more time, this is what I'd do

- Larger benchmark evaluation and confidence calibration.
- More personalized coaching (adaptive quizzes, learning paths).
- Browser extension for one-click analysis.
- Team mode with privacy-safe aggregated stats.
- Smarter Gmail features: scheduled triage, alerts, bulk approve/reject, multi-account support, advanced filters.
