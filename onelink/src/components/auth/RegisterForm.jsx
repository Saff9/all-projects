import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, User, Loader2, Check, X } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const RegisterForm = ({
  onSubmit,
  loading = false,
  error = '',
}) => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (formData.displayName && formData.displayName.length < 2) {
      errors.displayName = 'Display name must be at least 2 characters';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* General Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl"
        >
          <p className="text-sm text-error-600 dark:text-error-400 text-center">
            {error}
          </p>
        </motion.div>
      )}

      {/* Info box about magic link */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
      >
        <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
          We'll send you a magic link to sign up. No password needed!
        </p>
      </motion.div>

      {/* Display Name Field */}
      <Input
        id="displayName"
        type="text"
        label="Display Name"
        placeholder="John Doe"
        value={formData.displayName}
        onChange={(e) => handleChange('displayName', e.target.value)}
        error={formErrors.displayName}
        icon={<User className="w-5 h-5" />}
        disabled={loading}
        autoComplete="name"
        helperText="This is how others will see you"
      />

      {/* Email Field */}
      <Input
        id="email"
        type="email"
        label="Email Address"
        placeholder="you@example.com"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={formErrors.email}
        icon={<Mail className="w-5 h-5" />}
        disabled={loading}
        required
        autoComplete="email"
      />

      {/* Terms Agreement */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        By creating an account, you agree to our{' '}
        <Link to="/terms" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/privacy" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
          Privacy Policy
        </Link>
      </p>

      {/* Submit Button */}
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
    </motion.form>
  );
};

export default RegisterForm;
