import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const EmailVerification = () => {
  const { currentUser, sendVerificationEmail, logout } = useAuth();
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    
    try {
      setResending(true);
      await sendVerificationEmail();
      toast.success('Verification email sent!');
      setCountdown(60); // 60 second cooldown
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      setChecking(true);
      // Reload the user to check if email is verified
      await currentUser?.reload();
      
      if (currentUser?.emailVerified) {
        toast.success('Email verified successfully!');
        navigate('/dashboard');
      } else {
        toast.error('Email not yet verified. Please check your inbox.');
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      toast.error('Failed to check verification status.');
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          {/* Back Link */}
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Sign out and use different account
          </button>

          {/* Icon */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Mail className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Verify your email
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              We've sent a verification link to
            </p>
            <p className="font-medium text-gray-900 dark:text-white mt-1">
              {currentUser?.email}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              What to do:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary-600 dark:text-primary-400">1</span>
                </span>
                Check your inbox for the verification email
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary-600 dark:text-primary-400">2</span>
                </span>
                Click the verification link in the email
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary-600 dark:text-primary-400">3</span>
                </span>
                Come back here and click "I've verified my email"
              </li>
            </ul>
          </div>

          {/* Spam Folder Notice */}
          <div className="flex items-start gap-2 p-3 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-xl mb-6">
            <AlertCircle className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-warning-700 dark:text-warning-300">
              <strong>Can't find the email?</strong> Check your spam folder or promotions tab.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              onClick={handleCheckVerification}
              disabled={checking}
              className="h-12"
            >
              {checking ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  I've verified my email
                </>
              )}
            </Button>

            <Button
              variant="outline"
              fullWidth
              onClick={handleResendEmail}
              disabled={resending || countdown > 0}
              className="h-12"
            >
              {resending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : countdown > 0 ? (
                `Resend email in ${countdown}s`
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Resend verification email
                </>
              )}
            </Button>
          </div>

          {/* Help Link */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Having trouble?{' '}
            <a
              href="mailto:support@onelink.app"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Contact support
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerification;