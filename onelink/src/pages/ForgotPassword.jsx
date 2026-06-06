import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { ForgotPassword as ForgotPasswordComponent } from '../components/auth'
import toast from 'react-hot-toast'

function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (email) => {
    try {
      setError('')
      setLoading(true)
      // Use magic link login to resend
      const result = await login(email)
      setSuccess(true)
      toast.success(result.message || 'Magic link sent!')
    } catch (err) {
      console.error('Resend error:', err)
      setError(err.message || 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <ForgotPasswordComponent
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          success={success}
        />
        <div className="text-center mt-4">
          <Link
            to="/login"
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPassword
