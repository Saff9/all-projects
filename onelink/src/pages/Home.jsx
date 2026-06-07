import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Sparkles, 
  Link2, 
  BarChart3, 
  QrCode, 
  Palette, 
  Zap, 
  Users,
  CheckCircle,
  Star,
  Quote,
  Layers,
  Shield,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  Code,
  Paintbrush,
  Layout
} from 'lucide-react'
import { templateConfigs, TemplateRenderer } from '../components/templates'

const features = [
  {
    icon: Link2,
    title: 'One Link for Everything',
    description: 'Combine all your social links, websites, and content into a single, powerful URL that you can share anywhere.',
    color: 'blue'
  },
  {
    icon: Palette,
    title: 'Stunning Themes',
    description: 'Choose from professionally designed themes or customize every detail to match your unique brand identity.',
    color: 'cyan'
  },
  {
    icon: BarChart3,
    title: 'Powerful Analytics',
    description: 'Track clicks, views, geographic data, and device stats to understand your audience and grow your following.',
    color: 'blue'
  },
  {
    icon: QrCode,
    title: 'QR Code Generator',
    description: 'Generate beautiful QR codes for your profile to share in print materials, business cards, and events.',
    color: 'cyan'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized for speed with instant page loads ensures your audience never has to wait.',
    color: 'blue'
  },
  {
    icon: Users,
    title: 'Social Proof',
    description: 'Build trust with followers by showcasing follower counts, subscriber numbers, and social proof.',
    color: 'cyan'
  }
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Content Creator',
    avatar: 'SC',
    content: 'OneLink transformed how I share my content. My engagement has increased by 300% since switching. The analytics are incredibly insightful!',
    rating: 5
  },
  {
    name: 'Marcus Johnson',
    role: 'Digital Marketer',
    avatar: 'MJ',
    content: 'The customization options are endless. I was able to create exactly the landing page I envisioned. Highly recommend for professionals.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'Small Business Owner',
    avatar: 'ER',
    content: 'Our QR codes from OneLink have been a game-changer for our physical marketing. Super easy to set up and track.',
    rating: 5
  }
]

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '1M+', label: 'Links Created' },
  { value: '10M+', label: 'Monthly Clicks' },
  { value: '99.9%', label: 'Uptime' }
]

// Template playground data
const playgroundTemplates = [
  { id: 'minimal', name: 'Minimal', icon: Layout },
  { id: 'gradient', name: 'Gradient', icon: Paintbrush },
  { id: 'dark', name: 'Dark', icon: Monitor },
  { id: 'neon', name: 'Neon', icon: Sparkles },
  { id: 'professional', name: 'Professional', icon: Code },
]

