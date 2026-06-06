import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Target, Heart, Award, ArrowLeft, Zap, Shield, Globe, Sparkles } from 'lucide-react'

function About() {
  const stats = [
    { value: '50K+', label: 'Active Users' },
    { value: '1M+', label: 'Links Created' },
    { value: '10M+', label: 'Monthly Clicks' },
    { value: '99.9%', label: 'Uptime' }
  ]

  const values = [
    {
      icon: Heart,
      title: 'User First',
      description: 'We prioritize our users\' needs and constantly work to improve their experience.'
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'We continuously innovate to provide cutting-edge features and stay ahead of trends.'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'We build trust through transparency, security, and reliable service delivery.'
    },
    {
      icon: Globe,
      title: 'Global Community',
      description: 'We serve creators from around the world, fostering a global community of innovators.'
    }
  ]

  const team = [
    {
      name: 'Alex Thompson',
      role: 'Founder & CEO',
      avatar: 'AT',
      bio: 'Serial entrepreneur with 10+ years in tech'
    },
    {
      name: 'Sarah Chen',
      role: 'Head of Product',
      avatar: 'SC',
      bio: 'Former product lead at major tech companies'
    },
    {
      name: 'Marcus Johnson',
      role: 'Head of Engineering',
      avatar: 'MJ',
      bio: 'Full-stack expert with scalability focus'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Design',
      avatar: 'ER',
      bio: 'Award-winning UX/UI designer'
    }
  ]

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-700/5 rounded-full blur-[150px]" />
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

            {/* Hero Section */}
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-cyan-500/20 border border-primary-500/30 mb-6"
              >
                <Users className="w-10 h-10 text-primary-400" />
              </motion.div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                About <span className="bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">OneLink</span>
              </h1>
              <p className="text-xl text-dark-400 max-w-3xl mx-auto leading-relaxed">
                We're on a mission to help creators, businesses, and influencers connect with their audience 
                through beautiful, powerful link-in-bio pages.
              </p>
            </div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index + 0.4 }}
                  className="text-center p-6 rounded-2xl bg-dark-900/50 border border-dark-800 backdrop-blur-sm"
                >
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-dark-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Story Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-dark-900/50 rounded-2xl p-8 md:p-12 border border-dark-800 backdrop-blur-sm mb-16"
            >
              <h2 className="text-3xl font-bold text-white mb-6 text-center">Our Story</h2>
              <div className="space-y-4 text-dark-300 leading-relaxed max-w-4xl mx-auto">
                <p>
                  OneLink was born out of a simple problem: creators had too many links to share and not enough 
                  places to put them. In 2023, our founding team experienced this challenge firsthand while trying 
                  to manage multiple social media profiles and websites.
                </p>
                <p>
                  We set out to create a solution that would allow anyone to consolidate their online presence into 
                  a single, beautiful URL. What started as a simple link-in-bio tool has grown into a powerful 
                  platform with analytics, customization options, and QR code generation.
                </p>
                <p>
                  Today, we're proud to serve over 50,000 active users who have created more than 1 million links. 
                  Every day, we see amazing creators, businesses, and influencers using OneLink to grow their 
                  audience and connect with their community.
                </p>
              </div>
            </motion.div>

            {/* Values Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {values.map((value, index) => {
                  const Icon = value.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index + 0.6 }}
                      className="bg-dark-900/50 rounded-2xl p-6 border border-dark-800 backdrop-blur-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-cyan-500/20 border border-primary-500/30 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                          <p className="text-dark-400">{value.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Team Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Meet Our Team</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {team.map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index + 0.8 }}
                    className="bg-dark-900/50 rounded-2xl p-6 border border-dark-800 backdrop-blur-sm text-center group hover:border-primary-500/30 transition-colors"
                  >
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-primary-500 to-cyan-500 flex items-center justify-center">
                        <span className="text-2xl text-white font-bold">{member.avatar}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
                    <p className="text-primary-400 text-sm mb-2">{member.role}</p>
                    <p className="text-dark-500 text-sm">{member.bio}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="text-center"
            >
              <div className="bg-gradient-to-r from-primary-600/20 to-cyan-500/20 rounded-2xl p-8 md:p-12 border border-primary-500/30 backdrop-blur-sm">
                <Sparkles className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-4">Join Our Community</h2>
                <p className="text-dark-400 mb-6 max-w-xl mx-auto">
                  Ready to create your own OneLink page? Join thousands of creators who have already 
                  upgraded their online presence.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center px-8 py-4 bg-dark-900 text-dark-300 rounded-xl font-semibold border border-dark-700 hover:border-primary-500/50 hover:text-white transition-all"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
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
          </div>
        </div>
      </footer>
    </div>
  )
}

export default About
