import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const ForgotPassword = ({
  onSubmit,
  loading = false,
  error = '',
  success = false,
}) => {
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');

  const validateForm = () => {
    if (!email) {
      setFormError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Please enter a valid email address');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(email);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="card p-8">
        {/* Back Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <AnimatePresence mode="wait">
          {success ? (
               <motion.div
                 key="success"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="text-center py-4"
               >
                 <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                   <CheckCircle className="w-8 h-8 text-success-600 dark:text-success-400" />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                   Check your email
                 </h2>
                 <p className="text-gray-600 dark:text-gray-400 mb-4">
                   We've sent a magic link to<br />
                   <span className="font-medium text-gray-900 dark:text-white">{email}</span>
                 </p>
                 <p className="text-sm text-gray-500 dark:text-gray-400">
                   Didn't receive the email? Check your spam folder or{' '}
                   <button
                     onClick={() => onSubmit(email)}
                     className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                   >
                     try again
                   </button>
                 </p>
               </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
               {/* Header */}
               <div className="text-center mb-6">
                 <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                   Didn't receive the magic link?
                 </h2>
                 <p className="text-gray-600 dark:text-gray-400 mt-2">
                   Enter your email address and we'll send you a new magic link to sign in.
                 </p>
               </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-error-500" />
                      <p className="text-sm text-error-600 dark:text-error-400">
                        {error}
                      </p>
                    </div>
                  </motion.div>
                )}

                <Input
                  id="email"
                  type="email"
                  label="Email Address"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formError) setFormError('');
                  }}
                  error={formError}
                  icon={<Mail className="w-5 h-5" />}
                  disabled={loading}
                  required
                  autoComplete="email"
                />

                 <Button
                   type="submit"
                   variant="primary"
                   fullWidth
                   disabled={loading}
                   className="h-12"
                 >
                   {loading ? (
                     <Loader2 className="w-5 h-5 animate-spin" />
                   ) : (
                     'Send Magic Link'
                   )}
                 </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;