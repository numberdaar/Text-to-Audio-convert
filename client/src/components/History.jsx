import { useState, useEffect } from 'react'
import { Trash2, Download, Play, Pause, Filter, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import AudioPlayer from './AudioPlayer'

const History = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedVoice, setSelectedVoice] = useState('')
  const [playingId, setPlayingId] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [currentPage, selectedVoice])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      })
      
      if (selectedVoice) {
        params.append('voice', selectedVoice)
      }

      const response = await axios.get(`/api/history?${params}`)
      setHistory(response.data.history)
      setTotalPages(response.data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching history:', error)
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/history/${id}`)
      toast.success('Conversion deleted successfully')
      fetchHistory()
    } catch (error) {
      console.error('Error deleting conversion:', error)
      toast.error('Failed to delete conversion')
    }
  }

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all history?')) {
      return
    }

    try {
      await axios.delete('/api/history')
      toast.success('History cleared successfully')
      setHistory([])
      setCurrentPage(1)
    } catch (error) {
      console.error('Error clearing history:', error)
      toast.error('Failed to clear history')
    }
  }

  const handleDownload = (audioUrl) => {
    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `audio_${Date.now()}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const voiceNames = {
    alloy: 'Alloy',
    echo: 'Echo',
    fable: 'Fable',
    onyx: 'Onyx',
    nova: 'Nova',
    shimmer: 'Shimmer',
    priya: 'Priya',
    meera: 'Meera',
    anjali: 'Anjali',
    kavya: 'Kavya',
    diya: 'Diya',
    zara: 'Zara',
    neha: 'Neha',
    isha: 'Isha',
    riya: 'Riya',
    aisha: 'Aisha',
    maya: 'Maya',
    sana: 'Sana'
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conversion History</h1>
          <p className="text-gray-600 mt-2">View and manage your past audio conversions</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="btn-secondary flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by voice:</span>
          </div>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="">All voices</option>
            {Object.entries(voiceNames).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversions yet</h3>
          <p className="text-gray-600">Your audio conversion history will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                      {voiceNames[item.voice]}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-gray-900">{item.text}</p>
                  
                  <div className="flex items-center space-x-4">
                    <AudioPlayer
                      audioUrl={item.audioUrl}
                      isPlaying={playingId === item._id}
                      setIsPlaying={(playing) => setPlayingId(playing ? item._id : null)}
                      duration={item.duration}
                    />
                    
                    <button
                      onClick={() => handleDownload(item.audioUrl)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-700 flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default History 