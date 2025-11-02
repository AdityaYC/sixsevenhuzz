import { motion } from 'framer-motion'

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-background">
        <div className="gradient-mesh"></div>
        <div className="grid-pattern"></div>
      </div>

      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          <span>AI-Powered Gesture Detection</span>
        </div>

        <h1 className="hero-title">
          Where Gestures Meet
          <span className="gradient-text"> Absolute Chaos</span>
        </h1>

        <p className="hero-subtitle">
          Experience real-time AI-powered hand gesture recognition with 
          lightning-fast detection, playful reactions, and zero latency.
        </p>

        <div className="hero-cta">
          <button className="btn-primary-large" onClick={() => document.getElementById('demo')?.scrollIntoView({behavior:'smooth'})}>
            <span>Try Live Demo</span>
            <span className="icon" aria-hidden>→</span>
          </button>
          <button className="btn-secondary">
            <span className="icon" aria-hidden>▶</span>
            <span>Watch Video</span>
          </button>
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-value">30+</div>
            <div className="stat-label">FPS Detection</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-value">18</div>
            <div className="stat-label">Gestures</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-value">95%</div>
            <div className="stat-label">Accuracy</div>
          </div>
        </div>
      </div>

      <div className="scroll-indicator">
        <div className="scroll-mouse">
          <div className="scroll-wheel" />
        </div>
        <span>Scroll to explore</span>
      </div>
    </section>
  )
}

export default Hero
