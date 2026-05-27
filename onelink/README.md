# OneLink

**OneLink** is a modern, fully‑featured link‑in‑bio web application built with **React**, **Vite**, **Tailwind CSS**, and **Firebase**. It allows users to create a personalized landing page with customizable links, analytics, and a sleek UI.

---

## Table of Contents
- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
  - [Vercel (recommended)](#vercel-recommended)
  - [Custom Domain](#custom-domain)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Captcha Protection](#captcha-protection)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- **Customizable profile** – avatar, background, theme, and link groups.
- **Analytics** – real‑time click tracking with Firebase.
- **Responsive UI** – built with Tailwind CSS and Framer Motion.
- **Google reCAPTCHA** – protects the registration flow from bots.
- **Vercel‑ready** – zero‑config deployment.
- **TypeScript‑ready** – the codebase can be migrated easily.

---

## Demo
A live demo is hosted at the Vercel‑generated URL:
```
https://<random>.vercel.app
```
_(Replace `<random>` with the actual sub‑domain shown after the first deployment.)_

---

## Installation
```bash
# Clone the repository
git clone https://github.com/saff9/onelink.git
cd onelink

# Install dependencies
npm install
```

---

## Configuration
....
```
3. **Environment variables** – See the **Environment Variables** section.

---

## Running Locally
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## Deployment
### Vercel (recommended)
1. Sign in at https://vercel.com.
2. Import the repository (`https://github.com/saff9/onelink`).
3. Vercel auto‑detects the `vercel.json` configuration:
   - **Framework**: `vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. After a successful build Vercel will provide a preview URL and a permanent URL.

### Custom Domain
If you own a domain (e.g., `onelink.bio`):
1. In Vercel Dashboard → **Project Settings → Domains**, add your domain.
2. Update your DNS provider to point the domain to Vercel’s nameservers (or add an `A`/`CNAME` record as instructed).
3. Deploy – Vercel will serve the same app under your custom domain.

---

## Environment Variables
| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `RECAPTCHA_SITE_KEY` | Google reCAPTCHA site key |

Add these to a `.env` file (or to Vercel’s **Environment Variables** UI). Vite will expose those prefixed with `VITE_` to the client.

---

## Project Structure
```
├─ src/
│  ├─ components/      # React components
│  ├─ pages/           # Route pages
│  ├─ hooks/           # Custom hooks
│  ├─ config/          # Firebase config
│  └─ main.jsx         # Application entry point
├─ public/             # Static assets
├─ vercel.json          # Vercel configuration
├─ vite.config.js       # Vite configuration
└─ README.md            # This file
```

---

## Captcha Protection
The registration form (`src/components/auth/RegisterForm.jsx`) now includes Google reCAPTCHA:
```jsx
import ReCAPTCHA from 'react-google-recaptcha';
// ...
<ReCAPTCHA sitekey={process.env.RECAPTCHA_SITE_KEY} onChange={setCaptchaToken} />
```
The form blocks submission until a valid token is received, and the token is sent together with the rest of the form data.

---

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome-feature`).
3. Commit your changes (`git commit -m "Add awesome feature"`).
4. Push to your fork (`git push origin feature/awesome-feature`).
5. Open a Pull Request.

---

## License
This project is licensed under the MIT License. See `LICENSE` for details.

---

*Happy coding!*
