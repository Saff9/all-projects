import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Scale, AlertTriangle, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'

function Terms() {
  const sections = [
    {
      title: 'Acceptance of Terms',
      content: `By accessing and using OneLink ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.`
    },
    {
      title: 'Description of Service',
      content: `OneLink provides users with the ability to create a personalized link-in-bio page that consolidates multiple links to social media profiles, websites, and other content. The service includes analytics, QR code generation, and various customization options.`
    },
    {
      title: 'User Accounts',
      content: `To use our service, you must create an account. You agree to:
      • Provide accurate and complete registration information
      • Maintain the security of your account and password
      • Accept responsibility for all activities under your account
      • Notify us immediately of any unauthorized use
      • Be at least 13 years of age to use this service`
    },
    {
      title: 'User Content',
      content: `You retain ownership of all content you submit to OneLink, including links, images, bio information, and profile data. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, display, and reproduce your content solely for providing and improving our service.`
    },
    {
      title: 'Prohibited Activities',
      content: `You agree not to use the service to:
      • Upload or transmit viruses, malware, or other harmful code
      • Violate any applicable laws or regulations
      • Infringe upon the rights of others
      • Engage in spamming, phishing, or other deceptive practices
      • Attempt to gain unauthorized access to the service
      • Use the service for any illegal or unauthorized purpose`
    },
    {
      title: 'Intellectual Property',
      content: `The OneLink service, including its original content, features, and functionality, are owned by OneLink and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not modify, reproduce, distribute, or create derivative works without explicit permission.`
    },
    {
      title: 'Payment and Billing',
      content: `Some features of OneLink require payment. By subscribing to a paid plan, you agree to pay all fees and charges incurred. All payments are non-refundable unless otherwise specified. We reserve the right to change fees at any time with reasonable notice.`
    },
    {
      title: 'Disclaimer of Warranties',
      content: `THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. ONELINK MAKES NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.`
    },
    {
      title: 'Limitation of Liability',
      content: `IN NO EVENT SHALL ONELINK BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE.`
    },
    {
      title: 'Indemnification',
      content: `You agree to defend, indemnify, and hold harmless OneLink and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including without limitation reasonable legal and accounting fees, arising out of or in any way connected with your access to or use of the service.`
    },
    {
      title: 'Termination',
      content: `We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the terms. Upon termination, your right to use the service will immediately cease.`
    },
    {
      title: 'Governing Law',
      content: `These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which OneLink operates, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these terms will not be considered a waiver of those rights.`
    }
  ]

  const doList = [
    'Keep your account credentials secure',
    'Provide accurate information',
    'Use the service lawfully',
    'Respect other users',
    'Report any violations'
  ]

  const dontList = [
    'Share your account credentials',
    'Post harmful or illegal content',
    'Attempt to hack or exploit the service',
    'Violate others\' privacy or rights',
    'Use the service for spam'
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
                <Scale className="w-8 h-8 text-primary-400" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Terms of Service
              </h1>
              <p className="text-xl text-dark-400 max-w-2xl mx-auto">
                Please read these terms carefully before using OneLink. By using our service, you agree to these terms.
              </p>
              <p className="text-dark-500 mt-4">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Quick Summary */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* Do's */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-dark-900/50 rounded-2xl p-6 border border-dark-800 backdrop-blur-sm"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  You Should
                </h3>
                <ul className="space-y-3">
                  {doList.map((item, index) => (
                    <li key={index} className="flex items-center text-dark-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Don'ts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-dark-900/50 rounded-2xl p-6 border border-dark-800 backdrop-blur-sm"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <XCircle className="w-5 h-5 text-red-400 mr-2" />
                  You Should Not
                </h3>
                <ul className="space-y-3">
                  {dontList.map((item, index) => (
                    <li key={index} className="flex items-center text-dark-300">
                      <XCircle className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Content Sections */}
            <div className="space-y-6">
              {sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 4) }}
                  className="bg-dark-900/50 rounded-2xl p-8 border border-dark-800 backdrop-blur-sm"
                >
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 text-primary-400 mr-2" />
                    {section.title}
                  </h2>
                  <div className="text-dark-300 whitespace-pre-line leading-relaxed">
                    {section.content}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Changes to Terms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              className="mt-8 bg-dark-900/50 rounded-2xl p-8 border border-dark-800 backdrop-blur-sm"
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
                Changes to These Terms
              </h2>
              <p className="text-dark-300 leading-relaxed">
                We may update these terms from time to time. We will notify you of any changes by posting the new 
                Terms of Service on this page and updating the "last updated" date. Your continued use of the service 
                after any changes constitutes acceptance of the new terms.
              </p>
            </motion.div>

            {/* Contact CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 }}
              className="mt-12 text-center"
            >
              <p className="text-dark-400 mb-4">
                Have questions about these Terms?
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

export default Terms
