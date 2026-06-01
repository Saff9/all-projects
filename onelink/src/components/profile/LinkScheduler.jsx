import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  ChevronDown, 
  X, 
  Info,
  AlertCircle,
  CheckCircle,
  Sparkles
} from 'lucide-react'

/**
 * LinkScheduler Component
 * Schedule links to appear/disappear at specific times
 * Note: This is a placeholder for future implementation
 */
const LinkScheduler = ({
  schedule = null,
  onChange,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEnabled, setIsEnabled] = useState(schedule?.isEnabled || false)
  const [startDate, setStartDate] = useState(schedule?.startDate || '')
  const [startTime, setStartTime] = useState(schedule?.startTime || '')
  const [endDate, setEndDate] = useState(schedule?.endDate || '')
  const [endTime, setEndTime] = useState(schedule?.endTime || '')
  const [timezone, setTimezone] = useState(schedule?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)

  // Handle enable toggle
  const handleEnableToggle = () => {
    const newEnabled = !isEnabled
    setIsEnabled(newEnabled)
    updateSchedule({ isEnabled: newEnabled })
  }

  // Update schedule
  const updateSchedule = (updates) => {
    const newSchedule = {
      isEnabled: updates.isEnabled ?? isEnabled,
      startDate: updates.startDate ?? startDate,
      startTime: updates.startTime ?? startTime,
      endDate: updates.endDate ?? endDate,
      endTime: updates.endTime ?? endTime,
      timezone
    }
    onChange?.(newSchedule)
  }

  // Handle date/time changes
  const handleStartDateChange = (value) => {
    setStartDate(value)
    updateSchedule({ startDate: value })
  }

  const handleStartTimeChange = (value) => {
    setStartTime(value)
    updateSchedule({ startTime: value })
  }

  const handleEndDateChange = (value) => {
    setEndDate(value)
    updateSchedule({ endDate: value })
  }

  const handleEndTimeChange = (value) => {
    setEndTime(value)
    updateSchedule({ endTime: value })
  }

  // Clear schedule
  const clearSchedule = () => {
    setStartDate('')
    setStartTime('')
    setEndDate('')
    setEndTime('')
    setIsEnabled(false)
    onChange?.(null)
  }

  // Get schedule status
  const getScheduleStatus = () => {
    if (!isEnabled) return { type: 'disabled', message: 'Scheduling disabled' }
    if (!startDate && !endDate) return { type: 'incomplete', message: 'Set schedule dates' }
    if (startDate && !endDate) return { type: 'active', message: 'Visible from ' + new Date(startDate).toLocaleDateString() }
    if (!startDate && endDate) return { type: 'active', message: 'Visible until ' + new Date(endDate).toLocaleDateString() }
    return { type: 'active', message: `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}` }
  }

  const status = getScheduleStatus()

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isEnabled ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <Calendar className={`w-5 h-5 ${isEnabled ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              Link Scheduling
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {status.message}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Pro Feature Notice */}
              <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg border border-primary-100 dark:border-primary-800">
                <Sparkles className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    Pro Feature
                  </p>
                  <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">
                    Link scheduling is available on Pro plans. Upgrade to schedule your links.
                  </p>
                </div>
              </div>

              {/* Enable Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable scheduling
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleEnableToggle}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    isEnabled ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      isEnabled ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Schedule Form */}
              {isEnabled && (
                <div className="space-y-4 pt-2">
                  {/* Start Date/Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date & Time
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => handleStartDateChange(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => handleStartTimeChange(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* End Date/Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date & Time (Optional)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => handleEndDateChange(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => handleEndTimeChange(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                      <option value="Asia/Shanghai">Shanghai (CST)</option>
                      <option value="Asia/Kolkata">India (IST)</option>
                    </select>
                  </div>

                  {/* Clear Button */}
                  {(startDate || endDate) && (
                    <button
                      type="button"
                      onClick={clearSchedule}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="w-4 h-4" />
                      Clear schedule
                    </button>
                  )}
                </div>
              )}

              {/* Info */}
              <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Scheduled links will automatically appear and disappear based on the dates you set.
                  This feature requires a Pro subscription.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * LinkSchedulerCompact - Compact version for inline use
 */
export const LinkSchedulerCompact = ({
  schedule = null,
  onClick,
  className = ''
}) => {
  const isEnabled = schedule?.isEnabled
  const hasDates = schedule?.startDate || schedule?.endDate

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
        isEnabled && hasDates
          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
      } ${className}`}
    >
      <Calendar className="w-4 h-4" />
      {isEnabled && hasDates ? 'Scheduled' : 'Schedule'}
    </button>
  )
}

/**
 * ScheduleStatus - Display schedule status badge
 */
export const ScheduleStatus = ({
  schedule = null,
  className = ''
}) => {
  if (!schedule?.isEnabled) return null

  const now = new Date()
  const start = schedule.startDate ? new Date(schedule.startDate) : null
  const end = schedule.endDate ? new Date(schedule.endDate) : null

  let status = 'scheduled'
  let message = 'Scheduled'

  if (start && now < start) {
    status = 'pending'
    message = `Starts ${start.toLocaleDateString()}`
  } else if (end && now > end) {
    status = 'expired'
    message = `Ended ${end.toLocaleDateString()}`
  } else if ((start && now >= start) || (end && now <= end) || (start && !end)) {
    status = 'active'
    message = 'Currently visible'
  }

  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  }

  const StatusIcon = status === 'active' ? CheckCircle : status === 'expired' ? AlertCircle : Clock

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]} ${className}`}>
      <StatusIcon className="w-3 h-3" />
      {message}
    </div>
  )
}

export default LinkScheduler
