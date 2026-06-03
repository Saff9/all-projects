import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, 
  Trash2, 
  Download, 
  Loader2,
  X,
  Check,
  ExternalLink,
  Database,
  ShieldAlert,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * DangerZone Component
 * Handle account deletion and data export
 */
const DangerZone = ({
  onDeleteAccount,
  onExportData,
  className = ''
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }

    setIsDeleting(true)
    try {
      await onDeleteAccount()
      toast.success('Account deleted successfully')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error(error.message || 'Failed to delete account')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
      setDeleteConfirmation('')
    }
  }

  // Handle data export
  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const data = await onExportData()
      
      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `onelink-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Data exported successfully')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error(error.message || 'Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Danger Zone
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Irreversible actions for your account
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Export Data */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Export Your Data
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Download a copy of all your data
                </p>
              </div>
            </div>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg flex items-center gap-2"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )}
              Export
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              This will export your profile data, links, analytics, and settings. 
              The export will be in JSON format.
            </p>
          </div>
        </div>

        {/* Delete Account */}
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Delete Account
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Permanently delete your account and all data
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
            >
              Delete
            </button>
          </div>

          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Warning: This action cannot be undone
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Deleting your account will permanently remove all your data, 
                including your profile, links, analytics, and settings.
              </p>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Delete Account
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        This action is irreversible
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    This will permanently delete your account and all associated data. 
                    Please type <strong>DELETE</strong> to confirm.
                  </p>

                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type DELETE"
                    className="input-field mb-4"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeleteConfirmation('')
                      }}
                      className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete Account
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default DangerZone
