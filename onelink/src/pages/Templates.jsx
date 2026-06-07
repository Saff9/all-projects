import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Crown, Eye } from 'lucide-react'
import { TEMPLATE_CATEGORIES } from '../utils/constants'

// Mock templates data
const templates = [
  {
    id: '1',
    name: 'Minimal',
    description: 'Clean and simple design for a professional look',
    category: 'minimal',
    thumbnailURL: 'https://images.unsplash.com/photo-1618005182384-d83ba5c1e2b5?w=400&h=600&fit=crop',
    isPremium: false,
  },
  {
    id: '2',
    name: 'Gradient Flow',
    description: 'Beautiful gradient backgrounds with smooth animations',
    category: 'creative',
    thumbnailURL: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=600&fit=crop',
    isPremium: false,
  },
  {
    id: '3',
    name: 'Dark Mode',
    description: 'Sleek dark theme perfect for tech enthusiasts',
    category: 'professional',
    thumbnailURL: 'https://images.unsplash.com/photo-1555066931-4365d14bab20?w=400&h=600&fit=crop',
    isPremium: false,
  },
  {
    id: '4',
    name: 'Neon Glow',
    description: 'Eye-catching neon effects for creative professionals',
    category: 'bold',
    thumbnailURL: 'https://images.unsplash.com/photo-1579546929566-2882a8e36a6b?w=400&h=600&fit=crop',
    isPremium: true,
  },
  {
    id: '5',
    name: 'Elegant',
    description: 'Sophisticated design with elegant typography',
    category: 'elegant',
    thumbnailURL: 'https://images.unsplash.com/photo-1618172193763-c5fbdeb5a63e?w=400&h=600&fit=crop',
    isPremium: true,
  },
  {
    id: '6',
    name: 'Card Stack',
    description: 'Modern card-based layout with hover effects',
    category: 'creative',
    thumbnailURL: 'https://images.unsplash.com/photo-1558591710-4780aadea3f6?w=400&h=600&fit=crop',
    isPremium: false,
  },
]

function Templates() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [hoveredTemplate, setHoveredTemplate] = useState(null)

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'creative', label: 'Creative' },
    { value: 'professional', label: 'Professional' },
    { value: 'bold', label: 'Bold' },
    { value: 'elegant', label: 'Elegant' },
  ]

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter((t) => t.category === selectedCategory)

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-white">Templates</h1>
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-slate-400">Upgrade for premium templates</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
                className="relative group"
              >
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  {/* Template Preview */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={template.thumbnailURL}
                      alt={template.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* Overlay */}
                    <div
                      className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${
                        hoveredTemplate === template.id ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <div className="flex space-x-3">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg text-slate-900 hover:bg-slate-100 transition-colors">
                          <Eye className="w-4 h-4" />
                          <span>Preview</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors">
                          <Check className="w-4 h-4" />
                          <span>Use Template</span>
                        </button>
                      </div>
                    </div>

                    {/* Premium Badge */}
                    {template.isPremium && (
                      <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                        <Crown className="w-3 h-3" />
                        <span>Pro</span>
                      </div>
                    )}
                  </div>

                  {/* Template Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white">{template.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{template.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-slate-500 capitalize">{template.category}</span>
                      <span className="text-xs text-slate-500">
                        {template.isPremium ? 'Premium' : 'Free'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400">No templates found in this category</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}

export default Templates