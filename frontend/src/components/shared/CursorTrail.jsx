import { useEffect } from 'react'

function CursorTrail() {
  useEffect(() => {
    const trail = document.createElement('div')
    trail.style.position = 'fixed'
    trail.style.pointerEvents = 'none'
    trail.style.width = '10px'
    trail.style.height = '10px'
    trail.style.borderRadius = '50%'
    trail.style.background = 'radial-gradient(circle, rgba(139,92,246,0.8) 0%, rgba(236,72,153,0.6) 70%, transparent 100%)'
    trail.style.zIndex = '9999'
    document.body.appendChild(trail)

    const onMove = (e) => {
      trail.style.transform = `translate(${e.clientX - 5}px, ${e.clientY - 5}px)`
    }
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.body.removeChild(trail)
    }
  }, [])
  return null
}

export default CursorTrail
