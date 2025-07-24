import { Volume2, Check } from 'lucide-react'

const VoiceSelector = ({ voices, selectedVoice, onVoiceSelect }) => {
  const voiceIcons = {
    alloy: '🎯',
    echo: '🔄',
    fable: '📚',
    onyx: '💎',
    nova: '⭐',
    shimmer: '✨',
    priya: '🌸',
    meera: '🌺',
    anjali: '🌼',
    kavya: '🌻',
    diya: '🌞',
    zara: '💫',
    neha: '🌷',
    isha: '🌹',
    riya: '🌸',
    aisha: '🌺',
    maya: '🌻',
    sana: '🌼'
  }

  const voiceColors = {
    alloy: 'from-blue-500 to-blue-600',
    echo: 'from-green-500 to-green-600',
    fable: 'from-purple-500 to-purple-600',
    onyx: 'from-gray-700 to-gray-800',
    nova: 'from-yellow-500 to-yellow-600',
    shimmer: 'from-pink-500 to-pink-600',
    priya: 'from-pink-400 to-pink-500',
    meera: 'from-purple-400 to-purple-500',
    anjali: 'from-orange-400 to-orange-500',
    kavya: 'from-yellow-400 to-yellow-500',
    diya: 'from-red-400 to-red-500',
    zara: 'from-indigo-400 to-indigo-500',
    neha: 'from-rose-400 to-rose-500',
    isha: 'from-emerald-400 to-emerald-500',
    riya: 'from-cyan-400 to-cyan-500',
    aisha: 'from-violet-400 to-violet-500',
    maya: 'from-amber-400 to-amber-500',
    sana: 'from-teal-400 to-teal-500'
  }

  // Group voices by category
  const standardVoices = voices.filter(voice => voice.category === 'standard');
  const indianVoices = voices.filter(voice => voice.category === 'indian');

  return (
    <div className="space-y-6">
      {/* Standard Voices */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🎤</span>
          Standard Voices
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {standardVoices.map((voice) => (
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

      {/* Indian Voices */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🇮🇳</span>
          Indian Female Voices (Regional Accents)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {indianVoices.map((voice) => (
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