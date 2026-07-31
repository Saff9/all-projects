# JEENEET Deployment Guide

This guide will help you deploy the JEENEET application to production.

## 🚀 Quick Start

### Prerequisites
- GitHub account
- Render account (https://render.com)
- Vercel account (https://vercel.com) - optional for frontend

---

## 📦 Project Structure

```
jeeneet/
├── apps/
│   ├── api/          # Express.js backend API
│   └── web/          # Next.js frontend
├── packages/
│   ├── types/        # Shared TypeScript types
│   └── ui/           # Shared UI components
└── render.yaml       # Render deployment config
```

---

## 🗄️ Database Setup (Required First)

### Option 1: Render PostgreSQL (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **PostgreSQL**
3. Fill in:
   - **Name**: `jeeneet-db`
   - **Region**: Oregon (or closest to you)
   - **PostgreSQL Version**: 15
4. Click **Create Database**
5. Copy the **Internal Database URL** (looks like `postgresql://...`)

### Option 2: Neon (Free Tier)

1. Go to [Neon](https://neon.tech)
2. Sign up and create a project
3. Copy the connection string

### Option 3: Supabase (Free Tier)

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings → Database → Connection string
4. Copy the URI

---

## 🔧 API Deployment (Render)

### Step 1: Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Fill in:
   - **Name**: `jeeneet-api`
   - **Region**: Oregon
   - **Branch**: main
   - **Root Directory**: `apps/api`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

### Step 2: Add Environment Variables

Add these environment variables in Render:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `JWT_SECRET` | Random 32+ character string |
| `JWT_REFRESH_SECRET` | Another random 32+ character string |
| `NODE_ENV` | `production` |

### Step 3: Deploy

1. Click **Create Web Service**
2. Wait for build to complete
3. Your API will be available at `https://your-api-name.onrender.com`

### Step 4: Run Database Migrations

After first deployment, run these commands in Render Shell:

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

---

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-api-name.onrender.com/api`
5. Click **Deploy**

### Option 2: Render (Static Site)

1. Go to Render Dashboard
2. Click **New** → **Static Site**
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `cd apps/web && npm install && npm run build`
   - **Publish Path**: `apps/web/.next`
5. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-api-name.onrender.com/api`

---

## 👤 Admin User

After running the seed, you can login with:

- **Email**: saffanakbar942@gmail.com
- **Password**: saffanakbar942@gmail.com
- **Role**: Admin

---

## 🔐 Environment Variables Reference

### API (.env)

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your-super-secret-jwt-key-at-least-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-at-least-32-chars"
NODE_ENV="production"
PORT=4000
```

### Web (.env.local)

```env
NEXT_PUBLIC_API_URL="https://your-api.onrender.com/api"
```

---

## 📝 Post-Deployment Checklist

- [ ] Database created and connected
- [ ] API deployed and healthy
- [ ] Database migrations run (`npx prisma db push`)
- [ ] Seed data created (`npx tsx prisma/seed.ts`)
- [ ] Frontend deployed
- [ ] Can login with admin credentials
- [ ] API health check returns 200 (`/api/health`)

---

## 🐛 Troubleshooting

### API won't start
- Check `DATABASE_URL` is set correctly
- Check database is accessible from Render
- Check logs in Render dashboard

### Database connection errors
- Ensure database is in the same region as API
- Check if database allows external connections
- Verify connection string format

### Frontend can't connect to API
- Check `NEXT_PUBLIC_API_URL` is set
- Ensure API CORS allows your frontend domain
- Check browser console for errors

### Build failures
- Check Node.js version (18+)
- Run `npm install` locally to verify dependencies
- Check TypeScript errors with `npx tsc --noEmit`

---

## 📞 Support

If you encounter issues:
1. Check Render/Vercel logs
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Ensure database is accessible

---

## 🔄 Updating Deployment

Any push to the `main` branch will automatically trigger a new deployment on both Render and Vercel.

```bash
git add .
git commit -m "Your update message"
git push
```

---

## 🏗️ Local Development

```bash
# Install dependencies
npm install

# Start API (in apps/api)
npm run dev

# Start Web (in apps/web)
npm run dev

# Run database migrations
npx prisma db push

# Seed database
npx tsx prisma/seed.ts
```

---

## 📊 Monitoring

- **Render**: View logs and metrics in dashboard
- **Vercel**: View analytics and logs in dashboard
- **Database**: Monitor connections and queries in database dashboard

---

## 🔒 Security Notes

1. Never commit `.env` files
2. Use strong JWT secrets (32+ characters)
3. Enable HTTPS (automatic on Render/Vercel)
4. Keep dependencies updated
5. Review CORS settings in production

---

## 📈 Scaling

### Render
- Upgrade to paid plan for more resources
- Add horizontal scaling for high traffic

### Vercel
- Pro plan offers more bandwidth
- Edge functions for better performance

### Database
- Consider connection pooling for high traffic
- Upgrade database plan as needed

---

Happy deploying! 🎉
