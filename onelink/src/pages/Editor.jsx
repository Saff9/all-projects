import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, 
  Eye, 
  Plus, 
  GripVertical, 
  Trash2, 
  Edit2,
  Link as LinkIcon,
  Palette,
  Type,
  Image,
  Monitor,
  Smartphone,
  Tablet,
  Settings,
  Folder,
  Clock,
  Image as ImageIcon,
  MoreVertical,
  ToggleLeft,
  ToggleRight,
  X,
  ChevronDown,
  Search,
  ExternalLink,
  Share2,
  QrCode,
  RefreshCw,
  Maximize2,
  Loader2,
  AlertCircle,
  Sparkles,
  Layers,
  List,
  Grid
} from 'lucide-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import toast from 'react-hot-toast'

// Import new editor components
import { 
  LivePreview, 
  LivePreviewCompact,
  IconSelector,
  LinkScheduler,
  LinkGroups,
  GroupSelector,
  ThumbnailUploader,
  ThumbnailUploaderCompact,
  LinkReorderList
} from '../components/profile'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useLinks } from '../hooks/useLinks'

// Device presets for preview
const DEVICES = {
  desktop: { name: 'Desktop', icon: Monitor, width: '100%', height: '600px' },
  tablet: { name: 'Tablet', icon: Tablet, width: '768px', height: '1024px' },
  mobile: { name: 'Mobile', icon: Smartphone, width: '375px', height: '812px' }
}

