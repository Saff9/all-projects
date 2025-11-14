# Kongvael Holdings

**Building the future, together.**

A modern, premium startup website for Kongvael Holdings — an organization focused on building innovative technology solutions powered by community donations.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Saff9/KongvaelHoldings)

---

## ✨ Features

- **Premium Dark UI** — Professional design with neutral zinc palette, Inter typography, subtle animations
- **UPI Donation System** — QR code display + direct UPI deep linking (opens payment apps)
- **Live Funding Progress** — Real-time progress bar showing ₹1.87L / ₹5L goal
- **Social Proof** — Donor testimonials, live donation feed, supporter avatars
- **Conversion Optimized** — Sticky donate bar, impact visualization, preset donation tiers
- **Fully Responsive** — Works seamlessly across desktop, tablet, and mobile
- **Vercel Ready** — Deploy in one click with SPA routing configured

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [React](https://react.dev) | UI framework |
| Vanilla CSS | Styling (no Tailwind) |
| [Vercel](https://vercel.com) | Deployment |

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 18
- npm ≥ 9

### Setup

```bash
# Clone the repository
git clone https://github.com/Saff9/KongvaelHoldings.git
cd KongvaelHoldings

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5174](http://localhost:5174) in your browser.

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## 💳 UPI Donation Setup

1. **Add your QR code**: Place your UPI QR code image at `public/assets/qrcode.jpg` (or `.png`)
2. **UPI ID**: The UPI ID is base64-encoded in `src/components/DonateModal.jsx` for basic source obfuscation
3. **Deep linking**: The "Pay via UPI App" button generates a `upi://pay?` deep link that opens installed UPI apps (GPay, PhonePe, Paytm, etc.)

> **Note**: The UPI ID is decoded client-side at runtime. This provides basic obfuscation to prevent casual scraping, but is **not** encryption. For production, consider using a payment gateway like Razorpay or Cashfree.

## 📁 Project Structure

```
KongvaelHoldings/
├── public/
│   └── assets/          # QR code and media assets
├── src/
│   ├── components/      # Header, Footer, StickyDonate, DonateModal, DonationFeed
│   ├── sections/        # Hero, About, Impact, Invest, Testimonials, Team, Roadmap, FAQ, Contact
│   ├── hooks/           # useScrollReveal, useCountUp
│   ├── App.jsx          # Main app with modal state management
│   ├── App.css          # App-level styles
│   ├── index.css        # Design system (colors, typography, spacing, animations)
│   └── main.jsx         # Entry point
├── vercel.json          # Vercel deployment config
├── package.json
├── LICENSE              # MIT License
├── CONTRIBUTING.md      # Contribution guidelines
└── SECURITY.md          # Security policy
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Click **Deploy** — no configuration needed

### Other Platforms

Build the project with `npm run build`, then deploy the `dist/` folder to any static host:

- **Netlify**: Drag & drop the `dist/` folder
- **GitHub Pages**: Use the `gh-pages` package
- **Cloudflare Pages**: Connect your repo

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 🔒 Security

See [SECURITY.md](SECURITY.md) for our security policy.

---

**Made with ❤️ by the Kongvael team**
