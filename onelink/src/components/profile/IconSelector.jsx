import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Box,
  Calendar,
  Camera,
  CreditCard,
  ShoppingCart,
  MessageCircle,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Cloud,
  Code,
  Command,
  Compass,
  Copy,
  Database,
  Diamond,
  Download,
  Edit,
  Mail,
  Eye,
  File,
  Folder,
  Gift,
  Globe,
  Grid,
  Hammer,
  Hash,
  Heart,
  Home,
  Image,
  Info,
  Key,
  Laptop,
  Link,
  List,
  Lock,
  Map,
  Menu,
  Mic,
  Moon,
  Music,
  Notebook,
  Paperclip,
  Phone,
  Play,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Smile,
  Star,
  Sun,
  Tag,
  Terminal,
  Trash2,
  Twitter,
  User,
  Video,
  Wallet,
  Wrench,
  X,
  Instagram,
  Youtube,
} from 'lucide-react'

// Simplified verified icons - all names exist in lucide-react
const ICONS = [
  { name: 'arrow-up', icon: ArrowUp, label: 'Arrow Up' },
  { name: 'arrow-down', icon: ArrowDown, label: 'Arrow Down' },
  { name: 'arrow-left', icon: ArrowLeft, label: 'Arrow Left' },
  { name: 'arrow-right', icon: ArrowRight, label: 'Arrow Right' },
  { name: 'box', icon: Box, label: 'Box' },
  { name: 'calendar', icon: Calendar, label: 'Calendar' },
  { name: 'camera', icon: Camera, label: 'Camera' },
  { name: 'creditcard', icon: CreditCard, label: 'Credit Card' },
  { name: 'cart', icon: ShoppingCart, label: 'Cart' },
  { name: 'chat', icon: MessageCircle, label: 'Chat' },
  { name: 'check', icon: Check, label: 'Check' },
  { name: 'chevron-up', icon: ChevronUp, label: 'Chevron Up' },
  { name: 'chevron-down', icon: ChevronDown, label: 'Chevron Down' },
  { name: 'chevron-left', icon: ChevronLeft, label: 'Chevron Left' },
  { name: 'chevron-right', icon: ChevronRight, label: 'Chevron Right' },
  { name: 'circle', icon: Circle, label: 'Circle' },
  { name: 'clock', icon: Clock, label: 'Clock' },
  { name: 'cloud', icon: Cloud, label: 'Cloud' },
  { name: 'code', icon: Code, label: 'Code' },
  { name: 'command', icon: Command, label: 'Command' },
  { name: 'compass', icon: Compass, label: 'Compass' },
  { name: 'copy', icon: Copy, label: 'Copy' },
  { name: 'database', icon: Database, label: 'Database' },
  { name: 'diamond', icon: Diamond, label: 'Diamond' },
  { name: 'download', icon: Download, label: 'Download' },
  { name: 'edit', icon: Edit, label: 'Edit' },
  { name: 'envelope', icon: Mail, label: 'Email' },
  { name: 'eye', icon: Eye, label: 'Eye' },
  { name: 'file', icon: File, label: 'File' },
  { name: 'folder', icon: Folder, label: 'Folder' },
  { name: 'gift', icon: Gift, label: 'Gift' },
  { name: 'globe', icon: Globe, label: 'Website' },
  { name: 'grid', icon: Grid, label: 'Grid' },
  { name: 'hammer', icon: Hammer, label: 'Hammer' },
  { name: 'hash', icon: Hash, label: 'Hash' },
  { name: 'heart', icon: Heart, label: 'Heart' },
  { name: 'home', icon: Home, label: 'Home' },
  { name: 'image', icon: Image, label: 'Image' },
  { name: 'info', icon: Info, label: 'Info' },
  { name: 'key', icon: Key, label: 'Key' },
  { name: 'laptop', icon: Laptop, label: 'Laptop' },
  { name: 'link', icon: Link, label: 'Link' },
  { name: 'list', icon: List, label: 'List' },
  { name: 'lock', icon: Lock, label: 'Lock' },
  { name: 'mail', icon: Mail, label: 'Mail' },
  { name: 'map', icon: Map, label: 'Map' },
  { name: 'menu', icon: Menu, label: 'Menu' },
  { name: 'message', icon: MessageCircle, label: 'Message' },
  { name: 'mic', icon: Mic, label: 'Microphone' },
  { name: 'moon', icon: Moon, label: 'Moon' },
  { name: 'music', icon: Music, label: 'Music' },
  { name: 'notebook', icon: Notebook, label: 'Notebook' },
  { name: 'paperclip', icon: Paperclip, label: 'Attachment' },
  { name: 'phone', icon: Phone, label: 'Phone' },
  { name: 'play', icon: Play, label: 'Play' },
  { name: 'plus', icon: Plus, label: 'Plus' },
  { name: 'refresh', icon: RefreshCw, label: 'Refresh' },
  { name: 'rocket', icon: Rocket, label: 'Rocket' },
  { name: 'search', icon: Search, label: 'Search' },
  { name: 'settings', icon: Settings, label: 'Settings' },
  { name: 'shield', icon: Shield, label: 'Shield' },
  { name: 'shoppingbag', icon: ShoppingBag, label: 'Shopping Bag' },
  { name: 'smile', icon: Smile, label: 'Smile' },
  { name: 'star', icon: Star, label: 'Star' },
  { name: 'sun', icon: Sun, label: 'Sun' },
  { name: 'tag', icon: Tag, label: 'Tag' },
  { name: 'terminal', icon: Terminal, label: 'Terminal' },
  { name: 'trash', icon: Trash2, label: 'Trash' },
  { name: 'twitter', icon: Twitter, label: 'Twitter' },
  { name: 'instagram', icon: Instagram, label: 'Instagram' },
  { name: 'youtube', icon: Youtube, label: 'YouTube' },
  { name: 'instagram', icon: Instagram, label: 'Instagram' },
  { name: 'youtube', icon: Youtube, label: 'YouTube' },
  { name: 'user', icon: User, label: 'User' },
  { name: 'video', icon: Video, label: 'Video' },
  { name: 'wallet', icon: Wallet, label: 'Wallet' },
  { name: 'wrench', icon: Wrench, label: 'Wrench' },
  { name: 'x', icon: X, label: 'Close' },
]

const IconSelector = ({ value, onChange, label = 'Select Icon' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredIcons = ICONS.filter((icon) =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icon.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedIcon = ICONS.find((icon) => icon.name === value)

  const handleSelect = (iconName) => {
    onChange(iconName)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
      >
        <span className="flex items-center gap-3">
          {selectedIcon ? (
            <>
              <selectedIcon.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{selectedIcon.label}</span>
            </>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">Choose an icon</span>
          )}
        </span>
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search icons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-2 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-5 gap-1">
                {filteredIcons.map((icon) => (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => handleSelect(icon.name)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                      value === icon.name
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                    title={icon.label}
                  >
                    <icon.icon className="w-5 h-5 mb-1" />
                    <span className="text-[10px] truncate w-full text-center">{icon.label}</span>
                  </button>
                ))}
              </div>

              {filteredIcons.length === 0 && (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No icons found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default IconSelector
