import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { LoginForm, SocialLoginButtons } from '../components/auth'
import toast from 'react-hot-toast'

function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, loginWithGoogle, loginWithGithub } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async ({ email }) => {
    try {
      setError('')
      setLoading(true)
      const result = await login(email)
      toast.success(result.message || 'Check your email for the magic link!')

      // Redirect to check email page
      navigate('/check-email', { state: { email } })
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setError('')
      setLoading(true)
      await loginWithGoogle(from)
    } catch (err) {
      console.error('Google login error:', err)
      setError(err.message || 'Google sign in failed')
      setLoading(false)
    }
  }

  const handleGithubLogin = async () => {
    try {
      setError('')
      setLoading(true)
      await loginWithGithub(from)
    } catch (err) {
      console.error('GitHub login error:', err)
      setError(err.message || 'GitHub sign in failed')
      setLoading(false)
    }
  }

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
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            />
            <span className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
              OneLink
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white">
            Welcome back
          </h1>
          <p className="text-slate-400 mt-2">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-xl">
          <LoginForm
            onSubmit={handleSubmit}
            onGoogleLogin={handleGoogleLogin}
            onGithubLogin={handleGithubLogin}
            loading={loading}
            error={error}
          />

          {/* Social Login */}
          <div className="mt-6">
            <SocialLoginButtons
              onGoogleLogin={handleGoogleLogin}
              onGithubLogin={handleGithubLogin}
              loading={loading}
              mode="login"
            />
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          By signing in, you agree to our{' '}
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
  )
}

export default Login
