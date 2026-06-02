import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, X, CheckCircle, AlertCircle } from 'lucide-react';

// Simple email validation
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Simple Input component for this form
const FormInput = ({ name, placeholder, value, onChange, error, type = 'text', className = '' }) => (
  <div className={className}>
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`
        w-full px-4 py-3 rounded-xl
        bg-gray-50 dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        text-gray-900 dark:text-white
        placeholder-gray-400 dark:placeholder-gray-500
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
        transition-all duration-200
        ${error ? 'border-red-500 focus:ring-red-500' : ''}
      `}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

/**
 * ContactForm Component
 * Optional contact form for profile visitors to send messages
 * 
 * @param {boolean} isOpen - Whether the form is visible
 * @param {function} onClose - Close handler
 * @param {function} onSubmit - Submit handler
 * @param {string} toEmail - Email to send messages to
 * @param {object} profile - Profile data for context
 * @param {string} className - Additional CSS classes
 */
const ContactForm = ({
  isOpen = false,
  onClose,
  onSubmit,
  toEmail,
  profile = {},
  className = '',
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const { displayName } = profile;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Call onSubmit handler if provided
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default behavior - simulate sending
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Contact form submitted:', { to: toEmail, ...formData });
      }

      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Auto close after success
      setTimeout(() => {
        onClose?.();
        setSubmitStatus(null);
      }, 2000);
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    setErrors({});
    setSubmitStatus(null);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Form Container */}
          <motion.div
            className={`
              relative w-full max-w-md
              bg-white dark:bg-gray-900
              rounded-2xl shadow-2xl
              p-6
              ${className}
            `}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Contact {displayName || 'Me'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Send a message and I'll get back to you soon
              </p>
            </div>

            {/* Success Message */}
            {submitStatus === 'success' && (
              <motion.div
                className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-sm text-green-700 dark:text-green-400">
                  Message sent successfully!
                </p>
              </motion.div>
            )}

            {/* Error Message */}
            {submitStatus === 'error' && (
              <motion.div
                className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-700 dark:text-red-400">
                  Failed to send message. Please try again.
                </p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <FormInput
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
              />

              {/* Email */}
              <FormInput
                name="email"
                type="email"
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />

              {/* Subject */}
              <FormInput
                name="subject"
                placeholder="Subject (optional)"
                value={formData.subject}
                onChange={handleChange}
              />

              {/* Message */}
              <div>
                <textarea
                  name="message"
                  placeholder="Your message..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className={`
                    w-full px-4 py-3 rounded-xl
                    bg-gray-50 dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700
                    text-gray-900 dark:text-white
                    placeholder-gray-400 dark:placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    resize-none
                    transition-all duration-200
                    ${errors.message ? 'border-red-500 focus:ring-red-500' : ''}
                  `}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                className={`
                  w-full py-3 px-4 rounded-xl
                  bg-primary-500 hover:bg-primary-600
                  text-white font-medium
                  flex items-center justify-center gap-2
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                disabled={isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * ContactFormButton Component
 * Button to trigger contact form modal
 */
export const ContactFormButton = ({
  onClick,
  variant = 'default',
  className = '',
}) => {
  const variants = {
    default: `
      px-4 py-2 rounded-lg
      bg-gray-100 dark:bg-gray-800
      hover:bg-gray-200 dark:hover:bg-gray-700
      text-gray-700 dark:text-gray-300
    `,
    primary: `
      px-4 py-2 rounded-lg
      bg-primary-500 hover:bg-primary-600
      text-white
    `,
    outline: `
      px-4 py-2 rounded-lg
      border border-gray-300 dark:border-gray-600
      hover:bg-gray-50 dark:hover:bg-gray-800
      text-gray-700 dark:text-gray-300
    `,
  };

  return (
    <motion.button
      onClick={onClick}
      className={`
        flex items-center gap-2
        font-medium
        transition-all duration-200
        ${variants[variant]}
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Mail className="w-4 h-4" />
      <span>Contact</span>
    </motion.button>
  );
};

/**
 * ContactFormInline Component
 * Inline contact form without modal
 */
export const ContactFormInline = ({
  onSubmit,
  profile = {},
  className = '',
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit?.(formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Send a message
      </h3>

      {submitStatus === 'success' ? (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span>Message sent successfully!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <FormInput
            name="name"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
          <FormInput
            name="email"
            type="email"
            placeholder="Your email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
          <textarea
            name="message"
            placeholder="Your message..."
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <motion.button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-all disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </motion.button>
        </form>
      )}
    </div>
  );
};

export default ContactForm;