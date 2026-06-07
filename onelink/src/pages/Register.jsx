import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { RegisterForm, SocialLoginButtons } from '../components/auth';
import toast from 'react-hot-toast';

function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup, loginWithGoogle, loginWithGithub } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async ({ email, displayName }) => {
    try {
      setError('');
      setLoading(true);

      const result = await signup(email, displayName);
      toast.success(result.message || 'Check your email for the magic link!');

      // Redirect to a page that explains to check email
      navigate('/check-email', { state: { email } });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign in failed');
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await loginWithGithub();
    } catch (err) {
      setError(err.message || 'GitHub sign in failed');
      setLoading(false);
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
        {/* Logo & Header */}
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
          <h1 className="text-2xl font-bold text-white">
            Create your account
          </h1>
          <p className="text-slate-400 mt-2">
            Start building your link-in-bio page today
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-xl">
          <RegisterForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />

          {/* Social Login */}
          <div className="mt-6">
            <SocialLoginButtons
              onGoogleLogin={handleGoogleLogin}
              onGithubLogin={handleGithubLogin}
              loading={loading}
              mode="register"
            />
          </div>

          {/* Sign In Link */}
          <p className="text-center text-slate-400 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="text-2xl mb-2">🎨</div>
            <p className="text-sm text-slate-400">Custom Themes</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-sm text-slate-400">Analytics</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">📱</div>
            <p className="text-sm text-slate-400">QR Codes</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="text-slate-300 hover:text-blue-400">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-slate-300 hover:text-blue-400">
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;
