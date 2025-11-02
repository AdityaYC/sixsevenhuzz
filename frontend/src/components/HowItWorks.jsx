function HowItWorks() {
  return (
    <section id="how" className="how-it-works-section">
      <div className="section-container">
        <div className="section-header">
          <span className="section-badge">Technology</span>
          <h2 className="section-title">Powered by<span className="gradient-text"> Cutting-Edge AI</span></h2>
          <p className="section-subtitle">Built with MediaPipe, OpenCV, and modern web technologies for real-time gesture detection</p>
        </div>

        <div className="process-flow">
          <div className="flow-step">
            <div className="step-number">01</div>
            <div className="step-icon">📹</div>
            <h3 className="step-title">Camera Capture</h3>
            <p className="step-description">High-performance video streaming at 30+ FPS</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="step-number">02</div>
            <div className="step-icon">🧠</div>
            <h3 className="step-title">AI Processing</h3>
            <p className="step-description">MediaPipe detects 21 hand landmarks in real-time</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="step-number">03</div>
            <div className="step-icon">🎯</div>
            <h3 className="step-title">Gesture Recognition</h3>
            <p className="step-description">Advanced algorithms identify your gesture</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="step-number">04</div>
            <div className="step-icon">🎭</div>
            <h3 className="step-title">Instant Reaction</h3>
            <p className="step-description">Display matching reaction with smooth animations</p>
          </div>
        </div>

        <div className="tech-stack">
          <div className="tech-card">
            <div className="tech-logo"><img src="/mediapipe-logo.svg" alt="MediaPipe" /></div>
            <h4 className="tech-name">MediaPipe</h4>
            <p className="tech-description">Google's ML solution for hand tracking</p>
            <span className="tech-badge">AI-Powered</span>
          </div>
          <div className="tech-card">
            <div className="tech-logo"><img src="/opencv-logo.svg" alt="OpenCV" /></div>
            <h4 className="tech-name">OpenCV</h4>
            <p className="tech-description">Computer vision processing</p>
            <span className="tech-badge">30+ FPS</span>
          </div>
          <div className="tech-card">
            <div className="tech-logo"><img src="/react-logo.svg" alt="React" /></div>
            <h4 className="tech-name">React + Framer</h4>
            <p className="tech-description">Smooth animations and UI</p>
            <span className="tech-badge">60 FPS</span>
          </div>
          <div className="tech-card">
            <div className="tech-logo"><img src="/flask-logo.svg" alt="Flask" /></div>
            <h4 className="tech-name">Flask API</h4>
            <p className="tech-description">Python-powered backend</p>
            <span className="tech-badge">Real-time</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
