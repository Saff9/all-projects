// src/app/api/newsletter/route.js
import { kv } from '@vercel/kv';
import dns from 'dns/promises';

export const runtime = 'nodejs';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function domainHasMx(domain) {
  try {
    const addresses = await dns.resolveMx(domain);
    return addresses && addresses.length > 0;
  } catch {
    return false;
  }
}

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email || !isValidEmail(email)) {
      return new Response('Invalid email format', { status: 400 });
    }

    const domain = email.split('@')[1].toLowerCase();
    if (!(await domainHasMx(domain))) {
      return new Response('Email domain does not accept mail', { status: 400 });
    }

    const key = `sub:${email.toLowerCase()}`;
    const exists = await kv.get(key);
    if (!exists) {
      await kv.set(key, { email, subscribedAt: Date.now() });
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Newsletter error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
