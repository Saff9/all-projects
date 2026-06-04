import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  error,
  success,
  helperText,
  icon,
  iconPosition = 'left',
  disabled = false,
  required = false,
  fullWidth = true,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const baseInputStyles = `
    w-full px-4 py-2.5
    bg-slate-800
    border-2 rounded-xl
    text-white
    placeholder-slate-400
    transition-all duration-200 ease-out
    focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-700
  `;

  const stateStyles = {
    default: 'border-slate-600 hover:border-slate-500',
    focused: 'border-blue-500 ring-4 ring-blue-500/20',
    error: 'border-red-500 bg-red-500/10',
    success: 'border-green-500 bg-green-500/10',
  };

  const getState = () => {
    if (error) return 'error';
    if (success) return 'success';
    if (isFocused) return 'focused';
    return 'default';
  };

  const paddingStyles = {
    left: icon ? 'pl-11' : 'pl-4',
    right: icon && iconPosition === 'right' ? 'pr-11' : isPassword ? 'pr-11' : 'pr-4',
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            ${baseInputStyles}
            ${stateStyles[getState()]}
            ${icon && iconPosition === 'left' ? 'pl-11' : ''}
            ${icon && iconPosition === 'right' ? 'pr-11' : ''}
            ${isPassword ? 'pr-11' : ''}
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {(isPassword || (icon && iconPosition === 'right')) && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
            {icon && iconPosition === 'right' && !isPassword && (
              <span className="text-gray-400 dark:text-gray-500">
                {icon}
              </span>
            )}
          </div>
        )}

        {/* Success/Error Icon */}
        {(error || success) && !isPassword && !icon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {error && <AlertCircle className="w-5 h-5 text-error-500" />}
            {success && <CheckCircle2 className="w-5 h-5 text-success-500" />}
          </div>
        )}
      </div>

      {/* Helper Text / Error Message */}
      <AnimatePresence mode="wait">
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-1.5"
          >
            {error && (
              <p id={`${props.id}-error`} className="text-sm text-error-600 dark:text-error-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
            {!error && helperText && (
              <p id={`${props.id}-helper`} className="text-sm text-gray-500 dark:text-gray-400">
                {helperText}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = 'Input';

// Textarea variant
export const Textarea = forwardRef(({
  label,
  placeholder,
  error,
  success,
  helperText,
  disabled = false,
  required = false,
  rows = 4,
  fullWidth = true,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const baseStyles = `
    w-full px-4 py-3
    bg-white dark:bg-gray-900
    border-2 rounded-xl
    text-gray-900 dark:text-white
    placeholder-gray-400 dark:placeholder-gray-500
    transition-all duration-200 ease-out
    focus:outline-none
    resize-none
    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-800
  `;

  const stateStyles = {
    default: 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
    focused: 'border-primary-500 dark:border-primary-400 ring-4 ring-primary-500/10 dark:ring-primary-400/10',
    error: 'border-error-500 dark:border-error-400 bg-error-50/50 dark:bg-error-900/10',
    success: 'border-success-500 dark:border-success-400 bg-success-50/50 dark:bg-success-900/10',
  };

  const getState = () => {
    if (error) return 'error';
    if (success) return 'success';
    if (isFocused) return 'focused';
    return 'default';
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`${baseStyles} ${stateStyles[getState()]} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />

      <AnimatePresence mode="wait">
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-1.5"
          >
            {error && (
              <p className="text-sm text-error-600 dark:text-error-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
            {!error && helperText && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {helperText}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Select variant
export const Select = forwardRef(({
  label,
  options = [],
  placeholder = 'Select an option',
  error,
  success,
  helperText,
  disabled = false,
  required = false,
  fullWidth = true,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const baseStyles = `
    w-full px-4 py-2.5
    bg-white dark:bg-gray-900
    border-2 rounded-xl
    text-gray-900 dark:text-white
    transition-all duration-200 ease-out
    focus:outline-none
    appearance-none cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-800
  `;

  const stateStyles = {
    default: 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
    focused: 'border-primary-500 dark:border-primary-400 ring-4 ring-primary-500/10 dark:ring-primary-400/10',
    error: 'border-error-500 dark:border-error-400 bg-error-50/50 dark:bg-error-900/10',
    success: 'border-success-500 dark:border-success-400 bg-success-50/50 dark:bg-success-900/10',
  };

  const getState = () => {
    if (error) return 'error';
    if (success) return 'success';
    if (isFocused) return 'focused';
    return 'default';
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          disabled={disabled}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`${baseStyles} ${stateStyles[getState()]} pr-10 ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-1.5"
          >
            {error && (
              <p className="text-sm text-error-600 dark:text-error-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
            {!error && helperText && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {helperText}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Select.displayName = 'Select';

export default Input;