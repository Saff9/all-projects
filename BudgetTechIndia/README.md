# BudgetTechIndia

> Best Budget Tech Products Under ₹2000 in India — Full React & Next.js 14 App Router with Neon DB (Serverless PostgreSQL)

---

## ⚡ Bot Webhook Quick Post Command (cURL)

To post/add product affiliate links automatically from your bot or script with **Neon DB** and **7-day automated auto-purge expiration**:

```bash
curl -X POST https://budget-tech-india.vercel.app/api/webhook/post \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: YOUR_WEBHOOK_PASSWORD" \
  -d '{
    "name": "Noise ColorFit Pulse 2 Max",
    "category": "smartwatches",
    "price": 1199,
    "mrp": 4999,
    "affiliateUrl": "https://www.amazon.in/dp/B0B5L21SGR?tag=budgettechpro-21",
    "brand": "Noise",
    "description": "1.85 Inch Display, Bluetooth Calling",
    "expiryDays": 7
  }'
```

---

## 🔐 Environment Variables & Security Setup

All sensitive credentials and database connection strings are stored strictly in `.env` (never hardcoded in source code).

Create a `.env` file in the root directory:

```env
# Storage Configuration ('neondb' or 'local')
PUBLIC_STORAGE_TYPE=neondb

# Neon DB Serverless PostgreSQL Connection String
NEON_DATABASE_URL=postgresql://neondb_owner:npg_4pPgnhc5DiJf@ep-odd-butterfly-a1pv3sqx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Webhook API Authentication Password (for Bot/Automated Posting)
WEBHOOK_PASSWORD=YOUR_SECURE_WEBHOOK_PASSWORD

# Admin Dashboard Credentials
PUBLIC_ADMIN_EMAIL=admin@budgettechindia.com
PUBLIC_ADMIN_PASSWORD=YOUR_SECURE_ADMIN_PASSWORD

# Site & Amazon Affiliate Config
SITE_URL=https://budget-tech-india.vercel.app
AMAZON_AFFILIATE_TAG=budgettechpro-21
PUBLIC_AMAZON_AFFILIATE_TAG=budgettechpro-21
```

---

## 🔄 7-Day Automated Content Rotation & Auto-Purge

- **Retention System**: Every product inserted via Neon DB is tagged with `created_at` and `expires_at` (default: 7 days).
- **Zero-Maintenance Auto-Purge**: On every product query or webhook invocation, the system automatically executes:
  ```sql
  DELETE FROM products 
  WHERE created_at < (NOW() - INTERVAL '7 days') 
     OR expires_at < NOW();
  ```
- **Why**: Ensures unpaid or stale affiliate links continuously rotate off the site so you only maintain monetized, active deals.

---

## 🤖 Supported Amazon Link Formats for Bots

The automated affiliate engine (`amazonAutoAffiliate.ts`) accepts any of the following link formats:

1. **Short Links**: `https://link.amazon/B01NI5GXB` or `https://amzn.to/3xxx`
2. **Full Amazon Affiliate Links**: `https://www.amazon.in/Laws-Human-Nature-Robert-Greene-ebook/dp/B07C87SQ53?...`
3. **Raw ASINs**: `B07C87SQ53`

> **Note**: If `affiliateUrl` is provided without an Associate Tag, the system automatically appends your `tag=budgettechpro-21`.

---

## 📡 Webhook API Endpoints

| Endpoint | Method | Security | Description |
|---|---|---|---|
| `/api/webhook/post` | `POST` | Password Required | Adds or updates product deal with 7-day auto-expiry retention |
| `/api/webhook/list` | `GET` / `POST` | Password Required | Retrieves all unexpired active products (auto-purges 7-day old items) |
| `/api/webhook/delete` | `POST` / `DELETE` | Password Required | Deletes product by `id`/`slug` or forces a database purge (`"action": "purge"`) |

### Webhook Authentication Header Formats
Pass your `WEBHOOK_PASSWORD` using any of these header methods:
- `X-API-KEY: YOUR_WEBHOOK_PASSWORD`
- `Authorization: Bearer YOUR_WEBHOOK_PASSWORD`
- JSON Body: `"password": "YOUR_WEBHOOK_PASSWORD"`

---

## 💻 Bot Code Integration Examples

### **Python Bot Example**
```python
import requests

WEBHOOK_URL = "https://budget-tech-india.vercel.app/api/webhook/post"
PASSWORD = "YOUR_WEBHOOK_PASSWORD"

payload = {
    "password": PASSWORD,
    "name": "The Laws of Human Nature - Robert Greene",
    "category": "books",
    "price": 699,
    "mrp": 999,
    "affiliateUrl": "https://link.amazon/B01NI5GXB",
    "brand": "Penguin",
    "description": "Masterwork on psychology and human dynamics",
    "expiryDays": 7
}

response = requests.post(WEBHOOK_URL, json=payload)
print(response.json())
```

### **Node.js / JavaScript Bot Example**
```javascript
const response = await fetch("https://budget-tech-india.vercel.app/api/webhook/post", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-KEY": "YOUR_WEBHOOK_PASSWORD"
  },
  body: JSON.stringify({
    name: "boAt Airdopes 141 TWS",
    category: "earbuds",
    price: 999,
    mrp: 2990,
    affiliateUrl: "https://www.amazon.in/dp/B097C56421",
    brand: "boAt",
    description: "42H Playtime, Low Latency, ENx Tech",
    expiryDays: 7
  })
});

const data = await response.json();
console.log(data);
```

---

## 🛠️ Local Development & Production Build

### **Installation**
```bash
# 1. Clone & install
git clone https://github.com/budgettechindia/website.git
cd website
npm install

# 2. Configure environment
cp .env.example .env

# 3. Development server
npm run dev

# 4. Production build
npm run build
```

---

## 🚀 Production Deployment (Vercel / Render / Netlify)

1. Deploy the repository to your host (Vercel, Render, Netlify).
2. Set Environment Variables in your hosting dashboard:
   - `PUBLIC_STORAGE_TYPE`: `neondb`
   - `NEON_DATABASE_URL`: `postgresql://neondb_owner:npg_4pPgnhc5DiJf@...`
   - `WEBHOOK_PASSWORD`: `YOUR_SECURE_WEBHOOK_PASSWORD`
   - `AMAZON_AFFILIATE_TAG`: `budgettechpro-21`
3. Trigger build & deploy!