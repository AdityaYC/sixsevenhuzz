function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon" style={{width:'32px', height:'32px', display:'inline-flex', alignItems:'center', justifyContent:'center'}}>
                <img src="/s7h-logo.png" alt="SIXSEVENHUZZ" style={{width:'100%', height:'100%', objectFit:'contain'}} />
              </span>
              <span className="logo-text">SIXSEVENHUZZ</span>
            </div>
            <p className="footer-tagline">Where Gestures Meet Absolute Chaos</p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="X / Twitter"><span className="social-icon">𝕏</span></a>
              <a href="#" className="social-link" aria-label="GitHub"><span className="social-icon">GitHub</span></a>
              <a href="#" className="social-link" aria-label="LinkedIn"><span className="social-icon">LinkedIn</span></a>
            </div>
          </div>

          <div className="footer-links">
            <div className="link-group">
              <h4 className="link-title">Product</h4>
              <a href="#demo" className="footer-link">Try Demo</a>
              <a href="#gestures" className="footer-link">Gestures</a>
              <a href="#how" className="footer-link">How It Works</a>
              <a href="#deploy" className="footer-link">Deploy</a>
            </div>
            <div className="link-group">
              <h4 className="link-title">Resources</h4>
              <a href="#" className="footer-link">Documentation</a>
              <a href="#" className="footer-link">API Reference</a>
              <a href="#" className="footer-link">GitHub Repo</a>
              <a href="#" className="footer-link">Report Bug</a>
            </div>
            <div className="link-group">
              <h4 className="link-title">Company</h4>
              <a href="#" className="footer-link">About</a>
              <a href="#" className="footer-link">Blog</a>
              <a href="#" className="footer-link">Contact</a>
              <a href="#" className="footer-link">Careers</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">© 2025 SixSevenHuzz. Built with 💜 using MediaPipe, OpenCV & React</p>
          <div className="footer-legal">
            <a href="#" className="legal-link">Privacy</a>
            <a href="#" className="legal-link">Terms</a>
            <a href="#" className="legal-link">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
