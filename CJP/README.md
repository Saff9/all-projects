# Cockroach Janta Party ($CJP) — Telegram Mini-App & Game Arena

Welcome to the official repository of the **Cockroach Janta Party ($CJP)** ecosystem, a premium, high-fidelity Telegram Mini-App (TMA) designed for maximum engagement, gaming, and token mining. This project consists of a Next.js (app router) frontend and an Express/Node.js backend integrated with MongoDB.

---

## 🌟 Official Community & Bots

* **Telegram Bot:** [@cjpcoin_bot](https://t.me/cjpcoin_bot)
* **Telegram Channel:** [Cockroach Janta Party CJ Channel](https://t.me/CockroachJantaPartyCJ)
* **Telegram Group:** [CJP Community Group](https://t.me/+oYny5ONmzbhhMDQ1)

---

## 🛠️ Tech Stack & Architecture

```
                                ┌────────────────────────┐
                                │   Telegram WebApp SDK  │
                                └───────────┬────────────┘
                                            │
                    ┌───────────────────────▼───────────────────────┐
                    │               Next.js Frontend                │
                    │      (React 19, TailwindCSS, Web Audio API)   │
                    └───────────────────────┬───────────────────────┘
                                            │
                                            │ REST APIs / JWT
                                            │
                    ┌───────────────────────▼───────────────────────┐
                    │               Node.js Backend                 │
                    │        (Express, Mongoose, Telegram Auth)     │
                    └───────────────────────┬───────────────────────┘
                                            │
                                            │
                                    ┌───────▼───────┐
                                    │  MongoDB /    │
                                    │  Atlas DB     │
                                    └───────────────┘
```

* **Frontend**: Next.js 15+ (React 19), HTML5 Canvas engines, Web Audio synth synthesis, TailwindCSS (curated premium glassmorphism dark styling).
* **Backend**: Node.js, Express, Mongoose (MongoDB ODM), native crypto Telegram web app auth validation.
* **Database**: MongoDB (Atlas or self-hosted).

---

## 📦 Project Structure

```
cjp/
├── backend/                # Node.js Express server code
│   ├── config/             # Configuration files (e.g. tasks list)
│   ├── middleware/         # Auth verification and security middlewares
│   ├── models/             # Mongoose database models
│   ├── .env                # Backend environment configuration (gitignored)
│   ├── server.js           # Server entry point
│   └── package.json
│
└── frontend/               # Next.js Telegram WebApp
    ├── src/
    │   ├── app/            # Next.js Pages (Games, Wallet, Tasks, etc.)
    │   ├── components/     # Shareable React layout components
    │   └── context/        # Global App state & Telegram WebApp hook wrappers
    ├── public/             # Static game assets, videos, and icons
    ├── .env                # Frontend environment configuration (gitignored)
    └── package.json
```

---

## 🚀 Local Development Setup

### Prerequisite
* **Node.js**: `v18.x` or `v20.x` recommended.
* **MongoDB**: A running local MongoDB server instance (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string.

---

### 1. Backend Configuration & Startup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment variables**:
   Create a `.env` file in the root of the `backend/` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/cjp
   TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_FROM_BOTFATHER
   NODE_ENV=development
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   # OR start with node directly:
   node server.js
   ```
   The backend server will launch on `http://localhost:5000`.

---

### 2. Frontend Configuration & Startup

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment variables**:
   Create a `.env` file in the root of the `frontend/` directory (or use `.env.local`):
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   ```
4. **Run the Next.js development server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`.

---

## 🛡️ Production Deployment Guide

Deploying a Telegram Mini-App to production requires:
1. **SSL / HTTPS**: Telegram absolutely mandates HTTPS for all custom Mini-App URLs.
2. **Process Manager**: PM2 is recommended to keep backend/frontend servers running indefinitely and restarting after crashes.
3. **Reverse Proxy**: Nginx to route external HTTPS requests to internal local ports (`3000` for frontend, `5000` for backend).

---

### Step 1: Frontend Production Build

The Next.js configuration is specifically optimized for Telegram Mini Apps. It uses `output: 'standalone'` and a custom `Content-Security-Policy` that explicitly allows framing by Telegram domains (`web.telegram.org`, `webz.telegram.org`, `webk.telegram.org`). `X-Frame-Options` is intentionally omitted because it blocks iframes.

Always compile the Next.js production build before deploying:
```bash
cd frontend
npm run build
```
This produces an optimized server-side and static bundle in the `.next/standalone/` directory, which is ready to be run with Node or Docker.

---

### Step 2: PM2 Setup (Process Management)

Install PM2 globally on your production server:
```bash
sudo npm install -y pm2 -g
```

Create a `ecosystem.config.js` file at the root of the project to manage both services simultaneously:
```javascript
module.exports = {
  apps: [
    {
      name: 'cjp-backend',
      cwd: './backend',
      script: 'server.js',
      env: {
        PORT: 5000,
        NODE_ENV: 'production',
        MONGODB_URI: 'your_production_mongodb_connection_string',
        TELEGRAM_BOT_TOKEN: 'your_real_bot_token'
      }
    },
    {
      name: 'cjp-frontend',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
        NEXT_PUBLIC_BACKEND_URL: 'https://yourdomain.com/api' // Route backend requests through SSL proxy
      }
    }
  ]
};
```

Launch the applications:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

### Step 3: Nginx SSL Configuration with Let's Encrypt

Install Nginx and Certbot (for SSL):
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

Configure Nginx as a reverse proxy. Create `/etc/nginx/sites-available/cjp`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend Routing
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API Routing
    location /api {
        # Rewrite /api/foo -> /foo on backend if needed, or keep it standard
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/cjp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Acquire SSL certificates automatically:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Certbot will auto-install the Let's Encrypt certificates and update the Nginx configuration to force redirect all traffic to HTTPS.

---

### Step 4: Configuring the Bot & Telegram WebApp

1. Open Telegram and search for [@BotFather](https://t.me/BotFather).
2. Create/Select your bot: `/newbot` or select `/mybots` -> `@cjpcoin_bot`.
3. Go to **Bot Settings** -> **Menu Button** or **Web App**.
4. Set the **Web App URL** to: `https://yourdomain.com` (which points to the HTTPS Nginx endpoint serving Next.js).
5. Add/Edit inline mode and configuration as desired.

---

## ⚡ Integrated SDKs & Monetization

1. **Telegram WebApp SDK**: Loaded via client `layout.js` (`https://telegram.org/js/telegram-web-app.js`) to expose the `window.Telegram` object and handle back buttons, user avatars, haptics, and theme settings.
2. **AdSgram SDK**: Integrated to monetize daily task completions via rewarded ads.
3. **Libtl SDK**: Integrated for native web page monetization/rewarded banner displays.

---

## 📜 License
This project is proprietary. All rights reserved by the Cockroach Janta Party development team.