const sampleProfile = {
  username: 'sarah_creator',
  displayName: 'Sarah Creator',
  bio: 'Content Creator & Digital Influencer',
  avatar: null,
  theme: 'minimal',
  background: '#1a1a2e',
  textColor: '#ffffff',
  buttonStyle: 'rounded',
  buttonColor: '#6366f1',
  buttonTextColor: '#ffffff',
  font: 'Inter',
  links: [
    { id: '1', title: 'YouTube Channel', url: '#', icon: 'play' },
    { id: '2', title: 'Instagram', url: '#', icon: 'instagram' },
    { id: '3', title: 'Twitter', url: '#', icon: 'twitter' },
    { id: '4', title: 'My Website', url: '#', icon: 'globe' },
  ],
  socialLinks: {
    instagram: 'sarah_creator',
    twitter: 'sarah_creator',
    youtube: 'sarahcreator',
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState('minimal')
  const [previewDevice, setPreviewDevice] = useState('desktop')
  return (
    <div className="min-h-screen bg-dark-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary blue glow */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[120px] animate-pulse-glow" />
        {/* Secondary cyan glow */}
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        {/* Accent glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-700/10 rounded-full blur-[150px]" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%] w-4 h-4 bg-primary-500/30 rounded-full blur-sm"
        />
        <motion.div
          animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-40 right-[15%] w-6 h-6 bg-cyan-500/20 rounded-full blur-sm"
        />
        <motion.div
          animate={{ y: [0, -25, 0], x: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-40 left-[20%] w-3 h-3 bg-primary-400/40 rounded-full blur-sm"
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-20 right-[25%] w-5 h-5 bg-cyan-400/25 rounded-full blur-sm"
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/50 blur-lg rounded-lg" />
                <img 
                  src="/favicon.svg" 
                  alt="OneLink" 
                  className="w-8 h-8 relative"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-400 via-primary-500 to-cyan-400 bg-clip-text text-transparent">
                OneLink
              </span>
            </div>
            <nav className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-dark-300 hover:text-white font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="relative group bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-cyan-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity blur-lg" />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center px-5 py-2.5 bg-dark-900/80 border border-primary-500/30 text-primary-400 rounded-full text-sm font-medium mb-8 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 mr-2 text-cyan-400" />
              Trusted by 50,000+ creators worldwide
            </motion.div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              One Link to
              <span className="block mt-2">
                <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  Connect Everything
                </span>
              </span>
            </h1>
            
            <p className="text-xl text-dark-300 max-w-2xl mx-auto mb-12 leading-relaxed">
              Create a beautiful, customizable page that houses all your important links. 
              Share it everywhere and track your audience with powerful analytics.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link 
                  to="/register" 
                  className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-cyan-500 hover:from-primary-500 hover:to-cyan-400 text-white rounded-xl font-semibold text-lg transition-all shadow-xl shadow-primary-500/25 hover:shadow-cyan-500/30 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center">
                    Start Free Forever
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </motion.div>
              <a 
                href="#features" 
                className="inline-flex items-center px-8 py-4 bg-dark-900/80 hover:bg-dark-800 text-dark-300 hover:text-white rounded-xl font-semibold text-lg border border-dark-700 hover:border-primary-500/50 transition-all backdrop-blur-sm"
              >
                See Features
              </a>
            </div>

            {/* Hero Image Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-cyan-500 to-primary-500 rounded-2xl blur-2xl opacity-40 animate-pulse-glow" />
              <div className="relative bg-dark-900 rounded-2xl shadow-2xl border border-dark-800 overflow-hidden">
                <div className="bg-dark-950 border-b border-dark-800 px-4 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="p-8 bg-gradient-to-br from-dark-900 to-dark-950">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full blur-xl opacity-50" />
                      <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-primary-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                        <span className="text-3xl text-white font-bold">S</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">@sarah_creator</h3>
                    <p className="text-dark-400 mb-6">Content Creator & Digital Influencer</p>
                    <div className="space-y-3 w-full max-w-xs">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="h-14 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl shadow-lg flex items-center justify-center text-white font-medium"
                      >
                        YouTube Channel
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="h-14 bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-xl shadow-lg flex items-center justify-center text-white font-medium"
                      >
                        Instagram
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="h-14 bg-gradient-to-r from-primary-700 to-cyan-600 rounded-xl shadow-lg flex items-center justify-center text-white font-medium"
                      >
                        Twitter
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="h-14 bg-dark-800 border border-dark-700 rounded-xl flex items-center justify-center text-white font-medium"
                      >
                        My Website
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center p-6 rounded-2xl bg-dark-900/50 border border-dark-800 backdrop-blur-sm"
              >
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-dark-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Section */}
          <motion.div 
            id="features"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-32"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-xl text-dark-400 max-w-2xl mx-auto">
                Powerful features designed to help you grow your audience and track your success.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                const isBlue = feature.color === 'blue'
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5 }}
                    className="group bg-dark-900/80 rounded-2xl p-8 border border-dark-800 hover:border-primary-500/30 transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 ${
                      isBlue 
                        ? 'bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/20' 
                        : 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20'
                    }`}>
                      <Icon className={`w-7 h-7 ${isBlue ? 'text-primary-400' : 'text-cyan-400'}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-dark-400 leading-relaxed">{feature.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Playground Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-32"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Try Our Templates
              </h2>
              <p className="text-xl text-dark-400 max-w-2xl mx-auto">
                Preview all 5 stunning templates and find the perfect one for your brand.
              </p>
            </div>

            {/* Template Selector */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {playgroundTemplates.map((template) => {
                const Icon = template.icon
                const isSelected = selectedTemplate === template.id
                return (
                  <motion.button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-primary-500 to-cyan-500 text-white shadow-lg shadow-primary-500/25'
                        : 'bg-dark-900 text-dark-400 hover:bg-dark-800 hover:text-white border border-dark-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {template.name}
                  </motion.button>
                )
              })}
            </div>

            {/* Device Selector */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-3 rounded-lg transition-all ${
                  previewDevice === 'desktop'
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-dark-900 text-dark-400 hover:text-white border border-dark-700'
                }`}
                title="Desktop"
              >
                <Monitor className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`p-3 rounded-lg transition-all ${
                  previewDevice === 'tablet'
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-dark-900 text-dark-400 hover:text-white border border-dark-700'
                }`}
                title="Tablet"
              >
                <Tablet className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-3 rounded-lg transition-all ${
                  previewDevice === 'mobile'
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-dark-900 text-dark-400 hover:text-white border border-dark-700'
                }`}
                title="Mobile"
              >
                <Smartphone className="w-5 h-5" />
              </button>
            </div>

            {/* Template Preview */}
            <motion.div
              key={selectedTemplate}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex justify-center"
            >
              <div className={`relative ${
                previewDevice === 'mobile' ? 'w-[280px]' : 
                previewDevice === 'tablet' ? 'w-[500px]' : 'w-[800px]'
              }`}>
                {/* Device Frame */}
                <div className={`relative mx-auto bg-dark-900 rounded-2xl border border-dark-700 overflow-hidden ${
                  previewDevice === 'mobile' ? 'w-[280px] h-[580px] p-3' : 
                  previewDevice === 'tablet' ? 'w-[500px] h-[400px] p-4' : 'w-[800px] h-[500px] p-6'
                }`}>
                  {/* Phone notch for mobile */}
                  {previewDevice === 'mobile' && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-dark-800 rounded-b-2xl z-10" />
                  )}
                  
                  {/* Template Preview Content */}
                  <div className={`${previewDevice === 'mobile' ? 'h-full' : 'h-full'} overflow-hidden rounded-xl`}>
                    <TemplateRenderer
                      template={selectedTemplate}
                      profile={sampleProfile}
                    />
                  </div>
                </div>

                {/* Device Reflection Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 to-cyan-500/10 rounded-2xl pointer-events-none" />
              </div>
            </motion.div>

            {/* View All Templates CTA */}
            <div className="text-center mt-12">
              <Link
                to="/templates"
                className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                View All Templates
                <Eye className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Testimonials Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-32"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Loved by Creators Everywhere
              </h2>
              <p className="text-xl text-dark-400 max-w-2xl mx-auto">
                Join thousands of creators who trust OneLink to manage their online presence.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  className="bg-dark-900/80 rounded-2xl p-8 border border-dark-800 relative backdrop-blur-sm"
                >
                  <Quote className="absolute top-6 right-6 w-8 h-8 text-primary-500/20" />
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-dark-300 mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full blur-sm" />
                      <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                        {testimonial.avatar}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-dark-400">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Why Choose Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-32"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Why Choose OneLink?
              </h2>
              <p className="text-xl text-dark-400 max-w-2xl mx-auto">
                Built for creators who demand the best
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Layers,
                  title: 'Easy Integration',
                  description: 'Connect all your platforms in minutes with our intuitive setup process.',
                  color: 'primary'
                },
                {
                  icon: Shield,
                  title: 'Secure & Private',
                  description: 'Your data is protected with enterprise-grade security and encryption.',
                  color: 'cyan'
                },
                {
                  icon: Globe,
                  title: 'Global CDN',
                  description: 'Lightning-fast loading speeds worldwide with our global content network.',
                  color: 'primary'
                }
              ].map((item, index) => {
                const Icon = item.icon
                const isPrimary = item.color === 'primary'
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15, duration: 0.5 }}
                    className="text-center p-8 rounded-2xl bg-gradient-to-b from-dark-900/80 to-dark-950/80 border border-dark-800 backdrop-blur-sm"
                  >
                    <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${
                      isPrimary
                        ? 'bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/20'
                        : 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20'
                    }`}>
                      <Icon className={`w-8 h-8 ${isPrimary ? 'text-primary-400' : 'text-cyan-400'}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                    <p className="text-dark-400">{item.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-32 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-500 to-cyan-500 rounded-3xl blur-2xl opacity-30" />
            <div className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-cyan-500 rounded-3xl px-8 py-16 text-center overflow-hidden">
              <div className="absolute inset-0 bg-white/5" />
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-white/80 mb-8 max-w-xl mx-auto">
                  Join thousands of creators who have already upgraded their online presence with OneLink.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link 
                      to="/register" 
                      className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
                    >
                      Create Free Account
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </motion.div>
                  <div className="flex items-center gap-2 text-white/80">
                    <CheckCircle className="w-5 h-5" />
                    <span>No credit card required</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-12 px-4 bg-dark-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/30 blur-sm rounded-lg" />
                <img 
                  src="/favicon.svg" 
                  alt="OneLink" 
                  className="w-6 h-6 relative"
                />
              </div>
              <span className="text-lg font-semibold text-white">OneLink</span>
            </div>
            <div className="text-dark-400 text-sm">
              © {new Date().getFullYear()} OneLink. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-dark-400 hover:text-primary-400 transition-colors text-sm">Privacy</Link>
              <Link to="/terms" className="text-dark-400 hover:text-primary-400 transition-colors text-sm">Terms</Link>
              <Link to="/contact" className="text-dark-400 hover:text-primary-400 transition-colors text-sm">Contact</Link>
              <Link to="/about" className="text-dark-400 hover:text-primary-400 transition-colors text-sm">About</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
