# 💬 ChatWave - Modern Messaging Reimagined

> **A revolutionary open-source messaging platform combining the best of WhatsApp, Telegram, and AI-powered features**

[![React](https://img.shields.io/badge/React-18.2+-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel&logoColor=white)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 🚀 Overview

ChatWave is a cutting-edge messaging platform that bridges the gap between simplicity and powerful functionality. We've taken the best aspects of popular messaging apps and enhanced them with modern AI capabilities, unlimited storage, and a privacy-first approach.

## ✨ Features

### 💬 Core Messaging
- Real-time one-on-one & group chats (500+ members)
- Media sharing (images, videos, files up to 2GB)
- Voice messages with transcription
- Message reactions, replies, editing & pinning
- Read receipts & typing indicators

### 🎨 Modern Experience
- 24-hour Stories with reactions & archives
- Voice & video calls with screen sharing
- Custom themes & chat backgrounds
- Dark/Light/System theme modes
- Cross-platform sync (Web, Mobile, Desktop)

### 🔒 Security & Privacy
- Optional end-to-end encryption
- Self-destructing messages
- Incognito mode (hide online status)
- App lock (PIN/Fingerprint)
- Two-factor authentication

### 🤖 AI Powered
- AI-powered quick replies
- Auto-translation in 100+ languages
- Smart search across conversations
- Message summarization
- Calendar integration

### 💰 Freemium Model
**Free Tier:** 50 messages/day, 25 member groups, 1GB storage  
**Premium ($2.99/month):** Unlimited messages, 500 member groups, 10GB storage, voice/video calls, no ads

## 🛠 Tech Stack

- **Frontend:** React.js + TypeScript + Tailwind CSS + PWA
- **Mobile:** React Native (iOS & Android)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Real-time:** WebSockets + Supabase Realtime
- **AI Services:** OpenAI GPT-4, Google Gemini
- **Hosting:** Vercel (Frontend) + Supabase (Backend)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Vercel account

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/chatwave.git
cd chatwave

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your Supabase keys to .env.local

# Start development server
npm run dev
