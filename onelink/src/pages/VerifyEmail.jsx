import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function VerifyEmail() {
  const { signIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!isLoaded || !signIn) return;

      try {
        // Complete the verification using the current URL (Clerk handles the token)
        await signIn.create({
          strategy: 'email_link',
          redirectUrl: window.location.href,
        });

        // Verification successful, redirect to dashboard
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('Verification error:', err);
        // Handled by UI below
      }
    };

    verifyEmail();
  }, [isLoaded, signIn, navigate]);

  // We'll show a loading state initially, then success or error
  // The actual verification result is determined by whether signIn.create throws
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'

  const handleCompleteVerification = async () => {
    if (!isLoaded || !signIn) return;

    try {
      setStatus('loading');
      await signIn.create({
        strategy: 'email_link',
        redirectUrl: window.location.href,
      });
      setStatus('success');
      setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-xl text-center">
          {status === 'loading' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Verifying your email
              </h1>
              <p className="text-slate-400">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-green-500" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Email verified!
              </h1>
              <p className="text-slate-400 mb-6">
                Your email has been successfully verified.
                Redirecting you to your dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <XCircle className="w-10 h-10 text-red-500" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Verification failed
              </h1>
              <p className="text-slate-400 mb-6">
                The verification link is invalid or has expired.
                Please request a new one.
              </p>
              <button
                onClick={handleCompleteVerification}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Try again
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default VerifyEmail;
