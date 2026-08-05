import React, { useState, useEffect, useRef } from 'react'
import { playClippers } from '../utils/clipperSound'
import './Intro.css'

/** Clippers run for the length of the reveal (0.5s delay + 2.4s travel). */
const CLIPPER_RUN = 3.1

export default function Intro({ onDone }) {
  const [leaving, setLeaving] = useState(false)
  const [muted, setMuted] = useState(() => localStorage.getItem('nomadic_muted') === '1')
  const stopRef = useRef(null)
  const playedRef = useRef(false)

  useEffect(() => {
    if (muted) return

    const start = () => {
      if (playedRef.current) return
      playedRef.current = true
      stopRef.current = playClippers(CLIPPER_RUN)
    }

    start()
    // Autoplay is blocked until a gesture — fall back to the first interaction.
    window.addEventListener('pointerdown', start, { once: true })
    window.addEventListener('keydown', start, { once: true })

    return () => {
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
      stopRef.current?.()
    }
  }, [muted])

  const toggleMute = () => {
    setMuted(m => {
      const next = !m
      localStorage.setItem('nomadic_muted', next ? '1' : '0')
      if (next) stopRef.current?.()
      return next
    })
  }

  const handleEnter = () => {
    stopRef.current?.()
    setLeaving(true)
    setTimeout(() => {
      sessionStorage.setItem('nomadic_intro_seen', '1')
      onDone()
    }, 800)
  }

  return (
    <div className={`intro${leaving ? ' intro--leaving' : ''}`}>

      {/* Sound toggle */}
      <button
        className="intro__mute"
        onClick={toggleMute}
        aria-label={muted ? 'Unmute clippers' : 'Mute clippers'}
        title={muted ? 'Sound off' : 'Sound on'}
      >
        {muted ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        )}
      </button>

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
