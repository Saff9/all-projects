import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Check
} from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * NotificationSettings Component
 * Manage notification preferences
 */
const NotificationSettings = ({
  settings = {},
  onSave,
  className = ''
}) => {
  const [notifications, setNotifications] = useState({
    emailNotifications: settings?.emailNotifications ?? true,
    weeklyReport: settings?.weeklyReport ?? true,
    newFollower: settings?.newFollower ?? true,
    linkClicks: settings?.linkClicks ?? true,
    profileViews: settings?.profileViews ?? true,
    productUpdates: settings?.productUpdates ?? false,
    marketingEmails: settings?.marketingEmails ?? false,
    pushNotifications: settings?.pushNotifications ?? false,
    smsNotifications: settings?.smsNotifications ?? false
  })
  const [isSaving, setIsSaving] = useState(false)

  // Toggle notification
  const handleToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Handle save
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(notifications)
      toast.success('Notification preferences saved')
    } catch (error) {
      console.error('Error saving notifications:', error)
      toast.error('Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const notificationGroups = [
    {
      title: 'Email Notifications',
      icon: Mail,
      items: [
        {
          key: 'emailNotifications',
          label: 'Email Notifications',
          description: 'Receive notifications via email'
        },
        {
          key: 'weeklyReport',
          label: 'Weekly Analytics Report',
          description: 'Get a weekly summary of your profile performance'
        },
        {
          key: 'productUpdates',
          label: 'Product Updates',
          description: 'Stay informed about new features and updates'
        },
        {
          key: 'marketingEmails',
          label: 'Marketing Emails',
          description: 'Receive tips and promotional content'
        }
      ]
    },
    {
      title: 'Push Notifications',
      icon: Bell,
      items: [
        {
          key: 'pushNotifications',
          label: 'Push Notifications',
          description: 'Receive push notifications on your device'
        },
        {
          key: 'newFollower',
          label: 'New Followers',
          description: 'Get notified when someone follows your profile'
        },
        {
          key: 'linkClicks',
          label: 'Link Clicks',
          description: 'Get notified when someone clicks your links'
        },
        {
          key: 'profileViews',
          label: 'Profile Views',
          description: 'Get notified when someone views your profile'
        }
      ]
    },
    {
      title: 'SMS Notifications',
      icon: Smartphone,
      items: [
        {
          key: 'smsNotifications',
          label: 'SMS Notifications',
          description: 'Receive important alerts via SMS'
        }
      ]
    }
  ]

  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-accent-100 dark:bg-accent-900/30 rounded-xl flex items-center justify-center">
          <Bell className="w-5 h-5 text-accent-600 dark:text-accent-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notification Settings
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose how you want to be notified
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {notificationGroups.map((group) => {
          const Icon = group.icon
          return (
            <div key={group.title} className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Icon className="w-4 h-4" />
                {group.title}
              </div>
              
              <div className="space-y-3">
                {group.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.label}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle(item.key)}
                      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                        notifications[item.key]
                          ? 'bg-primary-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          notifications[item.key] ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationSettings
