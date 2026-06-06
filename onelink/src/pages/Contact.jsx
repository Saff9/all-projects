import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, ArrowLeft, MessageSquare, Clock, HeadphonesIcon } from 'lucide-react'

function Contact() {
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Send us an email anytime',
      value: 'hello@onelink.app',
      href: 'mailto:hello@onelink.app'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Mon-Fri from 9am to 5pm',
      value: '+1 (555) 123-4567',
      href: 'tel:+15551234567'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Come say hello at our office',
      value: 'San Francisco, CA',
      href: '#'
    }
  ]

  const supportOptions = [
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Get instant help from our team',
      available: true
    },
    {
      icon: Clock,
      title: 'Response Time',
      description: 'We usually reply within 24 hours',
      available: true
    },
    {
      icon: HeadphonesIcon,
      title: 'Support Hours',
      description: 'Monday - Friday, 9AM - 6PM PST',
      available: true
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
        <div className="max-w-6xl mx-auto">
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
                <Mail className="w-8 h-8 text-primary-400" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Get in <span className="bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">Touch</span>
              </h1>
              <p className="text-xl text-dark-400 max-w-2xl mx-auto">
                Have a question or need help? We'd love to hear from you. Our team is here to assist you.
              </p>
            </div>

            {/* Contact Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {contactInfo.map((info, index) => {
                const Icon = info.icon
                return (
                  <motion.a
                    key={index}
                    href={info.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index + 0.2 }}
                    whileHover={{ y: -5 }}
                    className="bg-dark-900/50 rounded-2xl p-6 border border-dark-800 backdrop-blur-sm group hover:border-primary-500/30 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-cyan-500/20 border border-primary-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{info.title}</h3>
                    <p className="text-dark-500 text-sm mb-2">{info.description}</p>
                    <p className="text-primary-400 group-hover:text-primary-300 transition-colors">{info.value}</p>
                  </motion.a>
                )
              })}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-dark-900/50 rounded-2xl p-8 border border-dark-800 backdrop-blur-sm"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
                <form className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">First Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-dark-950 border border-dark-800 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Last Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-dark-950 border border-dark-800 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-dark-950 border border-dark-800 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Subject</label>
                    <select className="w-full px-4 py-3 bg-dark-950 border border-dark-800 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors">
                      <option value="">Select a topic</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="partnership">Partnership</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Message</label>
                    <textarea
                      rows={5}
                      className="w-full px-4 py-3 bg-dark-950 border border-dark-800 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-primary-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </motion.button>
                </form>
              </motion.div>

              {/* Support Info */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-dark-900/50 rounded-2xl p-8 border border-dark-800 backdrop-blur-sm"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Support Options</h2>
                  <div className="space-y-4">
                    {supportOptions.map((option, index) => {
                      const Icon = option.icon
                      return (
                        <div key={index} className="flex items-center gap-4 p-4 bg-dark-950/50 rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-medium">{option.title}</h3>
                            <p className="text-dark-500 text-sm">{option.description}</p>
                          </div>
                          {option.available && (
                            <span className="px-2 py-1 text-xs font-medium text-green-400 bg-green-400/10 rounded-full">
                              Available
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </motion.div>

                {/* FAQ Link */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gradient-to-r from-primary-600/20 to-cyan-500/20 rounded-2xl p-8 border border-primary-500/30"
                >
                  <h2 className="text-2xl font-bold text-white mb-4">Need Quick Help?</h2>
                  <p className="text-dark-400 mb-6">
                    Check out our frequently asked questions for instant answers to common questions.
                  </p>
                  <Link
                    to="/faq"
                    className="inline-flex items-center text-primary-400 hover:text-primary-300 font-medium transition-colors"
                  >
                    View FAQ
                    <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                  </Link>
                </motion.div>
              </div>
            </div>
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
            <Link to="/about" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Contact
