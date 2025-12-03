# RoastMyResume 🔥

**AI-Powered Resume Roasting Platform** - Get brutally funny, ego-bruising resume roasts that secretly give real career advice.

![RoastMyResume](https://img.shields.io/badge/RoastMyResume-Live-orange)
![License](https://img.shields.io/badge/license-proprietary-red)

## 🎯 Product Vision

A premium SaaS platform where users upload their resume and get:
1. **Brutally Funny Roasts** - Comedic critiques with customized Mild (🌶️) and Spicy (🔥) intensity modes.
2. **Glow-Up Reports** (Pro) - Interactive improvements checklists, dynamic optimization progress bars, and skill gap analysis.
3. **ATS Rewrites** (Pro) - Optimized bullet points ready to drop directly into templates.
4. **Social Share Images** - Perfectly formatted card graphics for sharing on Twitter/X, Threads, LinkedIn, and Reddit.
5. **Shareable Links** - JWT-based public pages with 7-day expiry (no database bloat).

**Free Tier**: 1 roast/day with watermarked graphics.  
**Pro Tier ($9.99/mo)**: Unlimited roasts, Spicy mode, ATS rewrites, watermark-free images.

## 🧱 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Custom Glassmorphic CSS System (Vanilla + Utility Tokens)
- **Animations**: Framer Motion
- **Auth**: Neon Auth / Better Auth (Google OAuth only)
- **Database Connection**: Neon Serverless driver (SQL template literals)
- **State & Limits**: Neon Database Serverless PostgreSQL tables

### Backend
- **Framework**: Python FastAPI
- **Deployment**: Vercel Serverless Functions (Mangum adapter)
- **AI Model**: Llama-3.3-70b-versatile via Groq API
- **Payments**: Razorpay Checkout + Webhooks
- **Database**: Neon Serverless PostgreSQL (stateful storage for users, sessions, orders, and limits)

### Key Features
- **Client-Side File Parsing**: pdf.js, mammoth.js (files never uploaded)
- **Procedural SFX Synthesizer**: Web Audio API-based whooshes and sizzle crackles (0 asset loading overhead)
- **Interactive Checklists**: Gamified resume optimization with glowing progress indicators
- **JWT Share Links**: Self-contained tokens, 7-day expiry
- **Client-Side Image Generation**: html-to-image library

## 📁 Project Structure

```
roast-my-resume/
├── frontend/                 # Next.js application
│   ├── app/
│   │   ├── actions/         # Server Actions (database-tier checks)
│   │   │   └── user.ts      # User tier management server actions
│   │   ├── api/             # Next.js API routes
│   │   │   ├── auth/        # Catch-all Neon Auth endpoints
│   │   │   └── razorpay/    # Order creation, verification, and webhooks
│   │   ├── components/      # React components (FileUploader, RoastResult, etc.)
│   │   ├── lib/             # Utilities, database clients, sound synth
│   │   │   ├── auth/        # Server Neon Auth setup
│   │   │   ├── auth-client.ts # Client Neon Auth hook client
│   │   │   ├── db.ts        # Neon serverless database client
│   │   │   └── sound.ts     # Procedural audio generator
│   │   ├── share/[token]/   # Public share page
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Premium Landing page
│   │   ├── dashboard/       # Interactive upload & results dashboard
│   │   └── styles/          # Premium glow and glassmorphism styles
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── backend/                  # Python FastAPI application
│   ├── api/
│   │   ├── index.py         # Main FastAPI app (comedic prompt systems & rate limiting)
│   │   └── requirements.txt # Python dependencies
│   └── tests/               # Backend tests
├── vercel.json              # Unified Vercel serverless configuration
├── schema.sql               # Database setup migrations
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Neon Console account (PostgreSQL DB)
- Google Cloud OAuth credentials
- Razorpay account (API Key & Webhook secret)
- Groq Console account (API Key)

### 1. Database Setup
Create your database tables in your Neon Console SQL Editor using:
```bash
psql -h your-neon-host -d your-db-name -U your-username -f schema.sql
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

### 3. Backend Setup (Local Testing)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r api/requirements.txt
```

### 4. Environment Variables

Create `.env.local` in `frontend` directory:

```env
# AI (Groq Console)
GROQ_API_KEY=gsk_your_groq_api_key
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=llama-3.3-70b-versatile

# Database (Neon Console)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Auth (Neon Auth / Better Auth)
NEXT_PUBLIC_NEON_AUTH_URL=https://your-neon-auth-subdomain.neon.tech
NEON_AUTH_COOKIE_SECRET=generate_random_32_chars_secret
NEXTAUTH_URL=http://localhost:3000

# Social Sign-in
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Razorpay Payments
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_signing_secret

# Share Links
SHARE_JWT_SECRET=generate_random_32_chars_jwt_secret
```

Create a `.env` in `backend` directory (for FastAPI server):
```env
GROQ_API_KEY=gsk_your_groq_api_key
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
SHARE_JWT_SECRET=generate_random_32_chars_jwt_secret
```

## 🌐 Deployment

### Vercel Setup

1. **Import Project to Vercel**
   - Import your GitHub repository on Vercel.
   - Set root directory to `frontend`.
   - Add all environment variables in project settings.

2. **Deploy**
   - Vercel automatically deploys the frontend pages and redirects all dynamic backend requests to the serverless Python handler according to `vercel.json`.

## 🤝 Contributing

This is a proprietary project. For licensing inquiries, contact: hello@roastmyresume.com

## 📄 License

© 2026 RoastMyResume. All rights reserved.
