import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Image, 
  Upload, 
  X, 
  Camera, 
  Trash2,
  Loader2,
  ZoomIn,
  Check,
  AlertCircle
} from 'lucide-react'

// Accepted file types
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * ThumbnailUploader Component
 * Upload and manage thumbnails for links
 */
const ThumbnailUploader = ({
  value = null,
  onChange,
  userId,
  linkId,
  className = '',
  aspectRatio = 'square', // 'square', 'landscape', 'portrait'
  maxSize = MAX_FILE_SIZE,
  showPreview = true
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const fileInputRef = useRef(null)

  // Validate file
  const validateFile = (file) => {
    if (!file) return 'No file selected'
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.'
    }
    if (file.size > maxSize) {
      return `File is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`
    }
    return null
  }

  // Handle file upload
  const handleUpload = async (file) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Create preview URL (temporary - file upload to backend needed)
      const previewUrl = URL.createObjectURL(file)

      // TODO: Implement file upload to backend storage
      // For now, just use the preview URL
      onChange?.({
        url: previewUrl,
        name: file.name,
        size: file.size,
        type: file.type
      })
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to process image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  // Handle remove
  const handleRemove = () => {
    onChange?.(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Get aspect ratio class
  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'landscape':
        return 'aspect-video'
      case 'portrait':
        return 'aspect-[3/4]'
      default:
        return 'aspect-square'
    }
  }

  return (
    <div className={className}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Area */}
      {!value ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative ${getAspectClass()} border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
          }`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            {isUploading ? (
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Uploading...</p>
              </div>
            ) : (
              <>
                <div className={`w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 ${
                  isDragging ? 'bg-primary-100 dark:bg-primary-900/30' : ''
                }`}>
                  <Upload className={`w-6 h-6 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`} />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isDragging ? 'Drop image here' : 'Upload thumbnail'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  JPEG, PNG, GIF, WebP up to {Math.round(maxSize / 1024 / 1024)}MB
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Preview */
        <div className={`relative ${getAspectClass()} rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800`}>
          <img
            src={value.url || value}
            alt="Thumbnail"
            className="w-full h-full object-cover"
          />
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
              title="Preview"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
              title="Change"
            >
              <Camera className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
              title="Remove"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Loading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 mt-2 text-sm text-red-500"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showModal && value && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-sm rounded-full text-white hover:bg-black/30 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Image */}
              <img
                src={value.url || value}
                alt="Thumbnail Preview"
                className="max-w-full max-h-[80vh] object-contain"
              />

              {/* Actions */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    fileInputRef.current?.click()
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleRemove()
                    setShowModal(false)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/80 backdrop-blur-sm rounded-lg text-white hover:bg-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * ThumbnailUploaderCompact - Compact version for inline use
 */
export const ThumbnailUploaderCompact = ({
  value = null,
  onChange,
  userId,
  linkId,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Create preview URL (temporary - file upload to backend needed)
      const previewUrl = URL.createObjectURL(file)

      // TODO: Implement file upload to backend storage
      onChange?.({ url: previewUrl, name: file.name })
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors overflow-hidden"
        title="Upload thumbnail"
      >
        {isUploading ? (
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        ) : value ? (
          <img
            src={value.url || value}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <Image className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {value && (
        <button
          type="button"
          onClick={() => onChange?.(null)}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

/**
 * ThumbnailPreview - Display thumbnail with optional actions
 */
export const ThumbnailPreview = ({
  src,
  alt = 'Thumbnail',
  size = 'md',
  className = ''
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  return (
    <div className={`${sizes[size]} rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <Image className="w-1/2 h-1/2 text-gray-400" />
      )}
    </div>
  )
}

export default ThumbnailUploader