// Sortable Link Item Component with enhanced features
function SortableLinkItem({ 
  link, 
  onEdit, 
  onDelete, 
  onToggle,
  showThumbnail = true,
  showIcon = true,
  showDrag = true 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-blue-500 transition-all ${isDragging ? 'shadow-lg' : ''}`}
    >
      {showDrag && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-300"
        >
          <GripVertical className="w-5 h-5" />
        </button>
      )}
      
      {/* Thumbnail */}
      {showThumbnail && link.thumbnail?.url && (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
          <img src={link.thumbnail.url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      
      {/* Icon */}
      {showIcon && !link.thumbnail?.url && (
        <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
          {link.icon ? (
            <span className="text-lg">{link.icon}</span>
          ) : (
            <LinkIcon className="w-5 h-5 text-slate-400" />
          )}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-white truncate">{link.title}</p>
          {link.groupId && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400">
              Grouped
            </span>
          )}
        </div>
        <p className="text-sm text-slate-400 truncate">{link.url}</p>
      </div>
      
      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        {link.scheduling?.isEnabled && (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            Scheduled
          </span>
        )}
        
        <button
          onClick={() => onToggle?.(link)}
          className={`p-1 rounded ${link.isActive ? 'text-green-500' : 'text-slate-600'}`}
          title={link.isActive ? 'Active' : 'Inactive'}
        >
          {link.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
        </button>
        
        <button
          onClick={() => onEdit(link)}
          className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(link.id)}
          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Link Editor Modal
function LinkEditorModal({ 
  isOpen, 
  onClose, 
  link, 
  onSave,
  userId 
}) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    icon: null,
    thumbnail: null,
    isActive: true,
    scheduling: null,
    groupId: null,
    clickTracking: true
  })

  useEffect(() => {
    if (link) {
      setFormData({
        title: link.title || '',
        url: link.url || '',
        description: link.description || '',
        icon: link.icon || null,
        thumbnail: link.thumbnail || null,
        isActive: link.isActive !== false,
        scheduling: link.scheduling || null,
        groupId: link.groupId || null,
        clickTracking: link.clickTracking !== false
      })
    }
  }, [link])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title || !formData.url) {
      toast.error('Title and URL are required')
      return
    }
    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-slate-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto border border-slate-700"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">
              {link?.id ? 'Edit Link' : 'Add New Link'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="Link title"
                required
              />
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="input-field"
                placeholder="https://example.com"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field h-20 resize-none"
                placeholder="Optional description"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Icon
              </label>
              <IconSelector
                value={formData.icon}
                onChange={(icon) => setFormData({ ...formData, icon })}
              />
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Thumbnail Image
              </label>
              <ThumbnailUploader
                value={formData.thumbnail}
                onChange={(thumbnail) => setFormData({ ...formData, thumbnail })}
                userId={userId}
                linkId={link?.id}
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">
                Active
              </span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  formData.isActive ? 'bg-blue-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    formData.isActive ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            {/* Click Tracking Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">
                Click Tracking
              </span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, clickTracking: !formData.clickTracking })}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  formData.clickTracking ? 'bg-blue-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    formData.clickTracking ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            {/* Scheduling */}
            <LinkScheduler
              schedule={formData.scheduling}
              onChange={(scheduling) => setFormData({ ...formData, scheduling })}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {link?.id ? 'Save Changes' : 'Add Link'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Main Editor Component
function Editor() {
  const { user } = useAuth()
  const { profile, updateProfile, loading: profileLoading } = useProfile()
  const { links, loading: linksLoading, addLink, updateLink, deleteLink, reorderLinks } = useLinks()
  
  const [activeTab, setActiveTab] = useState('links')
  const [previewDevice, setPreviewDevice] = useState('mobile')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [editingLink, setEditingLink] = useState(null)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkGroups, setLinkGroups] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [isSaving, setIsSaving] = useState(false)
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    bio: '',
    avatarURL: null,
    username: '',
  })
  
  const [themeForm, setThemeForm] = useState({
    primaryColor: '#3b82f6',
    secondaryColor: '#6366f1',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    buttonStyle: 'rounded',
    fontFamily: 'Inter',
    animationType: 'none',
  })

  const [seoForm, setSeoForm] = useState({
    title: '',
    description: '',
    ogImageURL: '',
  })

  // Initialize form data from profile
  useEffect(() => {
    if (profile) {
      setProfileForm({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        avatarURL: profile.avatarURL || null,
        username: profile.username || '',
      })
      
      if (profile.themeSettings) {
        setThemeForm({
          primaryColor: profile.themeSettings.primaryColor || '#3b82f6',
          secondaryColor: profile.themeSettings.secondaryColor || '#6366f1',
          backgroundColor: profile.themeSettings.backgroundColor || '#ffffff',
          textColor: profile.themeSettings.textColor || '#1f2937',
          buttonStyle: profile.themeSettings.buttonStyle || 'rounded',
          fontFamily: profile.themeSettings.fontFamily || 'Inter',
          animationType: profile.themeSettings.animationType || 'none',
        })
      }
      
      if (profile.seoSettings) {
        setSeoForm({
          title: profile.seoSettings.title || '',
          description: profile.seoSettings.description || '',
          ogImageURL: profile.seoSettings.ogImageURL || '',
        })
      }
    }
  }, [profile])

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = links.findIndex((item) => item.id === active.id)
      const newIndex = links.findIndex((item) => item.id === over?.id)
      const newLinks = arrayMove(links, oldIndex, newIndex)
      reorderLinks(newLinks)
    }
  }

  // Handle add link
  const handleAddLink = () => {
    setEditingLink(null)
    setIsLinkModalOpen(true)
  }

  // Handle edit link
  const handleEditLink = (link) => {
    setEditingLink(link)
    setIsLinkModalOpen(true)
  }

  // Handle save link
  const handleSaveLink = async (linkData) => {
    try {
      if (editingLink) {
        await updateLink(editingLink.id, linkData)
        toast.success('Link updated')
      } else {
        await addLink(linkData)
        toast.success('Link added')
      }
    } catch (error) {
      console.error('Error saving link:', error)
      toast.error('Failed to save link')
    }
  }

  // Handle delete link
  const handleDeleteLink = async (linkId) => {
    try {
      await deleteLink(linkId)
      toast.success('Link deleted')
    } catch (error) {
      console.error('Error deleting link:', error)
      toast.error('Failed to delete link')
    }
  }

  // Handle toggle link
  const handleToggleLink = async (link) => {
    try {
      await updateLink(link.id, { isActive: !link.isActive })
      toast.success(link.isActive ? 'Link disabled' : 'Link enabled')
    } catch (error) {
      console.error('Error toggling link:', error)
      toast.error('Failed to update link')
    }
  }

  // Handle save profile
  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      await updateProfile(profileForm)
      toast.success('Profile saved')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle save theme
  const handleSaveTheme = async () => {
    setIsSaving(true)
    try {
      await updateProfile({ themeSettings: themeForm })
      toast.success('Theme saved')
    } catch (error) {
      console.error('Error saving theme:', error)
      toast.error('Failed to save theme')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle save SEO
  const handleSaveSeo = async () => {
    setIsSaving(true)
    try {
      await updateProfile({ seoSettings: seoForm })
      toast.success('SEO settings saved')
    } catch (error) {
      console.error('Error saving SEO:', error)
      toast.error('Failed to save SEO settings')
    } finally {
      setIsSaving(false)
    }
  }

  // Filter links by search and group
  const filteredLinks = links?.filter(link => {
    const matchesSearch = !searchQuery || 
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesGroup = selectedGroup === 'all' || 
      (selectedGroup === 'ungrouped' && !link.groupId) ||
      link.groupId === selectedGroup
    
    return matchesSearch && matchesGroup
  }) || []

  // Tabs configuration
  const tabs = [
    { id: 'links', label: 'Links', icon: LinkIcon },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'profile', label: 'Profile', icon: Type },
    { id: 'groups', label: 'Groups', icon: Layers },
    { id: 'seo', label: 'SEO', icon: Image },
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white">Profile Editor</h1>
              {profile?.username && (
                <a
                  href={`/${profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  onelink.app/{profile.username}
                </a>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Preview Toggle */}
              <button
                onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isPreviewOpen 
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-700'
                }`}
              >
                <Eye className="w-5 h-5" />
                <span className="hidden sm:inline">Preview</span>
              </button>
              
              {/* Save Button */}
              <button
                onClick={() => {
                  if (activeTab === 'profile') handleSaveProfile()
                  else if (activeTab === 'appearance') handleSaveTheme()
                  else if (activeTab === 'seo') handleSaveSeo()
                  else toast.success('Changes auto-saved')
                }}
                disabled={isSaving}
                className="btn-primary flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid gap-8 ${isPreviewOpen ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
          {/* Editor Panel */}
          <div className={isPreviewOpen ? 'lg:col-span-1' : 'lg:col-span-2'}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Tabs */}
              <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 mb-6">
                <div className="flex overflow-x-auto border-b border-slate-700">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? 'text-blue-400 border-b-2 border-blue-500'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      {tab.id === 'links' && links?.length > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-slate-700 rounded-full">
                          {links.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {/* Links Tab */}
                  {activeTab === 'links' && (
                    <div>
                      {/* Search and Add */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="relative flex-1 max-w-md">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search links..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          onClick={handleAddLink}
                          className="btn-primary flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Link
                        </button>
                      </div>

                      {/* Links List */}
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={filteredLinks.map((l) => l.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-3">
                            {filteredLinks.map((link) => (
                              <SortableLinkItem
                                key={link.id}
                                link={link}
                                onEdit={handleEditLink}
                                onDelete={handleDeleteLink}
                                onToggle={handleToggleLink}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>

                      {filteredLinks.length === 0 && (
                        <div className="text-center py-12">
                          <LinkIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                          <p className="text-slate-400 mb-4">
                            {searchQuery ? 'No links match your search' : 'No links yet'}
                          </p>
                          {!searchQuery && (
                            <button onClick={handleAddLink} className="btn-primary">
                              Add your first link
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Appearance Tab */}
                  {activeTab === 'appearance' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Primary Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={themeForm.primaryColor}
                            onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                            className="w-12 h-12 rounded-lg border border-slate-600 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={themeForm.primaryColor}
                            onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                            className="input-field w-32"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Secondary Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={themeForm.secondaryColor}
                            onChange={(e) => setThemeForm({ ...themeForm, secondaryColor: e.target.value })}
                            className="w-12 h-12 rounded-lg border border-slate-600 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={themeForm.secondaryColor}
                            onChange={(e) => setThemeForm({ ...themeForm, secondaryColor: e.target.value })}
                            className="input-field w-32"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Background Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={themeForm.backgroundColor}
                            onChange={(e) => setThemeForm({ ...themeForm, backgroundColor: e.target.value })}
                            className="w-12 h-12 rounded-lg border border-slate-600 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={themeForm.backgroundColor}
                            onChange={(e) => setThemeForm({ ...themeForm, backgroundColor: e.target.value })}
                            className="input-field w-32"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Text Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={themeForm.textColor}
                            onChange={(e) => setThemeForm({ ...themeForm, textColor: e.target.value })}
                            className="w-12 h-12 rounded-lg border border-slate-600 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={themeForm.textColor}
                            onChange={(e) => setThemeForm({ ...themeForm, textColor: e.target.value })}
                            className="input-field w-32"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Button Style
                        </label>
                        <div className="flex gap-3">
                          {['rounded', 'square', 'pill'].map((style) => (
                            <button
                              key={style}
                              onClick={() => setThemeForm({ ...themeForm, buttonStyle: style })}
                              className={`px-4 py-2 border ${
                                themeForm.buttonStyle === style
                                  ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                                  : 'border-slate-600 text-slate-300'
                              } rounded-lg capitalize transition-colors`}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Animation Type
                        </label>
                        <select
                          value={themeForm.animationType}
                          onChange={(e) => setThemeForm({ ...themeForm, animationType: e.target.value })}
                          className="input-field"
                        >
                          <option value="none">None</option>
                          <option value="particles">Particles</option>
                          <option value="gradient">Gradient</option>
                          <option value="waves">Waves</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.displayName}
                          onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                          className="input-field"
                          placeholder="Your name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Username
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">onelink.app/</span>
                          <input
                            type="text"
                            value={profileForm.username}
                            onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                            className="input-field flex-1"
                            placeholder="username"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Bio
                        </label>
                        <textarea
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                          className="input-field h-24 resize-none"
                          placeholder="Tell your visitors about yourself"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Profile Image
                        </label>
                        <ThumbnailUploader
                          value={profileForm.avatarURL}
                          onChange={(avatarURL) => setProfileForm({ ...profileForm, avatarURL })}
                          userId={user?.uid}
                          aspectRatio="square"
                        />
                      </div>
                    </div>
                  )}

                  {/* Groups Tab */}
                  {activeTab === 'groups' && (
                    <div>
                      <LinkGroups
                        groups={linkGroups}
                        links={links}
                        onChange={setLinkGroups}
                        onLinksUpdate={(updatedLinks) => {
                          // Handle links update from groups
                          console.log('Updated links:', updatedLinks)
                        }}
                      />
                    </div>
                  )}

                  {/* SEO Tab */}
                  {activeTab === 'seo' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Page Title
                        </label>
                        <input
                          type="text"
                          value={seoForm.title}
                          onChange={(e) => setSeoForm({ ...seoForm, title: e.target.value })}
                          className="input-field"
                          placeholder="Your Name - Links"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Meta Description
                        </label>
                        <textarea
                          value={seoForm.description}
                          onChange={(e) => setSeoForm({ ...seoForm, description: e.target.value })}
                          className="input-field h-24 resize-none"
                          placeholder="A brief description of your page for search engines"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Social Preview Image
                        </label>
                        <ThumbnailUploader
                          value={seoForm.ogImageURL}
                          onChange={(ogImageURL) => setSeoForm({ ...seoForm, ogImageURL })}
                          userId={user?.uid}
                          aspectRatio="landscape"
                        />
                        <p className="text-sm text-slate-400 mt-2">
                          Recommended size: 1200x630 pixels
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Preview Panel */}
          <AnimatePresence>
            {isPreviewOpen && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="lg:col-span-1"
              >
                <div className="sticky top-24">
                  <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 overflow-hidden">
                    {/* Preview Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-700">
                      <h3 className="text-sm font-medium text-slate-300">Live Preview</h3>
                      <div className="flex items-center gap-2">
                        {Object.entries(DEVICES).map(([key, device]) => {
                          const Icon = device.icon
                          return (
                            <button
                              key={key}
                              onClick={() => setPreviewDevice(key)}
                              className={`p-2 rounded-lg transition-colors ${
                                previewDevice === key
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'text-slate-400 hover:text-slate-300'
                              }`}
                              title={device.name}
                            >
                              <Icon className="w-4 h-4" />
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Preview Content */}
                    <div className="p-4 bg-slate-700">
                      <LivePreview
                        profile={profileForm}
                        links={links}
                        theme={themeForm}
                        defaultDevice={previewDevice}
                        showControls={false}
                      />
                    </div>

                    {/* Preview Footer */}
                    <div className="p-3 border-t border-slate-700 bg-slate-800">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">
                          {links?.filter(l => l.isActive !== false).length || 0} active links
                        </span>
                        <div className="flex items-center gap-3">
                          <a
                            href={`/${profile?.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Live
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Link Editor Modal */}
      <LinkEditorModal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false)
          setEditingLink(null)
        }}
        link={editingLink}
        onSave={handleSaveLink}
        userId={user?.uid}
      />
    </div>
  )
}

export default Editor
