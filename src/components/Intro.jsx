import React, { useState } from 'react'
import './Intro.css'

export default function Intro({ onDone }) {
  const [leaving, setLeaving] = useState(false)

  const handleEnter = () => {
    setLeaving(true)
    setTimeout(() => {
      sessionStorage.setItem('nomadic_intro_seen', '1')
      onDone()
    }, 800)
  }

  return (
    <div className={`intro${leaving ? ' intro--leaving' : ''}`}>

      {/* Logo image — revealed by clip-path wipe left→right */}
      <div className="intro__logo-wrap">
        <img
          src="Pics/logo.jpg"
          alt="NOMADIC"
          className="intro__logo"
        />
        {/* Black mask that slides away left→right, driven by same timing as clippers */}
        <div className="intro__logo-mask" />
      </div>

      {/* Clippers travel left → right in front of logo */}
      <div className="intro__clippers">
        <svg width="80" height="36" viewBox="0 0 80 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Body */}
          <rect x="4" y="6" width="54" height="22" rx="5" fill="#d0d0d0" />
          <rect x="6" y="8" width="50" height="18" rx="4" fill="#eeeeee" />
          {/* Grip lines */}
          <rect x="22" y="11" width="1.5" height="12" rx="1" fill="#bbb" />
          <rect x="27" y="11" width="1.5" height="12" rx="1" fill="#bbb" />
          <rect x="32" y="11" width="1.5" height="12" rx="1" fill="#bbb" />
          <rect x="37" y="11" width="1.5" height="12" rx="1" fill="#bbb" />
          {/* Blade body */}
          <rect x="58" y="9" width="12" height="16" rx="2" fill="#b8960e" />
          {/* Blade teeth */}
          <rect x="69" y="10"  width="4" height="3.5" rx="0.5" fill="#D4AF37" />
          <rect x="69" y="15"  width="4" height="3.5" rx="0.5" fill="#D4AF37" />
          <rect x="69" y="20"  width="4" height="3.5" rx="0.5" fill="#D4AF37" />
          <rect x="73" y="11"  width="4" height="2"   rx="0.5" fill="#f0c830" />
          <rect x="73" y="15.5" width="4" height="2"  rx="0.5" fill="#f0c830" />
          <rect x="73" y="20.5" width="4" height="2"  rx="0.5" fill="#f0c830" />
          {/* Power button */}
          <circle cx="13" cy="17" r="5" fill="#333" />
          <circle cx="13" cy="17" r="3" fill="#222" />
          <circle cx="13" cy="17" r="1.2" fill="#D4AF37" />
          {/* Cord */}
          <path d="M4 22 C0 26 -2 30 2 32 C6 34 4 30 0 34" stroke="#555" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      </div>

      {/* Tagline */}
      <p className="intro__tagline">Sharp Cuts. San Diego.</p>

      {/* Enter button */}
      <button className="intro__enter" onClick={handleEnter}>
        ENTER SITE →
      </button>
    </div>
  )
}
