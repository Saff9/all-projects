import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Eye, 
  MousePointer, 
  TrendingUp,
  TrendingDown,
  MapPin, 
  Monitor,
  Smartphone, 
  Tablet,
  Globe,
  ArrowUpDown,
  Download,
  RefreshCw,
  ChevronDown,
  ExternalLink,
  Clock,
  Users,
  Share2,
  FileText
} from 'lucide-react'
import { 
  LineChart, 
  BarChart, 
  StatsOverview, 
  TopLinks,
  AreaChart,
  Sparkline,
  GroupedBarChart,
  CircularProgressChart,
  ProgressBarChart
} from '../components/analytics'
import { analyticsApi } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'

// Date range options
const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'last90days', label: 'Last 90 Days' },
  { value: 'alltime', label: 'All Time' }
]

// Animation variants
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

function Analytics() {
  const { user } = useAuth()
  const { profile } = useProfile()
  
  const [dateRange, setDateRange] = useState('last7days')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [exportFormat, setExportFormat] = useState('csv')
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  
  // Analytics data states
  const [overviewStats, setOverviewStats] = useState(null)
  const [viewsData, setViewsData] = useState([])
  const [clicksData, setClicksData] = useState([])
  const [topLinks, setTopLinks] = useState([])
  const [deviceBreakdown, setDeviceBreakdown] = useState(null)
  const [geographicData, setGeographicData] = useState(null)
  const [referralSources, setReferralSources] = useState(null)
  const [comparisonData, setComparisonData] = useState(null)
  const [timeAnalytics, setTimeAnalytics] = useState(null)

  // Fetch all analytics data
  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (!profile?.id) return
    
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      const profileId = profile.id
      
      // Fetch all data in parallel
      const [
        overview,
        views,
        clicks,
        links,
        devices,
        geographic,
        referrers,
        comparison,
        timeData
      ] = await Promise.all([
        analyticsService.getOverviewStats(profileId, dateRange),
        analyticsService.getProfileViews(profileId, dateRange),
        analyticsService.getLinkClicks(profileId, dateRange),
        analyticsService.getTopLinks(profileId, 5),
        analyticsService.getDeviceBreakdown(profileId),
        analyticsService.getGeographicData(profileId),
        analyticsService.getReferralSources(profileId),
        analyticsService.getComparisonData(profileId, dateRange),
        analyticsService.getTimeAnalytics(profileId)
      ])
      
      setOverviewStats(overview)
      setViewsData(views)
      setClicksData(clicks)
      setTopLinks(links)
      setDeviceBreakdown(devices)
      setGeographicData(geographic)
      setReferralSources(referrers)
      setComparisonData(comparison)
      setTimeAnalytics(timeData)
      
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [profile?.id, dateRange])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Handle export
  const handleExport = async (format) => {
    if (!profile?.id) return
    
    try {
      await analyticsService.downloadAnalytics(profile.id, format)
      setShowExportDropdown(false)
    } catch (err) {
      console.error('Export error:', err)
      setError('Failed to export analytics data.')
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchAnalytics(true)
  }

  // Prepare chart data from views/clicks
  const prepareChartData = () => {
    if (!viewsData?.byDate || !clicksData?.byDate) {
      return {
        labels: [],
        views: [],
        clicks: []
      }
    }
    
    const allDates = new Set([
      ...Object.keys(viewsData.byDate),
      ...Object.keys(clicksData.byDate)
    ])
    
    const sortedDates = Array.from(allDates).sort()
    
    return {
      labels: sortedDates.map(date => {
        const d = new Date(date)
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }),
      views: sortedDates.map(date => viewsData.byDate[date] || 0),
      clicks: sortedDates.map(date => clicksData.byDate[date] || 0)
    }
  }

  const chartData = prepareChartData()

  // Prepare line chart data
  const lineChartData = chartData.labels.map((label, index) => ({
    label,
    value: chartData.views[index]
  }))

  // Prepare grouped bar chart data
  const groupedBarChartData = chartData.labels.slice(-7).map((label, index) => ({
    label,
    views: chartData.views.slice(-7)[index],
    clicks: chartData.clicks.slice(-7)[index]
  }))

  // Prepare device chart data
  const deviceChartData = deviceBreakdown ? [
    { label: 'Mobile', value: deviceBreakdown.mobile },
    { label: 'Desktop', value: deviceBreakdown.desktop },
    { label: 'Tablet', value: deviceBreakdown.tablet }
  ].filter(d => d.value > 0) : []

  // Loading state
  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Analytics</h1>
              <p className="text-sm text-slate-400 mt-1">
                Track your profile performance and visitor insights
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Date Range Selector */}
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="appearance-none bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  {DATE_RANGES.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-400 hover:bg-slate-600 transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              {/* Export Button */}
              <div className="relative">
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-medium text-sm hover:bg-blue-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                
                <AnimatePresence>
                  {showExportDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden z-20"
                    >
                      <button
                        onClick={() => handleExport('csv')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Export as CSV
                      </button>
                      <button
                        onClick={() => handleExport('json')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 transition-colors border-t border-slate-700"
                      >
                        <FileText className="w-4 h-4" />
                        Export as JSON
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Stats Overview */}
          <motion.div variants={itemVariants} className="mb-8">
            <StatsOverview 
              stats={{
                totalViews: overviewStats?.totalViews || 0,
                totalClicks: overviewStats?.totalClicks || 0,
                uniqueVisitors: overviewStats?.uniqueVisitors || 0,
                avgClickRate: overviewStats?.ctr || 0,
                viewsChange: comparisonData?.views?.growth || 0,
                clicksChange: comparisonData?.clicks?.growth || 0
              }}
            />
          </motion.div>

          {/* Charts Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Views Over Time */}
            <LineChart
              data={lineChartData}
              title="Views Over Time"
              value={overviewStats?.totalViews?.toLocaleString() || '0'}
              change={comparisonData?.views?.growth ? `${comparisonData.views.growth >= 0 ? '+' : ''}${comparisonData.views.growth}%` : undefined}
              changeType={comparisonData?.views?.growth >= 0 ? 'increase' : 'decrease'}
              color="primary"
              height={250}
            />
            
            {/* Clicks Over Time */}
            <LineChart
              data={chartData.labels.map((label, index) => ({
                label,
                value: chartData.clicks[index]
              }))}
              title="Clicks Over Time"
              value={overviewStats?.totalClicks?.toLocaleString() || '0'}
              change={comparisonData?.clicks?.growth ? `${comparisonData.clicks.growth >= 0 ? '+' : ''}${comparisonData.clicks.growth}%` : undefined}
              changeType={comparisonData?.clicks?.growth >= 0 ? 'increase' : 'decrease'}
              color="secondary"
              height={250}
            />
          </motion.div>

          {/* Views & Clicks Comparison Chart */}
          <motion.div variants={itemVariants} className="mb-8">
            <GroupedBarChart
              data={groupedBarChartData}
              groups={[
                { key: 'views', label: 'Views' },
                { key: 'clicks', label: 'Clicks' }
              ]}
              height={200}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-5"
            />
          </motion.div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Device Breakdown */}
            <motion.div variants={itemVariants}>
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 h-full">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Device Breakdown
                </h3>
                
                {deviceChartData.length > 0 ? (
                  <>
                    <CircularProgressChart data={deviceChartData} size={140} />
                    
                    <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 rounded-lg bg-slate-700">
                        <Smartphone className="w-5 h-5 mx-auto text-blue-400 mb-1" />
                        <p className="text-xs text-slate-400">Mobile</p>
                        <p className="font-semibold text-white">
                          {deviceBreakdown?.percentages?.mobile || 0}%
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-700">
                        <Monitor className="w-5 h-5 mx-auto text-indigo-400 mb-1" />
                        <p className="text-xs text-slate-400">Desktop</p>
                        <p className="font-semibold text-white">
                          {deviceBreakdown?.percentages?.desktop || 0}%
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-700">
                        <Tablet className="w-5 h-5 mx-auto text-cyan-400 mb-1" />
                        <p className="text-xs text-slate-400">Tablet</p>
                        <p className="font-semibold text-white">
                          {deviceBreakdown?.percentages?.tablet || 0}%
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                    <Monitor className="w-12 h-12 mb-2" />
                    <p className="text-sm">No device data available</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Top Countries */}
            <motion.div variants={itemVariants}>
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 h-full">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Top Countries
                </h3>
                
                {geographicData?.topCountries?.length > 0 ? (
                  <div className="space-y-3">
                    {geographicData.topCountries.slice(0, 5).map((country, index) => (
                      <div key={country.country} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 flex items-center justify-center text-xs font-medium text-slate-400 bg-slate-700 rounded-full">
                            {index + 1}
                          </span>
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-300">
                            {country.country}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {country.count.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({country.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                    <Globe className="w-12 h-12 mb-2" />
                    <p className="text-sm">No geographic data available</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Top Performing Links */}
            <motion.div variants={itemVariants}>
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 h-full">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Top Performing Links
                </h3>
                
                {topLinks?.length > 0 ? (
                  <div className="space-y-3">
                    {topLinks.map((link, index) => (
                      <div key={link.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 flex items-center justify-center text-xs font-medium text-slate-400 bg-slate-700 rounded-full">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-300 truncate">
                              {link.title}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {link.clickCount} clicks
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                    <ExternalLink className="w-12 h-12 mb-2" />
                    <p className="text-sm">No link clicks yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Referral Sources */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-4">
                Traffic Sources
              </h3>
              
              {referralSources?.topReferrers?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProgressBarChart
                    data={referralSources.topReferrers.slice(0, 6).map(r => ({
                      label: r.source,
                      value: r.count
                    }))}
                  />
                  
                  <div className="space-y-3">
                    {referralSources.topReferrers.slice(0, 5).map((referrer, index) => (
                      <div key={referrer.source} className="flex items-center justify-between p-3 rounded-lg bg-slate-700">
                        <div className="flex items-center gap-3">
                          <Share2 className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-300">
                            {referrer.source}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {referrer.count.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({referrer.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                  <Share2 className="w-12 h-12 mb-2" />
                  <p className="text-sm">No referral data available</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Best Time Analysis */}
          {timeAnalytics?.hourly && (
            <motion.div variants={itemVariants} className="mb-8">
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Activity by Hour
                  </h3>
                  {timeAnalytics.peakHour && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      Peak hour: {timeAnalytics.peakHour.hour}:00
                    </div>
                  )}
                </div>
                
                <BarChart
                  data={timeAnalytics.hourly.map(h => ({
                    label: `${h.hour}:00`,
                    value: h.count
                  }))}
                  height={150}
                  showValues={false}
                  color="gradient"
                />
              </div>
            </motion.div>
          )}

          {/* Quick Stats Summary */}
          <motion.div variants={itemVariants}>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Profile Performance Summary</h3>
                  <p className="text-white/80 text-sm">
                    Your profile has received {overviewStats?.lifetimeViews?.toLocaleString() || 0} lifetime views 
                    and {overviewStats?.lifetimeClicks?.toLocaleString() || 0} lifetime clicks
                  </p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{overviewStats?.ctr || 0}%</p>
                    <p className="text-sm text-white/80">Click Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{overviewStats?.linkCount || 0}</p>
                    <p className="text-sm text-white/80">Active Links</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

export default Analytics
