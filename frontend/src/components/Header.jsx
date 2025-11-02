import { smoothScrollTo } from '../utils/smoothScroll'

function Header() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => smoothScrollTo('top')} style={{cursor:'pointer'}}>
          <div className="logo-icon">
            <img src="/s7h-logo.png" alt="SIXSEVENHUZZ" style={{width:'100%', height:'100%', objectFit:'contain'}} />
          </div>
          <span className="logo-text">SIXSEVENHUZZ</span>
        </div>

        <div className="navbar-links">
          <a href="#demo" className="nav-link" onClick={(e)=>{e.preventDefault(); smoothScrollTo('demo')}}>
            <span>Try Demo</span>
          </a>
          <a href="#gestures" className="nav-link" onClick={(e)=>{e.preventDefault(); smoothScrollTo('gestures')}}>
            <span>Gestures</span>
          </a>
          <a href="#how" className="nav-link" onClick={(e)=>{e.preventDefault(); smoothScrollTo('how')}}>
            <span>How It Works</span>
          </a>
          <a href="#deploy" className="nav-link" onClick={(e)=>e.preventDefault()}>
            <span>Deploy</span>
          </a>
        </div>

        <button className="btn-primary" onClick={()=>smoothScrollTo('demo')}>
          <span>Get Started</span>
          <span className="icon-arrow" aria-hidden>→</span>
        </button>
      </div>
    </nav>
  )
}

export default Header
