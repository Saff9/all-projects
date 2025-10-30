# Apex Smart — Website (GitHub Pages + Firebase backend)

## Overview
This repo contains a static frontend (GitHub Pages) and optional Firebase backend (Firestore + Cloud Functions). The site supports posts, admin editing, subscribers, basic SEO, and a notification pattern.

## File structure
- `/index.html` — Home
- `/blog.html` — Blog list + single-post handling via hash
- `/about.html` — About page
- `/subscribe.html` — Subscribe + auth
- `/css/styles.css` — Styles
- `/js/*.js` — Client JS
- `/assets/*` — images (add your images here)
- `/firebase/firestore.rules` — Firestore security rules
- `/functions/*` — optional Cloud Functions to send notifications (SendGrid example)

## Setup
1. Add your assets to `/assets/` (logo.jpg, about.jpg, favicon).
2. Replace Firebase config in `/js/app.js` with your project values.
3. In Firebase Console:
   - Enable Firestore.
   - (Recommended) Enable Authentication (Email/Password).
   - Deploy Firestore rules (see /firebase/firestore.rules).
4. Push site to GitHub repository `gh-pages` or `main` (enable GitHub Pages in repo settings).
5. Optional: Deploy Cloud Functions to send emails (see functions/ folder).
   - Set `SENDGRID_API_KEY` in functions config: `firebase functions:config:set sendgrid.key="YOUR_KEY"`
6. Configure admin account: create an admin user in Firebase Auth and set custom claim `admin=true` using Admin SDK.

## SEO & Indexing
- Add `/sitemap.xml` and `/robots.txt` (provided).
- Submit your sitemap to Google Search Console.
- Ensure pages have unique `<title>` and `<meta description>` (they do).
- If you want better indexing, split posts into individual static pages or pre-render (optional).

## Security Notes
- **Do not** store admin credentials in client-side JS.
- Use Firebase Auth + custom claims for admin privileges.
- Use Firestore rules to restrict writes to admin users.
- Use Cloud Functions to handle sending messages (so your API keys are kept server-side).

## Next steps I can help you with
- Creating Cloud Function with Twilio SMS instead of SendGrid.
- Setting up Firebase custom claims script.
- Converting SPA posts into static individual pages for improved SEO.
