import { useState, useEffect } from 'react'
import { Play, Pause, Download, Volume2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import VoiceSelector from './VoiceSelector'
import AudioPlayer from './AudioPlayer'

const TextToAudio = () => {
  const [text, setText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState('alloy')
  const [voices, setVoices] = useState([])
  const [isConverting, setIsConverting] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioDuration, setAudioDuration] = useState(0)

  useEffect(() => {
    fetchVoices()
  }, [])

  const fetchVoices = async () => {
    try {
      const response = await axios.get('/api/audio/voices')
      setVoices(response.data.voices)
    } catch (error) {
      console.error('Error fetching voices:', error)
      toast.error('Failed to load voices')
    }
  }

  const handleConvert = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to convert')
      return
    }

    setIsConverting(true)
    setAudioUrl(null)

    try {
      const response = await axios.post('/api/audio/convert', {
        text: text.trim(),
        voice: selectedVoice
      })

      setAudioUrl(response.data.audioUrl)
      setAudioDuration(response.data.duration)
      toast.success('Audio converted successfully!')
    } catch (error) {
      console.error('Conversion error:', error)
      toast.error(error.response?.data?.error || 'Failed to convert text to audio')
    } finally {
      setIsConverting(false)
    }
  }

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a')
      link.href = audioUrl
      link.download = `audio_${Date.now()}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const characterCount = text.length

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Convert Text to Audio
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Transform your text into natural-sounding speech with AI-powered voices. No character limits, unlimited possibilities.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 xl:gap-12">
        {/* Input Section */}
        <div className="space-y-6 order-2 lg:order-1">
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Enter Your Text
            </h2>
            
            <div className="space-y-4">
                             <textarea
                 value={text}
                 onChange={(e) => setText(e.target.value)}
                 placeholder="Type or paste your text here... (no character limit)"
                 className="input-field min-h-[400px] text-lg leading-relaxed resize-none"
               />
               
               <div className="flex justify-between items-center text-sm text-gray-500">
                 <span>{characterCount} characters</span>
                 <span className="text-primary-600 font-medium">No limit</span>
               </div>
            </div>
          </div>

          {/* Voice Selection */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Choose a Voice
            </h2>
            <VoiceSelector
              voices={voices}
              selectedVoice={selectedVoice}
              onVoiceSelect={setSelectedVoice}
            />
          </div>

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            disabled={isConverting || !text.trim()}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 py-6 text-xl font-semibold"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Converting...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" />
                <span>Convert to Audio</span>
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="space-y-6 order-1 lg:order-2">
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Audio Output
            </h2>
            
            {audioUrl ? (
              <div className="space-y-4">
                <AudioPlayer
                  audioUrl={audioUrl}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  duration={audioDuration}
                />
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Volume2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Your converted audio will appear here</p>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Features
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-primary-500 rounded-full flex-shrink-0" />
                <span className="text-lg">6 different AI voices to choose from</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-primary-500 rounded-full flex-shrink-0" />
                <span className="text-lg">High-quality audio output</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-primary-500 rounded-full flex-shrink-0" />
                <span className="text-lg">No character limits</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-primary-500 rounded-full flex-shrink-0" />
                <span className="text-lg">Download and share audio files</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TextToAudio 