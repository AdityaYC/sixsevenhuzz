import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

function LiveDetector() {
  const USE_BACKEND = false
  const [currentGesture, setCurrentGesture] = useState(null)
  const [fps, setFps] = useState(0)
  const [gestureCount, setGestureCount] = useState(0)
  const [isLive, setIsLive] = useState(false)
  const videoRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const fpsCounterRef = useRef({ frames: 0, last: Date.now() })
  const pollTimerRef = useRef(null)

  useEffect(() => {
    // Poll backend for current gesture
    const poll = async () => {
      try {
        const res = await fetch('/api/current_gesture')
        if (!res.ok) return
        const data = await res.json()
        const mapped = {
          name: data.name,
          description: data.description,
          emoji: data.name?.split(' ')[0] || '👋',
          image: `/api/images/${data.image}`,
          isGif: data.image?.toLowerCase().endsWith('.gif'),
          caption: data.description,
          confidence: 95
        }
        setCurrentGesture(mapped)
        setGestureCount((c) => c + 1)

        // crude fps estimator based on poll cadence
        const now = Date.now()
        fpsCounterRef.current.frames += 1
        if (now - fpsCounterRef.current.last >= 1000) {
          setFps(fpsCounterRef.current.frames)
          fpsCounterRef.current.frames = 0
          fpsCounterRef.current.last = now
        }
      } catch (e) {
        // ignore transient errors
      }
    }

    pollTimerRef.current = setInterval(poll, 500)
    return () => clearInterval(pollTimerRef.current)
  }, [])

  useEffect(() => {
    const startWebcam = async () => {
      try {
        // Request webcam access; this will prompt the browser for permission
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        mediaStreamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
      } catch (err) {
        // Ignore errors; UI will remain paused if permission denied
        setIsLive(false)
      }
    }

    if (!USE_BACKEND && isLive) {
      startWebcam()
    }

    return () => {
      // Stop tracks on unmount
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop())
        mediaStreamRef.current = null
      }
    }
  }, [isLive])

  useEffect(() => {
    // When using browser webcam, periodically capture frames and send to backend for analysis
    if (USE_BACKEND) return
    let interval
    const sendFrame = async () => {
      const video = videoRef.current
      if (!video || video.readyState < 2) return
      const width = video.videoWidth || 640
      const height = video.videoHeight || 480
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
      try {
        const res = await fetch('/api/analyze_frame', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl })
        })
        if (!res.ok) return
        const data = await res.json()
        const mapped = {
          name: data.name,
          description: data.description,
          emoji: data.name?.split(' ')[0] || '👋',
          image: `/api/images/${data.image}`,
          isGif: data.image?.toLowerCase().endsWith('.gif'),
          caption: data.description,
          confidence: 95
        }
        setCurrentGesture(mapped)
        setGestureCount((c) => c + 1)
      } catch (e) {
        // ignore network errors between frames
      }
    }

    if (isLive) {
      interval = setInterval(sendFrame, 400)
    }
    return () => interval && clearInterval(interval)
  }, [isLive])

  const startCamera = () => setIsLive(true)
  const stopCamera = () => {
    setIsLive(false)
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop())
      mediaStreamRef.current = null
    }
  }
  const captureScreenshot = () => {
    // Capture the current frame from the <video>
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    const width = video.videoWidth || 640
    const height = video.videoHeight || 480
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    try {
      ctx.drawImage(video, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = 'gesture-snapshot.png'
      a.click()
    } catch (e) {
      alert('Snapshot not supported in this browser.')
    }
  }

  return (
    <section id="demo" className="detection-section">
      <div className="section-container">
        <div className="section-header">
          <span className="section-badge">Interactive Demo</span>
          <h2 className="section-title">
            Experience the Magic
            <span className="gradient-text"> in Real-Time</span>
          </h2>
          <p className="section-subtitle">
            Grant camera access and perform gestures to see instant AI-powered reactions
          </p>
        </div>

        <div className="detection-grid">
          <div className="camera-panel">
            <div className="panel-header">
              <div className="header-left">
                <span className="panel-icon">📹</span>
                <div>
                  <h3 className="panel-title">Live Camera</h3>
                  <p className="panel-subtitle">Webcam (requires permission)</p>
                </div>
              </div>
              <div className="status-badge">
                <span className="status-dot live"></span>
                <span>{isLive ? 'LIVE' : 'PAUSED'}</span>
              </div>
            </div>

            <div className="video-container">
              {USE_BACKEND ? (
                isLive ? (
                  <img id="mjpeg-stream" src="/api/video_feed" alt="Live Stream" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                ) : (
                  <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'var(--text-tertiary)'}}>Stream paused</div>
                )
              ) : (
                <video
                  id="webcam-video"
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{width:'100%', height:'100%', objectFit:'cover', background:'#000'}}
                />
              )}
              <canvas id="hand-canvas" className="hand-overlay" />

              <div className="detection-overlay">
                {currentGesture && (
                  <div className="gesture-detected">
                    <div className="gesture-info">
                      <span className="gesture-emoji">{currentGesture.emoji}</span>
                      <span className="gesture-name">{currentGesture.name}</span>
                    </div>
                    <div className="confidence-bar">
                      <div className="confidence-fill" style={{width: `${currentGesture.confidence}%`}} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="camera-controls">
              <button className="control-btn" onClick={startCamera}>
                <span className="icon" aria-hidden>▶</span>
                <span>Start</span>
              </button>
              <button className="control-btn" onClick={stopCamera}>
                <span className="icon" aria-hidden>⏹</span>
                <span>Stop</span>
              </button>
              <button className="control-btn" onClick={captureScreenshot}>
                <span className="icon" aria-hidden>📸</span>
                <span>Capture</span>
              </button>
            </div>
          </div>

          <div className="reaction-panel">
            <div className="panel-header">
              <div className="header-left">
                <span className="panel-icon">🎭</span>
                <div>
                  <h3 className="panel-title">Current Gesture</h3>
                  <p className="panel-subtitle">AI-detected reaction</p>
                </div>
              </div>
            </div>

            <div className="reaction-display">
              <AnimatePresence mode="wait">
                {currentGesture ? (
                  <motion.div
                    key={currentGesture.name}
                    initial={{ scale: 0, rotate: -10, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: 10, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="reaction-content"
                  >
                    <div className="reaction-image-container">
                      <img src={currentGesture.image} alt={currentGesture.name} className="reaction-image" />
                      {currentGesture.isGif && <span className="gif-badge">GIF</span>}
                    </div>
                    <div className="reaction-info">
                      <h3 className="reaction-name">{currentGesture.emoji} {currentGesture.name}</h3>
                      <p className="reaction-caption">{currentGesture.caption}</p>
                      <p className="reaction-description">{currentGesture.description}</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="reaction-placeholder">
                    <div className="placeholder-icon">👋</div>
                    <p>Waiting for gesture...</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="detection-stats">
              <div className="stat-card">
                <div className="stat-label">Confidence</div>
                <div className="stat-value">{currentGesture?.confidence || 0}%</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">FPS</div>
                <div className="stat-value">{fps || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Detections</div>
                <div className="stat-value">{gestureCount || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LiveDetector
