import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link as LinkIcon,
  Type,
  FileText,
  Image,
  Eye,
  EyeOff,
  Save,
  X,
  Plus,
} from 'lucide-react';
import Button from '../ui/Button';
import Input, { Textarea } from '../ui/Input';

const LinkEditor = ({
  link,
  onSave,
  onCancel,
  isOpen = true,
  className = '',
}) => {
  const [formData, setFormData] = useState({
    title: link?.title || '',
    url: link?.url || '',
    description: link?.description || '',
    iconURL: link?.iconURL || '',
    isActive: link?.isActive ?? true,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    console.log('handleChange', { field, value });
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string.startsWith('http') ? string : `https://${string}`);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('handleSubmit - formData before validation', formData);
    if (validate()) {
      const url = formData.url.startsWith('http')
        ? formData.url
        : `https://${formData.url}`;
      const savedData = { ...formData, url };
      console.log('handleSubmit - saving data', savedData);
      onSave?.(savedData);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl ${className}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {link ? 'Edit Link' : 'Add New Link'}
            </h3>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Title */}
            <Input
              label="Title"
              placeholder="My Website"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              error={errors.title}
              icon={<Type className="w-4 h-4" />}
              required
            />

            {/* URL */}
            <Input
              label="URL"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => handleChange('url', e.target.value)}
              error={errors.url}
              icon={<LinkIcon className="w-4 h-4" />}
              required
            />

            {/* Description */}
            <Textarea
              label="Description (optional)"
              placeholder="Brief description of this link"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
            />

            {/* Icon URL */}
            <Input
              label="Icon URL (optional)"
              placeholder="https://example.com/icon.png"
              value={formData.iconURL}
              onChange={(e) => handleChange('iconURL', e.target.value)}
              icon={<Image className="w-4 h-4" />}
            />

            {/* Active Toggle */}
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="flex items-center gap-2">
                {formData.isActive ? (
                  <Eye className="w-4 h-4 text-success-500" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formData.isActive ? 'Link is visible' : 'Link is hidden'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleChange('isActive', !formData.isActive)}
                className={`
                  relative w-11 h-6 rounded-full transition-colors
                  ${formData.isActive ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}
                `}
              >
                <motion.div
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                  animate={{ left: formData.isActive ? 22 : 4 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
                Cancel
              </Button>
              <Button type="submit" icon={<Save className="w-4 h-4" />} fullWidth>
                {link ? 'Save Changes' : 'Add Link'}
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Quick Link Add Component
export const QuickLinkAdd = ({ onAdd, className = '' }) => {
  const [url, setUrl] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onAdd?.({ url: url.startsWith('http') ? url : `https://${url}` });
      setUrl('');
      setIsExpanded(false);
    }
  };

  return (
    <div className={className}>
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Link</span>
        </button>
      ) : (
        <motion.form
          onSubmit={handleSubmit}
          className="flex gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Input
            placeholder="Paste URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button type="submit" icon={<Plus className="w-4 h-4" />}>
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setIsExpanded(false);
              setUrl('');
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.form>
      )}
    </div>
  );
};

// Link Editor Modal
export const LinkEditorModal = ({
  isOpen,
  onClose,
  link,
  onSave,
}) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isOpen ? '' : 'pointer-events-none'
      }`}
    >
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Modal */}
      <LinkEditor
        link={link}
        onSave={onSave}
        onCancel={onClose}
        isOpen={isOpen}
        className="relative z-10 w-full max-w-md"
      />
    </div>
  );
};

export default LinkEditor;