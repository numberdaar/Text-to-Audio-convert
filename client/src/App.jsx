import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import TextToAudio from './components/TextToAudio'
import History from './components/History'
import Stats from './components/Stats'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<TextToAudio />} />
          <Route path="/history" element={<History />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </main>
    </div>
  )
}

export default App 