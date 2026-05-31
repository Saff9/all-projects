import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { MinimalFooter } from './Footer';
import { PageLoader } from '../ui/Loading';

// Dashboard Layout
export const DashboardLayout = ({
  user,
  onLogout,
  isLoading = false,
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (isLoading) {
    return <PageLoader text="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar
        user={user}
        onLogout={onLogout}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <main
        className={`
          pt-16 min-h-screen
          transition-all duration-200
          ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}
        `}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {children || <Outlet />}
        </div>
        <MinimalFooter />
      </main>
    </div>
  );
};

// Public Layout (for landing, auth pages)
export const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <main>
        {children || <Outlet />}
      </main>
    </div>
  );
};

// Auth Layout (for login, register pages)
export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children || <Outlet />}
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                width: `${Math.random() * 300 + 50}px`,
                height: `${Math.random() * 300 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 50 - 25, 0],
                y: [0, Math.random() * 50 - 25, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Your Links, One Page
            </h2>
            <p className="text-lg text-white/80 max-w-md">
              Create a beautiful, customizable link-in-bio page in minutes.
              Share all your important links with one URL.
            </p>
          </motion.div>

          {/* Features List */}
          <motion.div
            className="mt-12 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {[
              'Beautiful templates',
              'Custom domains',
              'Detailed analytics',
              'QR codes',
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-white/90"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Profile Layout (for public profile pages)
export const ProfileLayout = ({ children, template = 'minimal' }) => {
  return (
    <div className="min-h-screen">
      {children || <Outlet />}
    </div>
  );
};

// Settings Layout
export const SettingsLayout = ({ children }) => {
  return (
    <div className="max-w-4xl mx-auto">
      {children || <Outlet />}
    </div>
  );
};

// Main Layout Component (wrapper)
const Layout = ({
  variant = 'dashboard',
  user,
  onLogout,
  isLoading,
  children,
}) => {
  const layouts = {
    dashboard: DashboardLayout,
    public: PublicLayout,
    auth: AuthLayout,
    profile: ProfileLayout,
    settings: SettingsLayout,
  };

  const LayoutComponent = layouts[variant] || DashboardLayout;

  return (
    <LayoutComponent
      user={user}
      onLogout={onLogout}
      isLoading={isLoading}
    >
      {children}
    </LayoutComponent>
  );
};

export default Layout;