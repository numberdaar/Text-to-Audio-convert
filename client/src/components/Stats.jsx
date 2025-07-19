import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Clock, Volume2, PieChart } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const Stats = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/history/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  const voiceNames = {
    alloy: 'Alloy',
    echo: 'Echo',
    fable: 'Fable',
    onyx: 'Onyx',
    nova: 'Nova',
    shimmer: 'Shimmer'
  }

  const voiceColors = {
    alloy: 'bg-blue-500',
    echo: 'bg-green-500',
    fable: 'bg-purple-500',
    onyx: 'bg-gray-700',
    nova: 'bg-yellow-500',
    shimmer: 'bg-pink-500'
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-600">Start converting text to audio to see your statistics</p>
        </div>
      </div>
    )
  }

  const totalConversions = stats.totalConversions || 0
  const totalDuration = stats.totalDuration || 0
  const averageDuration = stats.averageDuration || 0
  const voiceStats = stats.voiceStats || []

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
        <p className="text-gray-600 mt-2">Your audio conversion analytics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Conversions</p>
              <p className="text-2xl font-bold text-gray-900">{totalConversions}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Duration</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(totalDuration)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Average Duration</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(Math.round(averageDuration))}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Usage Chart */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <PieChart className="w-5 h-5 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-900">Voice Usage</h2>
        </div>

        {voiceStats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No voice usage data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {voiceStats.map((voiceStat) => {
              const percentage = totalConversions > 0 
                ? Math.round((voiceStat.count / totalConversions) * 100)
                : 0

              return (
                <div key={voiceStat._id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${voiceColors[voiceStat._id]}`} />
                      <span className="font-medium text-gray-900">
                        {voiceNames[voiceStat._id]}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">{voiceStat.count}</span>
                      <span className="text-gray-500 ml-2">({percentage}%)</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${voiceColors[voiceStat._id]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Activity Summary */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Summary</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600">Most used voice</span>
            <span className="font-medium text-gray-900">
              {voiceStats.length > 0 ? voiceNames[voiceStats[0]._id] : 'N/A'}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600">Average conversions per session</span>
            <span className="font-medium text-gray-900">
              {totalConversions > 0 ? Math.round(totalConversions / Math.max(1, Math.ceil(totalConversions / 10))) : 0}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-600">Total audio generated</span>
            <span className="font-medium text-gray-900">{formatDuration(totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Tips for Better Results</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
            <span>Try different voices for different types of content</span>
          </li>
          <li className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
            <span>Keep text under 4000 characters for optimal performance</span>
          </li>
          <li className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
            <span>Use punctuation to improve speech naturalness</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Stats 