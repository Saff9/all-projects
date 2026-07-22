export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="prose prose-sm max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold mt-6">1. Information We Collect</h2>
          <p>We collect information that you provide directly to us, including when you create an account, fill out a form, or communicate with us.</p>
          
          <h2 className="text-xl font-semibold mt-6">2. How We Use Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, to process your transactions, and to communicate with you.</p>
          
          <h2 className="text-xl font-semibold mt-6">3. Information Sharing</h2>
          <p>We do not share your personal information with third parties except as described in this policy.</p>
          
          <h2 className="text-xl font-semibold mt-6">4. Data Security</h2>
          <p>We take reasonable measures to help protect your personal information from loss, theft, misuse and unauthorized access.</p>
          
          <h2 className="text-xl font-semibold mt-6">5. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us.</p>
        </div>
      </div>
    </div>
  );
}
