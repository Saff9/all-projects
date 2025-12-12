// components/NewsletterSignup.tsx
'use client';

import { useState, useEffect } from 'react';

const PREMIUM_USERS = ['saffanakbar942@gmail.com'];

export default function NewsletterSignup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already subscribed (premium user)
    const storedName = localStorage.getItem('userName');
    const storedEmail = localStorage.getItem('userEmail');
    
    if (storedName && storedEmail && PREMIUM_USERS.includes(storedEmail)) {
      window.location.href = '/dashboard';
      return;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!name.trim() || !email.trim()) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!privacyAccepted) {
      setError('Please accept the privacy policy');
      setIsLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // Check if premium user
      if (PREMIUM_USERS.includes(email)) {
        localStorage.setItem('userName', name.trim());
        localStorage.setItem('userEmail', email.trim());
        window.location.href = '/dashboard';
        return;
      }

      // Regular user - submit to API
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userName', name.trim());
        localStorage.setItem('userEmail', email.trim());
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Failed to submit. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-kashmir-light-blue-50 via-kashmir-light-green-50 to-kashmir-light-neutral-50 dark:from-kashmir-dark-blue-50 dark:via-kashmir-dark-green-50 dark:to-kashmir-dark-neutral-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-6 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-kashmir-light-blue-500 to-kashmir-light-green-500 dark:from-kashmir-dark-blue-500 dark:to-kashmir-dark-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl text-white">❄️</span>
          </div>
          <h1 className="text-4xl font-bold text-kashmir-light-neutral-800 dark:text-kashmir-dark-neutral-200 mb-2">
            SkyKash
          </h1>
          <p className="text-kashmir-light-green-600 dark:text-kashmir-dark-green-400 font-semibold mb-2 text-lg">
            Kashmir-Inspired Weather App
          </p>
          <p className="text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300 mt-4 text-base">
            Subscribe to our newsletter for weather updates and personalized forecasts
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-kashmir-light-neutral-800 dark:text-kashmir-dark-neutral-200 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-kashmir-light-neutral-300 dark:border-kashmir-dark-neutral-400 rounded-xl focus:ring-2 focus:ring-kashmir-light-blue-500 dark:focus:ring-kashmir-dark-blue-500 focus:border-transparent bg-white dark:bg-kashmir-dark-neutral-100 text-kashmir-light-neutral-900 dark:text-kashmir-dark-neutral-100 transition-colors duration-300 placeholder-kashmir-light-neutral-500 dark:placeholder-kashmir-dark-neutral-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-kashmir-light-neutral-800 dark:text-kashmir-dark-neutral-200 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-kashmir-light-neutral-300 dark:border-kashmir-dark-neutral-400 rounded-xl focus:ring-2 focus:ring-kashmir-light-blue-500 dark:focus:ring-kashmir-dark-blue-500 focus:border-transparent bg-white dark:bg-kashmir-dark-neutral-100 text-kashmir-light-neutral-900 dark:text-kashmir-dark-neutral-100 transition-colors duration-300 placeholder-kashmir-light-neutral-500 dark:placeholder-kashmir-dark-neutral-500"
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="flex items-start space-x-3 bg-kashmir-light-neutral-50 dark:bg-kashmir-dark-neutral-100 p-4 rounded-xl border border-kashmir-light-neutral-200 dark:border-kashmir-dark-neutral-300">
            <input
              type="checkbox"
              id="privacy"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 text-kashmir-light-blue-500 dark:text-kashmir-dark-blue-500 border-kashmir-light-neutral-300 dark:border-kashmir-dark-neutral-400 rounded focus:ring-kashmir-light-blue-500 dark:focus:ring-kashmir-dark-blue-500"
              required
            />
            <label htmlFor="privacy" className="text-sm text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300">
              I agree to the{' '}
              <a href="/privacy" className="text-kashmir-light-blue-600 dark:text-kashmir-dark-blue-400 hover:underline font-medium">
                Privacy Policy
              </a>{' '}
              and want to receive weather updates and notifications
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-kashmir-light-blue-500 to-kashmir-light-green-500 hover:from-kashmir-light-blue-600 hover:to-kashmir-light-green-600 dark:from-kashmir-dark-blue-500 dark:to-kashmir-dark-green-500 dark:hover:from-kashmir-dark-blue-600 dark:hover:to-kashmir-dark-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Subscribing...
              </span>
            ) : (
              'Subscribe & Continue'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400">
            If UR Already a premium user? You'll be redirected automatically
          </p>
        </div>

        {/* Features Preview */}
        <div className="mt-8 pt-6 border-t border-kashmir-light-neutral-200 dark:border-kashmir-dark-neutral-300">
          <h3 className="text-sm font-semibold text-kashmir-light-neutral-800 dark:text-kashmir-dark-neutral-200 mb-3 text-center">What you'll get:</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-2 text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300">
              <span className="text-kashmir-light-green-500 dark:text-kashmir-dark-green-500">✓</span>
              <span>Live Weather Updates</span>
            </div>
            <div className="flex items-center space-x-2 text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300">
              <span className="text-kashmir-light-green-500 dark:text-kashmir-dark-green-500">✓</span>
              <span>Kashmir Forecasts</span>
            </div>
            <div className="flex items-center space-x-2 text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300">
              <span className="text-kashmir-light-green-500 dark:text-kashmir-dark-green-500">✓</span>
              <span>PWA Installation</span>
            </div>
            <div className="flex items-center space-x-2 text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300">
              <span className="text-kashmir-light-green-500 dark:text-kashmir-dark-green-500">✓</span>
              <span>Beautiful UI</span>
            </div>
            <div className="flex items-center space-x-2 text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300">
              <span className="text-kashmir-light-green-500 dark:text-kashmir-dark-green-500">✓</span>
              <span>+ Features</span>
            </div>
            <div className="flex items-center space-x-2 text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300">
              <span className="text-kashmir-light-green-500 dark:text-kashmir-dark-green-500">✓</span>
              <span>Mobile Optimized</span>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-kashmir-light-neutral-500 dark:text-kashmir-dark-neutral-500">
            SkyKash v2.0 • Built with ❤️ for Kashmir
          </p>
        </div>
      </div>
    </div>
  );
}
