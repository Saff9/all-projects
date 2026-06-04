import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Card = forwardRef(({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  glass = false,
  bordered = true,
  className = '',
  onClick,
  ...props
}, ref) => {
  const variants = {
    default: 'bg-slate-800',
    elevated: 'bg-slate-800 shadow-lg',
    outline: 'bg-transparent border-2 border-slate-700',
    gradient: 'bg-gradient-to-br from-slate-800 to-slate-900',
    glass: 'bg-slate-800/80 backdrop-blur-xl',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
    xl: 'p-8',
  };

  const baseStyles = `
    rounded-2xl
    transition-all duration-300 ease-out
    ${variants[glass ? 'glass' : variant]}
    ${paddings[padding]}
    ${bordered && variant !== 'outline' ? 'border border-slate-700' : ''}
    ${hover ? 'cursor-pointer hover:shadow-xl hover:shadow-slate-900/50 hover:-translate-y-1' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: hover ? { scale: 1.02, y: -4 } : {},
    tap: hover ? { scale: 0.98 } : {},
  };

  return (
    <motion.div
      ref={ref}
      className={baseStyles}
      onClick={onClick}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

// Card Header Component
export const CardHeader = ({ children, className = '', action, ...props }) => {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`} {...props}>
      <div className="flex-1">{children}</div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

// Card Title Component
export const CardTitle = ({ children, className = '', as: Component = 'h3', ...props }) => {
  return (
    <Component
      className={`text-lg font-semibold text-white ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

// Card Description Component
export const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-sm text-slate-400 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
};

// Card Content Component
export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

// Card Footer Component
export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`flex items-center justify-between mt-4 pt-4 border-t border-slate-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Stats Card Component
export const StatsCard = ({
  title,
  value,
  change,
  changeType = 'increase',
  icon,
  iconColor = 'primary',
  className = '',
}) => {
  const iconColors = {
    primary: 'bg-blue-500/20 text-blue-400',
    secondary: 'bg-indigo-500/20 text-indigo-400',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/20 text-red-400',
  };

  return (
    <Card hover className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${
                  changeType === 'increase'
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {changeType === 'increase' ? '+' : '-'}{change}
              </span>
              <span className="text-sm text-slate-400 ml-1.5">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-xl ${iconColors[iconColor]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

// Feature Card Component
export const FeatureCard = ({
  icon,
  title,
  description,
  className = '',
}) => {
  return (
    <Card hover className={`text-center ${className}`}>
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white mb-4">
        {icon}
      </div>
      <CardTitle className="text-xl mb-2">{title}</CardTitle>
      <CardDescription className="text-base">{description}</CardDescription>
    </Card>
  );
};

// Profile Card Component
export const ProfileCard = ({
  avatar,
  name,
  username,
  bio,
  links,
  className = '',
}) => {
  return (
    <Card className={`text-center ${className}`}>
      <div className="relative inline-block mb-4">
        <img
          src={avatar}
          alt={name}
          className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-700 shadow-lg"
        />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-800" />
      </div>
      <CardTitle>{name}</CardTitle>
      <p className="text-sm text-blue-400 font-medium">@{username}</p>
      {bio && <CardDescription className="mt-2">{bio}</CardDescription>}
      {links && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-sm text-slate-400">{links} links</p>
        </div>
      )}
    </Card>
  );
};

export default Card;