import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  Layout,
  BarChart3,
  Settings,
  LogOut,
  User,
  Bell,
  ChevronDown,
  Twitter,
  Instagram,
  Youtube,
} from 'lucide-react';
import { Avatar, Dropdown, ThemeToggle } from '../ui';

const Navbar = ({
  user,
  onLogout,
  onToggleSidebar,
  isSidebarOpen,
  className = '',
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/editor', label: 'Editor', icon: Layout },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  const userMenuItems = [
    {
      label: 'Your Profile',
      icon: <User className="w-4 h-4" />,
      onClick: () => window.location.href = '/settings',
    },
    {
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => window.location.href = '/settings',
    },
    { divider: true },
    {
      label: 'Sign out',
      icon: <LogOut className="w-4 h-4" />,
      onClick: onLogout,
    },
  ];

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-40
        bg-white/80 dark:bg-gray-900/80
        backdrop-blur-xl
        border-b border-gray-200 dark:border-gray-800
        ${className}
      `}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/favicon.svg" 
                alt="OneLink" 
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                OneLink
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 ml-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg
                      text-sm font-medium
                      transition-all duration-200
                      ${isActive(item.path)
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle variant="toggle" size="sm" />

            {/* Notifications */}
            <button
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full" />
            </button>

            {/* User Menu */}
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Avatar
                    src={user?.photoURL}
                    name={user?.displayName}
                    size="sm"
                  />
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.displayName || 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                </button>
              }
              items={userMenuItems}
              align="right"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg
                      text-sm font-medium
                      transition-all duration-200
                      ${isActive(item.path)
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              
              {/* Social Links in Mobile Menu */}
              <div className="pt-4 pb-2 border-t border-gray-200 dark:border-dark-700">
                <p className="px-4 text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-3">
                  Follow Us
                </p>
                <div className="flex items-center gap-2 px-4">
                  <a
                    href="https://twitter.com/onelink"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-dark-800 text-dark-400 hover:text-primary-400 hover:bg-dark-700 transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.instagram.com/genzSaffan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-dark-800 text-dark-400 hover:text-pink-500 hover:bg-dark-700 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.youtube.com/@developerSaffan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-dark-800 text-dark-400 hover:text-red-500 hover:bg-dark-700 transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;