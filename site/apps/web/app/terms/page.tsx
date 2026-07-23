export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <div className="prose prose-sm max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold mt-6">1. Acceptance of Terms</h2>
          <p>By accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement.</p>
          
          <h2 className="text-xl font-semibold mt-6">2. Use License</h2>
          <p>Permission is granted to temporarily use this platform for personal, non-commercial use only.</p>
          
          <h2 className="text-xl font-semibold mt-6">3. Disclaimer</h2>
          <p>The materials on this platform are provided on an 'as is' basis.</p>
          
          <h2 className="text-xl font-semibold mt-6">4. Limitations</h2>
          <p>In no event shall the platform owners be liable for any damages arising out of the use or inability to use the materials.</p>
          
          <h2 className="text-xl font-semibold mt-6">5. Privacy Policy</h2>
          <p>Your privacy is important to us. Please review our Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}
