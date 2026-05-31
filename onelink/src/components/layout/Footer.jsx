import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Github, Twitter, Linkedin, Instagram, Mail, Youtube } from 'lucide-react';

const Footer = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', href: '/#features' },
      { label: 'Templates', href: '/templates' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Changelog', href: '/changelog' },
    ],
    resources: [
      { label: 'Documentation', href: '/docs' },
      { label: 'API', href: '/api' },
      { label: 'Blog', href: '/blog' },
      { label: 'Support', href: '/support' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/onelink', label: 'Twitter', color: 'hover:text-primary-400' },
    { icon: Github, href: 'https://github.com/onelink', label: 'GitHub', color: 'hover:text-primary-400' },
    { icon: Linkedin, href: 'https://linkedin.com/company/onelink', label: 'LinkedIn', color: 'hover:text-primary-400' },
    { icon: Instagram, href: 'https://www.instagram.com/genzSaffan', label: 'Instagram', color: 'hover:text-pink-500' },
    { icon: Youtube, href: 'https://www.youtube.com/@developerSaffan', label: 'YouTube', color: 'hover:text-red-500' },
    { icon: Mail, href: 'mailto:hello@onelink.app', label: 'Email', color: 'hover:text-cyan-400' },
  ];

  return (
    <footer className={`bg-dark-950 border-t border-dark-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/50 blur-lg rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">O</span>
                </div>
              </div>
              <span className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
                OneLink
              </span>
            </Link>
            <p className="text-sm text-dark-400 mb-4 max-w-xs">
              Create your personalized link-in-bio page with beautiful templates and powerful analytics.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg bg-dark-900 text-dark-400 ${social.color} border border-dark-800 hover:border-primary-500/50 transition-all`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-dark-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-dark-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-dark-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-dark-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-dark-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-dark-500 flex items-center gap-1">
            © {currentYear} OneLink. Made with{' '}
            <Heart className="w-4 h-4 text-error-500 fill-current animate-pulse" /> for creators.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/privacy"
              className="text-sm text-dark-500 hover:text-primary-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-dark-500 hover:text-primary-400 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/contact"
              className="text-sm text-dark-500 hover:text-primary-400 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Minimal Footer (for dashboard pages)
export const MinimalFooter = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/onelink', label: 'Twitter' },
    { icon: Github, href: 'https://github.com/onelink', label: 'GitHub' },
  ];

  return (
    <footer className={`py-4 px-6 border-t border-dark-800 bg-dark-950 ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-dark-500">
        <p>© {currentYear} OneLink. All rights reserved.</p>
        <div className="flex items-center gap-4">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-400 transition-colors"
                aria-label={social.label}
              >
                <Icon className="w-4 h-4" />
              </a>
            );
          })}
          <Link
            to="/privacy"
            className="hover:text-primary-400 transition-colors"
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            className="hover:text-primary-400 transition-colors"
          >
            Terms
          </Link>
          <Link
            to="/contact"
            className="hover:text-primary-400 transition-colors"
          >
            Contact
          </Link>
          <Link
            to="/about"
            className="hover:text-primary-400 transition-colors"
          >
            About
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
