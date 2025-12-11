// app/privacy/page.tsx
export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-kashmir-light-neutral-50 dark:bg-kashmir-dark-neutral-50 py-8 px-4">
      <div className="max-w-4xl mx-auto card p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-kashmir-light-blue-600 dark:text-kashmir-dark-blue-400 mb-4">
            Privacy Policy 🙄😄
          </h1>
          <p className="text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6 text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300">
          <section>
            <h2 className="text-2xl font-semibold text-kashmir-light-neutral-800 dark:text-kashmir-dark-neutral-200 mb-4">
              1. Information We Collect😄
            </h2>
            <div className="space-y-3">
              <p>
                <strong>Personal Information:</strong> When you subscribe to our newsletter, we collect your name and email address.
              </p>
              <p>
                <strong>Location Data:</strong> With your permission, we access your device's location to provide accurate weather information.
              </p>
              <p>
                <strong>Usage Data:</strong> We collect information about how you interact with our app to improve user experience.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-kashmir-light-neutral-800 dark:text-kashmir-dark-neutral-200 mb-4">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Provide personalized weather forecasts</li>
              <li>Send weather updates and newsletters</li>
              <li>Improve our app's features and performance</li>
              <li>Detect and prevent technical issues</li>
              <li>Personalize your experience with location-based services</li>
              <li>I did not collect any inf. or data 😄😄😄</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-kashmir-light-neutral-800 dark:text-kashmir-dark-neutral-200 mb-4">
              3. Data Storage & Security
            </h2>
            <div className="space-y-3">
              <p>
                <strong>Local Storage:</strong> Your name is stored locally in your browser for personalized greetings.
              </p>
              <p>
                <strong>Email Storage:</strong> Subscriber emails are stored securely in our database.
              </p>
              <p>
                <strong>Location Data:</strong> Your location data is processed in real-time and not stored permanently.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-kashmir-light-neutral-800 dark:text-kashmir-dark-neutral-200 mb-4">
              4. Third-Party Services
            </h2>
            <p>
              We use OpenWeatherMap API for weather data and Vercel for hosting. These services have their own privacy policies governing data usage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-kashmir-light-neutral-800 dark:text-kashmir-dark-neutral-200 mb-4">
              5. Your Rights
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Access and review your personal data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of newsletter communications</li>
              <li>Disable location services</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-kashmir-light-neutral-800 dark:text-kashmir-dark-neutral-200 mb-4">
              6. Contact Information
            </h2>
            <p>
              For privacy-related questions or data removal requests, contact us at:
            </p>
            <div className="mt-2">
              <p>📧 Email: saffanakbar942@gmail.com</p>
              <p>ه 🅾 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 ★: @0waisdar_511</p>
              <p>💻 GitHub: Saff9</p>
            </div>
          </section>

          <div className="border-t border-kashmir-light-neutral-200 dark:border-kashmir-dark-neutral-300 pt-6">
            <p className="text-sm text-kashmir-light-neutral-500 dark:text-kashmir-dark-neutral-500">
              By using SkyKash, you agree to the terms outlined in this Privacy Policy.🙄
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/dashboard" 
            className="btn-primary"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
