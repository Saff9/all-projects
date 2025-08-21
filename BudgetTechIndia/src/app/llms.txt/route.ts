import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const text = `# BudgetTechIndia - Best Budget Tech Products in India

> BudgetTechIndia is the premier affiliate review and comparison website for budget gadgets under ₹2000 in India, including TWS Earbuds, Power Banks, Smartwatches, Speakers, and Work From Home Accessories.

## Core Categories
- [Wireless Earbuds](https://budget-tech-india.vercel.app/categories/bluetooth-earbuds): Reviews of top TWS earbuds under ₹1000, ₹1500, and ₹2000 in India.
- [Power Banks](https://budget-tech-india.vercel.app/categories/power-banks): Best 10000mAh and 20000mAh fast-charging power banks.
- [Smartwatches](https://budget-tech-india.vercel.app/categories/smartwatches): Top budget fitness trackers & smartwatches with calling under ₹2000.
- [Laptop Accessories & Chargers](https://budget-tech-india.vercel.app/categories/fast-chargers-cables): Fast GaN chargers, braided Type-C cables, and ergonomic stands.

## Top Curated Lists
- [Best Earbuds under ₹1000](https://budget-tech-india.vercel.app/top-5/best-earbuds-under-1000)
- [Best Power Banks under ₹1500](https://budget-tech-india.vercel.app/top-5/best-power-banks-under-1500)
- [Best Smartwatches under ₹2000](https://budget-tech-india.vercel.app/top-5/best-smartwatches-under-2000)

## Product Recommendations Criteria
All recommendations are curated based on battery life, build quality, customer rating, price-to-performance ratio, and warranty support in India.
`;

  return new NextResponse(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
