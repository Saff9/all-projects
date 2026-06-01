import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Layout,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Link as LinkIcon,
  Palette,
  Globe,
} from 'lucide-react';

const Sidebar = ({
  isOpen = true,
  onToggle,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const mainNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/editor', label: 'Profile Editor', icon: Layout },
    { path: '/editor/links', label: 'Link Manager', icon: LinkIcon },
    { path: '/editor/theme', label: 'Theme', icon: Palette },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const bottomNavItems = [
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/help', label: 'Help & Support', icon: HelpCircle },
  ];

  const isActive = (path) => {
    if (path === '/editor') {
      return location.pathname === '/editor';
    }
    return location.pathname.startsWith(path);
  };

  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 80 },
  };

  const NavItem = ({ item, isCollapsed }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <Link
        to={item.path}
        className={`
          group relative flex items-center gap-3
          px-3 py-2.5 rounded-xl
          text-sm font-medium
          transition-all duration-200
          ${active
            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
          }
          ${isCollapsed ? 'justify-center' : ''}
        `}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-primary-600 dark:text-primary-400' : ''}`} />
        
        {!isCollapsed && (
          <span className="truncate">{item.label}</span>
        )}

        {active && !isCollapsed && (
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full"
            layoutId="sidebar-indicator"
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div
            className={`
              absolute left-full ml-2 px-2 py-1
              bg-gray-900 dark:bg-gray-700
              text-white text-xs rounded-md
              whitespace-nowrap
              opacity-0 invisible
              group-hover:opacity-100 group-hover:visible
              transition-all duration-200
              z-50
            `}
          >
            {item.label}
          </div>
        )}
      </Link>
    );
  };

  return (
    <motion.aside
      className={`
        fixed left-0 top-16 bottom-0 z-30
        bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-800
        flex flex-col
        ${className}
      `}
      variants={sidebarVariants}
      initial={false}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.2 }}
    >
      {/* Pro Banner */}
      {!isCollapsed && (
        <motion.div
          className="m-4 p-4 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Upgrade to Pro</span>
          </div>
          <p className="text-sm text-white/80 mb-3">
            Unlock all features and premium templates
          </p>
          <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
            Upgrade Now
          </button>
        </motion.div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavItem key={item.path} item={item} isCollapsed={isCollapsed} />
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
        {bottomNavItems.map((item) => (
          <NavItem key={item.path} item={item} isCollapsed={isCollapsed} />
        ))}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="
          absolute -right-3 top-20
          w-6 h-6 rounded-full
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          shadow-sm
          flex items-center justify-center
          text-gray-500 hover:text-gray-700 dark:hover:text-gray-300
          transition-colors
          z-10
        "
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Public Profile Link */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <a
            href={`/${user?.username || 'profile'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex items-center gap-2 px-3 py-2
              text-sm text-gray-600 dark:text-gray-400
              hover:text-primary-600 dark:hover:text-primary-400
              transition-colors
            "
          >
            <Globe className="w-4 h-4" />
            <span>View Public Profile</span>
          </a>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;