import React, { useRef } from 'react'
import './Footer.css'

export default function Footer({ onAdminTrigger }) {
  const clicks = useRef([])

  const handleLogoClick = () => {
    const now = Date.now()
    clicks.current = [...clicks.current.filter(t => now - t < 2000), now]
    if (clicks.current.length >= 5) {
      clicks.current = []
      onAdminTrigger()
    }
  }

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__logo" onClick={handleLogoClick} title="Admin">
          <div className="footer__badge">
            <div className="footer__pole" />
          </div>
          <span className="footer__name">NOMADIC</span>
        </div>

        <p className="footer__tagline">Sharp Cuts. San Diego.</p>

        <div className="footer__contact">
          <a href="https://www.instagram.com/theenomadicbarber" target="_blank" rel="noreferrer" className="footer__contact-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
              <circle cx="17.5" cy="6.5" r="1.2"/>
            </svg>
            @theenomadicbarber
          </a>
          <a href="tel:8049291680" className="footer__contact-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.06 6.06l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            (804) 929-1680
          </a>
        </div>

        <div className="footer__shop">
          <span>The Cutt'n Edge Barbershop</span>
          <span>6485 El Cajon Blvd, San Diego, CA 92115</span>
          <a href="tel:6193543083">(619) 354-3083</a>
        </div>

        <p className="footer__copy">© 2025 Nomadic. All rights reserved.</p>
      </div>
    </footer>
  )
}
