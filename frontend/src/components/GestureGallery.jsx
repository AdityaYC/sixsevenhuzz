import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { getAllGestures } from '../utils/gestureConfig'

const GestureCard = ({ gesture, index }) => {
  return (
    <motion.div
      className="gesture-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="card-inner">
        <div className="card-image-container">
          <img src={gesture.image} alt={gesture.name} className="card-image" />
          {gesture.isGif && <span className="card-gif-badge">GIF</span>}
          <div className="card-overlay">
            <button className="try-button">Try This Gesture →</button>
          </div>
        </div>

        <div className="card-content">
          <div className="card-header">
            <span className="card-emoji">{gesture.emoji}</span>
            <span className={`difficulty-badge ${gesture.difficulty.split(' ')[0].toLowerCase()}`}>
              {gesture.difficulty.split(' ')[0]}
            </span>
          </div>

          <h3 className="card-title">{gesture.name}</h3>
          <p className="card-caption">{gesture.caption}</p>
          <p className="card-description">{gesture.description}</p>

          <div className="card-stats">
            <div className="card-stat"><span className="stat-icon">🔥</span><span>{gesture.timesUsed} uses</span></div>
            <div className="card-stat"><span className="stat-icon">⭐</span><span>{gesture.rating}/5</span></div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function GestureGallery() {
  const [filter, setFilter] = useState('All')
  const gestures = useMemo(() => getAllGestures(), [])
  const filtered = useMemo(() => {
    if (filter === 'All') return gestures
    return gestures.filter(g => g.difficulty.toLowerCase().includes(filter.toLowerCase()))
  }, [filter, gestures])

  return (
    <section id="gestures" className="gestures-section">
      <div className="section-container">
        <div className="section-header">
          <span className="section-badge">{gestures.length} Gestures</span>
          <h2 className="section-title">Your Complete<span className="gradient-text"> Gesture Arsenal</span></h2>
          <p className="section-subtitle">From classic thumbs up to complete chaos mode—every gesture triggers unique reactions</p>
        </div>

        <div className="filter-tabs">
          {['All','Easy','Medium','Expert','Chaos'].map(tab => (
            <button key={tab} className={`filter-tab ${filter===tab?'active':''}`} onClick={()=>setFilter(tab)}>
              {tab === 'Chaos' ? '🔥 Chaos' : tab + (tab==='All' ? ' Gestures' : '')}
            </button>
          ))}
        </div>

        <div className="gesture-grid">
          {filtered.map((gesture, index) => (
            <GestureCard key={gesture.id} gesture={gesture} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default GestureGallery
