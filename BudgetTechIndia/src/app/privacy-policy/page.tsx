import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Privacy Policy - BudgetTechIndia',
  description: 'Privacy Policy and Cookie information for BudgetTechIndia visitors.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-16">
      <JsonLd
        type="breadcrumbs"
        data={{
          items: [
            { name: 'Home', url: '/' },
            { name: 'Privacy Policy', url: '/privacy-policy' },
          ],
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-slate-300 leading-relaxed space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Privacy Policy</h1>
          <p className="text-xs text-slate-400">Last updated: August 2026</p>
        </div>

        <div className="p-8 rounded-3xl bg-[#0B0F19] border border-white/5 space-y-6 text-sm">
          <section>
            <h2 className="text-base font-bold text-white mb-2">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when subscribing to our newsletter, submitting a contact inquiry, or browsing pages on BudgetTechIndia. This may include email address, non-personally identifiable log files, and analytics identifiers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">2. Cookies and Third-Party Advertising</h2>
            <p>
              We may use cookies and web beacons to analyze traffic, personalize content, and serve relevant advertising through Google AdSense or our ad partners. You can adjust cookie preferences in your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">3. Amazon Affiliate Cookies</h2>
            <p>
              When you click on product links to Amazon.in, Amazon uses tracking cookies to process referral commissions as part of the Amazon Associates Program.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">4. Contact Us</h2>
            <p>
              For questions regarding our privacy practices, please contact <a href="mailto:privacy@budgettechindia.com" className="text-[#FFB800] underline">privacy@budgettechindia.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
