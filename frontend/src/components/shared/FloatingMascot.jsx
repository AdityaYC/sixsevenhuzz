function FloatingMascot() {
  return (
    <div style={{
      position:'fixed', right:'16px', bottom:'16px', zIndex:1000,
      background:'rgba(20,27,52,0.7)', border:'1px solid rgba(255,255,255,0.1)',
      backdropFilter:'blur(10px)', borderRadius:'16px', padding:'10px 14px',
      display:'flex', alignItems:'center', gap:'8px', boxShadow:'0 8px 32px 0 rgba(0,0,0,0.37)'
    }}>
      <span role="img" aria-label="mascot" style={{fontSize:'20px'}}>🤖</span>
      <span style={{fontSize:'12px', color:'#D1D5DB'}}>Try a gesture!</span>
    </div>
  )
}

export default FloatingMascot
