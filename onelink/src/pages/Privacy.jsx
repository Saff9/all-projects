import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Database, Mail, ArrowLeft } from 'lucide-react'

function Privacy() {
  const sections = [
    {
      icon: Shield,
      title: 'Information We Collect',
      content: `We collect information you provide directly to us, including:
      • Account information (name, email, username)
      • Profile information (bio, avatar, links)
      • Usage data (clicks, views, analytics)
      • Device information (browser, IP address)`
    },
    {
      icon: Lock,
      title: 'How We Use Your Information',
      content: `We use the information we collect to:
      • Provide, maintain, and improve our services
      • Process transactions and send related information
      • Send you technical notices, updates, and support messages
      • Respond to your comments, questions, and requests
      • Communicate with you about products, services, and events`
    },
    {
      icon: Eye,
      title: 'Information Sharing',
      content: `We do not sell, trade, or otherwise transfer your personal information to outside parties. We may share information with:
      • Service providers who assist in our operations
      • Law enforcement when required by law
      • Business transfers in case of merger or acquisition`
    },
    {
      icon: Database,
      title: 'Data Security',
      content: `We implement appropriate technical and organizational measures to protect your personal information, including:
      • Encryption of data in transit and at rest
      • Regular security assessments
      • Access controls and authentication
      • Secure data storage with industry standards`
    },
    {
      icon: Mail,
      title: 'Contact Us',
      content: `If you have any questions about this Privacy Policy, please contact us at:
      • Email: privacy@onelink.app
      • Through our contact form on the website`
    }
  ]

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-500/30 blur-lg rounded-lg" />
                  <img 
                    src="/favicon.svg" 
                    alt="OneLink" 
                    className="w-8 h-8 relative"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">
                  OneLink
                </span>
              </Link>
            </div>
            <nav className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="text-dark-300 hover:text-white font-medium transition-colors"
              >
                Home
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Back Link */}
            <Link 
              to="/" 
              className="inline-flex items-center text-primary-400 hover:text-primary-300 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>

            {/* Title */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-cyan-500/20 border border-primary-500/30 mb-6">
                <Shield className="w-8 h-8 text-primary-400" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Privacy Policy
              </h1>
              <p className="text-xl text-dark-400 max-w-2xl mx-auto">
                Your privacy is important to us. This policy outlines how we collect, use, and protect your information.
              </p>
              <p className="text-dark-500 mt-4">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Content Sections */}
            <div className="space-y-8">
              {/* Introduction */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-dark-900/50 rounded-2xl p-8 border border-dark-800 backdrop-blur-sm"
              >
                <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
                <p className="text-dark-300 leading-relaxed">
                  OneLink ("we," "our," or "us") respects your privacy and is committed to protecting your personal information. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
                  website and services.
                </p>
              </motion.div>

              {/* Sections */}
              {sections.map((section, index) => {
                const Icon = section.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (index + 3) }}
                    className="bg-dark-900/50 rounded-2xl p-8 border border-dark-800 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-cyan-500/20 border border-primary-500/30 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-4">{section.title}</h2>
                        <div className="text-dark-300 whitespace-pre-line leading-relaxed">
                          {section.content}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              {/* Cookies Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-dark-900/50 rounded-2xl p-8 border border-dark-800 backdrop-blur-sm"
              >
                <h2 className="text-2xl font-bold text-white mb-4">Cookies and Tracking Technologies</h2>
                <p className="text-dark-300 leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to track the activity on our service and hold certain information. 
                  Cookies are files with a small amount of data that may include an anonymous unique identifier.
                </p>
                <p className="text-dark-300 leading-relaxed">
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
                  However, if you do not accept cookies, you may not be able to use some portions of our service.
                </p>
              </motion.div>

              {/* Children's Privacy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-dark-900/50 rounded-2xl p-8 border border-dark-800 backdrop-blur-sm"
              >
                <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
                <p className="text-dark-300 leading-relaxed">
                  Our service does not address anyone under the age of 13. We do not knowingly collect personally identifiable 
                  information from children under 13. If you are a parent or guardian and you are aware that your child has 
                  provided us with personal information, please contact us.
                </p>
              </motion.div>

              {/* Changes to Policy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-dark-900/50 rounded-2xl p-8 border border-dark-800 backdrop-blur-sm"
              >
                <h2 className="text-2xl font-bold text-white mb-4">Changes to This Privacy Policy</h2>
                <p className="text-dark-300 leading-relaxed">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
                  Privacy Policy on this page and updating the "last updated" date at the top of this policy.
                </p>
              </motion.div>
            </div>

            {/* Contact CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="mt-12 text-center"
            >
              <p className="text-dark-400 mb-4">
                Have questions about this Privacy Policy?
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all"
              >
                Contact Us
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="OneLink" className="w-6 h-6" />
            <span className="text-dark-400 text-sm">© {new Date().getFullYear()} OneLink. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">Terms of Service</Link>
            <Link to="/contact" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">Contact</Link>
            <Link to="/about" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Privacy
