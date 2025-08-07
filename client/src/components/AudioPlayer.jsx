import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'

const AudioPlayer = ({ audioUrl, isPlaying, setIsPlaying, duration, playbackRate = 1.0, setPlaybackRate, onEnded }) => {
  const audioRef = useRef(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const handleEnded = () => {
      setIsPlaying(false)
      if (onEnded) onEnded()
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [setIsPlaying, onEnded])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play()
    } else {
      audio.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.playbackRate = playbackRate
    }
  }, [playbackRate])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    if (!audio) return

    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * audio.duration
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const handleRateChange = (e) => {
    const newRate = parseFloat(e.target.value)
    if (setPlaybackRate) setPlaybackRate(newRate)
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      {/* Play/Pause Button */}
      <div className="flex justify-center">
        <button
          onClick={togglePlay}
          className="w-16 h-16 bg-primary-500 hover:bg-primary-600 rounded-full flex items-center justify-center text-white transition-colors duration-200"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </button>
      </div>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div
          className="w-full h-2 bg-gray-200 rounded-full cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="h-2 bg-primary-500 rounded-full transition-all duration-100"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      {/* Volume and Speed Control */}
      <div className="space-y-3">
        {/* Volume Control */}
        <div className="flex items-center space-x-3">
          <Volume2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-sm text-gray-500 w-8 flex-shrink-0">
            {Math.round(volume * 100)}%
          </span>
        </div>
        
        {/* Speed Control */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500 flex-shrink-0">Speed:</span>
          <select
            value={playbackRate}
            onChange={handleRateChange}
            className="px-3 py-1 border rounded text-sm text-gray-700 bg-white flex-shrink-0"
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1.0}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2.0}>2x</option>
          </select>
        </div>
      </div>
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}

export default AudioPlayer 