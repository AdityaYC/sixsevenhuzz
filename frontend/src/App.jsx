/**
 * SIXSEVENHUZZ.TECH - Main App Component
 * Where Gestures Meet Absolute Chaos 🎭
 * Author: Aditya Punjani
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import Hero from './components/Hero'
import LiveDetector from './components/LiveDetector'
import GestureGallery from './components/GestureGallery'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import Footer from './components/Footer'
import FloatingMascot from './components/shared/FloatingMascot'
import CursorTrail from './components/shared/CursorTrail'
import './App.css'

function App() {
  const [showMascot, setShowMascot] = useState(true)
  const [konamiCode, setKonamiCode] = useState([])
  const [secretMode, setSecretMode] = useState(false)

  // Konami Code Easter Egg
  useEffect(() => {
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
    
    const handleKeyDown = (e) => {
      const newCode = [...konamiCode, e.key].slice(-10)
      setKonamiCode(newCode)
      
      if (newCode.join(',') === konamiSequence.join(',')) {
        setSecretMode(true)
        alert('🎉 SECRET MODE ACTIVATED! All GIFs at once!')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [konamiCode])

  return (
    <div className="App">
      {/* Cursor Trail Effect */}
      <CursorTrail />
      
      {/* Floating Mascot */}
      {showMascot && <FloatingMascot />}
      
      {/* Main Content */}
      <Header />
      
      <main>
        <Hero />
        <LiveDetector secretMode={secretMode} />
        <GestureGallery />
        <HowItWorks />
        <Features />
      </main>
      
      <Footer />
    </div>
  )
}

export default App
