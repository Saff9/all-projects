# 🚀 RoastMyResume - Complete Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Backend Deployment (Vercel Python)](#backend-deployment-vercel-python)
5. [Neon Database & Auth Setup](#neon-database--auth-setup)
6. [Razorpay Configuration](#razorpay-configuration)
7. [Google OAuth Setup](#google-oauth-setup)
8. [Groq AI Setup](#groq-ai-setup)
9. [Testing & Verification](#testing--verification)
10. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Accounts
- ✅ GitHub account
- ✅ Vercel account (free tier works)
- ✅ Google Cloud Console account
- ✅ Neon account (for Database and Managed Auth)
- ✅ Razorpay account (in Live or Test mode)
- ✅ Groq Console account (for Llama API keys)

### Required Tools
```bash
# Install Node.js 18+
node --version  # Should be v18 or higher

# Install Python 3.9+
python --version  # Should be 3.9 or higher
```

---

## Environment Setup

### 1. Clone Your Repository

```bash
git clone https://github.com/YOUR_USERNAME/roast-my-resume.git
cd roast-my-resume
```

### 2. Generate Secrets

```bash
# Generate NEON_AUTH_COOKIE_SECRET and SHARE_JWT_SECRET (32+ random characters)
openssl rand -base64 32
```

### 3. Create .env.local File

Copy `.env.example` to `.env.local` in the `frontend` directory:

```bash
cp frontend/.env.example frontend/.env.local
```

Fill in all values (see [Environment Variables Reference](#environment-variables-reference)).

---

## Frontend Deployment (Vercel)

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Configure production environment - RoastMyResume"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - **Root Directory**: Set to `frontend`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

3. **Add Environment Variables**
   
   In Vercel dashboard → Project Settings → Environment Variables, add:

   | Variable | Value | Environment |
   |----------|-------|-------------|
   | `GROQ_API_KEY` | Your Groq API key (`gsk_...`) | Production, Preview, Development |
   | `GROQ_BASE_URL` | `https://api.groq.com/openai/v1` | All |
   | `GROQ_MODEL` | `llama-3.3-70b-versatile` | All |
   | `DATABASE_URL` | From Neon Console | All |
   | `NEXT_PUBLIC_NEON_AUTH_URL` | From Neon Console | All |
   | `NEON_AUTH_COOKIE_SECRET` | Generated secret | All |
   | `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production |
   | `GOOGLE_CLIENT_ID` | From Google Cloud | All |
   | `GOOGLE_CLIENT_SECRET` | From Google Cloud | All |
   | `RAZORPAY_KEY_ID` | `rzp_test_...` or `rzp_live_...` | All |
   | `RAZORPAY_KEY_SECRET` | Your Razorpay secret key | All |
   | `RAZORPAY_WEBHOOK_SECRET` | From Razorpay Webhooks | All |
   | `SHARE_JWT_SECRET` | Generated secret | All |

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2 minutes)
   - Your app is live!

---

## Backend Deployment (Vercel Python)

The Python FastAPI backend is automatically deployed as serverless functions alongside the Next.js pages.

### 1. Configure `vercel.json`

Ensure `vercel.json` is in the project root:

```json
{
  "rewrites": [
    { "source": "/api/roast", "destination": "/api/index" },
    { "source": "/api/create-share-link", "destination": "/api/index" }
  ],
  "functions": {
    "api/*.py": {
      "runtime": "vercel-python@3.2.0"
    }
  }
}
```

Vercel detects the `/api/` dynamic router and runs it as a serverless python runner automatically.

---

## Neon Database & Auth Setup

### 1. Database Migrations
1. Open your database in the [Neon Console](https://console.neon.tech).
2. Go to the **SQL Editor** tab.
3. Paste the contents of [`schema.sql`](file:///C:/Projects/OneDrive/Desktop/roste/schema.sql) and click **Run**. This initializes the application's `users`, `orders`, and `usage_limits` tables.

### 2. Managed Neon Auth Setup
1. In the Neon Console, select the **Auth** tab in the sidebar and enable it.
2. Select **Social Sign-in Providers** and activate **Google**.
3. Fill in the **Authorized redirect URIs** (which you will get from your Google Cloud Console OAuth details).
4. Under **Auth Settings**, copy the `Base URL` and save it to `NEXT_PUBLIC_NEON_AUTH_URL` in your env variables.

---

## Razorpay Configuration

### 1. Get API Credentials
1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Go to **Settings** → **API Keys** → **Generate Key**.
3. Copy the **Key ID** (`RAZORPAY_KEY_ID`) and **Key Secret** (`RAZORPAY_KEY_SECRET`).

### 2. Configure Webhooks
1. In your Razorpay Dashboard, go to **Settings** → **Webhooks** → **Add New Webhook**.
2. **Webhook URL**: `https://your-app.vercel.app/api/razorpay/webhook`
3. **Active Events**:
   - `payment.captured`
4. **Secret**: Enter a secure random string (minimum 8 characters) and set it to `RAZORPAY_WEBHOOK_SECRET` in your env variables.
5. Click **Create Webhook**.

---

## Google OAuth Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project: "RoastMyResume".

### 2. Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**.
2. Click **Create Credentials** → **OAuth client ID**.
3. **Application type**: Web application.
4. **Authorized JavaScript origins**:
   - `http://localhost:3000` (development)
   - `https://your-app.vercel.app` (production)
5. **Authorized redirect URIs** (Required for Neon Auth proxy):
   - `https://<your-neon-auth-subdomain>.neon.tech/oauth/callback/google` (Copy this from Neon Console Auth settings)
   - `http://localhost:3000/api/auth/callback/google` (development fallback)
   - `https://your-app.vercel.app/api/auth/callback/google` (production fallback)
6. Copy the **Client ID** and **Client Secret**.

---

## Groq AI Setup

### 1. Get API Key
1. Go to [Groq Console](https://console.groq.com).
2. Go to **API Keys** and generate a new key.
3. Save it to `GROQ_API_KEY`.

---

## Testing & Verification

### Pre-Launch Checklist

#### Frontend
- [ ] Landing page loads correctly.
- [ ] File upload works (PDF & DOCX).
- [ ] Tech whoosh and crackle sound effects play correctly.
- [ ] Google login works.
- [ ] Dashboard shows active session details.
- [ ] Glow-up interactive checkboxes and completeness progress bar work correctly.
- [ ] Share links are generated and viewable by other users.

#### Payments
- [ ] Upgrade triggers Razorpay Checkout modal.
- [ ] Payment capturing completes successfully.
- [ ] Razorpay webhook updates customer tier to `pro` in the database immediately.

---

## Troubleshooting

### Common Issues

#### 1. "Could not find production build" on start
- Make sure to compile the production bundle first using `npm run build` before executing `npm run start` / `next start`.

#### 2. Session verification issues in Python backend
- Make sure that the `DATABASE_URL` is set identically in both Next.js and the Python backend environment variables so the stateful query can access the same `session` database table.

---

**🎉 Congratulations! RoastMyResume is ready for a viral deployment launch!**
