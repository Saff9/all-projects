import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

function CheckEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!email) return;

    setResending(true);
    try {
      // This would typically call an API to resend the magic link
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Magic link resent!');
    } catch (err) {
      toast.error('Failed to resend. Please try again.');
    } finally {
      setResending(false);
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
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6 group">
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/25"
              whileHover={{ scale: 1.05, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
            />
            <span className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
              OneLink
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-xl text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Mail className="w-10 h-10 text-blue-500" />
          </motion.div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-white mb-2">
            Check your email
          </h1>
          <p className="text-slate-400 mb-6">
            We've sent a magic link to:
          </p>

          {/* Email display */}
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-6">
            <p className="text-white font-medium break-all">
              {email || 'your email address'}
            </p>
          </div>

          <p className="text-slate-400 text-sm mb-6">
            Click the link in the email to sign {email ? 'up' : 'in'}.
            The link will expire in 24 hours.
          </p>

          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={resending || !email}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors mb-6"
          >
            {resending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Resending...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Resend magic link
              </>
            )}
          </button>

          {/* Back to login */}
          <div className="pt-6 border-t border-slate-700">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Didn't receive the email? Check your spam folder or try a different email address.
        </p>
      </motion.div>
    </div>
  );
}

export default CheckEmail;
