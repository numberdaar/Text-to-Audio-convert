import { Volume2, Check } from 'lucide-react'

const VoiceSelector = ({ voices, selectedVoice, onVoiceSelect }) => {
  const voiceIcons = {
    alloy: '🎯',
    echo: '🔄',
    fable: '📚',
    onyx: '💎',
    nova: '⭐',
    shimmer: '✨',
    // Hindi female tones
    politic: '🗳️',
    romantic: '💖',
    cute: '🐥'
  }

  const voiceColors = {
    alloy: 'from-blue-500 to-blue-600',
    echo: 'from-green-500 to-green-600',
    fable: 'from-purple-500 to-purple-600',
    onyx: 'from-gray-700 to-gray-800',
    nova: 'from-yellow-500 to-yellow-600',
    shimmer: 'from-pink-500 to-pink-600',
    // Hindi female tones
    politic: 'from-red-500 to-yellow-500',
    romantic: 'from-pink-400 to-pink-600',
    cute: 'from-yellow-300 to-pink-400'
  }

  // Combine all voices
  const allVoices = voices;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🎤</span>
          Voices
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allVoices.map((voice) => (
            <div
              key={voice.id}
              onClick={() => onVoiceSelect(voice.id)}
              className={`voice-card ${selectedVoice === voice.id ? 'selected' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${voiceColors[voice.id]} flex items-center justify-center text-white text-xl`}>
                  {voiceIcons[voice.id]}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{voice.name}</h3>
                  <p className="text-gray-600">{voice.description}</p>
                </div>
                {selectedVoice === voice.id && (
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VoiceSelector 