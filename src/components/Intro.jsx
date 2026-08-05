import React, { useState, useEffect, useRef } from 'react'
import { playClippers, stopClippers } from '../utils/clipperSound'
import './Intro.css'

/** Matches the --cut-dur / --cut-delay values in Intro.css. */
const CUT_DELAY = 0.6
const CUT_DUR = 2.2
const CLIPPER_RUN = CUT_DELAY + CUT_DUR + 0.3

export default function Intro({ onDone }) {
  const [leaving, setLeaving] = useState(false)
  const [muted, setMuted] = useState(() => localStorage.getItem('nomadic_muted') === '1')
  // The cut is held back so it can run together with the clipper buzz.
  // Browsers won't play audio without a gesture, so if playback is blocked
  // we ask for one tap and fire both at once.
  const [started, setStarted] = useState(false)
  const [needsTap, setNeedsTap] = useState(false)
  const stopRef = useRef(null)
  const settledRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      if (muted) { settledRef.current = true; setStarted(true); return }
      const stop = await playClippers(CLIPPER_RUN)
      if (cancelled) { stop?.(); return }
      settledRef.current = true
      if (stop) {
        stopRef.current = stop
        setStarted(true)
      } else {
        setNeedsTap(true) // blocked — offer the tap
      }
    })()

    // Failsafe: if audio never resolves either way, run the cut anyway
    // rather than leaving the visitor staring at a frozen badge.
    const failsafe = setTimeout(() => {
      if (!cancelled && !settledRef.current) setStarted(true)
    }, 2500)

    return () => {
      cancelled = true
      clearTimeout(failsafe)
      stopRef.current?.()
      stopClippers() // the intro is gone; nothing should still be buzzing
    }
  }, [muted])

  const beginCut = () => {
    if (started) return
    setNeedsTap(false)
    // Start the cut immediately and let audio catch up. Awaiting playback
    // here meant any audio failure silently swallowed the animation.
    setStarted(true)
    if (!muted) {
      playClippers(CLIPPER_RUN)
        .then(stop => { if (stop) stopRef.current = stop })
        .catch(() => {})
    }
  }

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
    stopClippers() // covers the case where stop() has not resolved yet
    setLeaving(true)
    setTimeout(() => {
      sessionStorage.setItem('nomadic_intro_seen', '1')
      onDone()
    }, 700)
  }

  return (
    <div
      className={`intro${leaving ? ' intro--leaving' : ''}${started ? ' intro--cutting' : ''}`}
    >
      {/* Backdrop: skyline + the warm pool of light behind the badge.
          Kept as a real element (not ::after) so it paints below the
          stage and the logo can blend against it. */}
      <div className="intro__backdrop">
        <img
          src="/sandiego.jpg"
          alt=""
          className="intro__city"
          aria-hidden="true"
        />
        <span className="intro__city-veil" />
        <span className="intro__glow" />
      </div>

      {/* Corner frame — echoes the site's gold rules */}
      <span className="intro__corner intro__corner--tl" />
      <span className="intro__corner intro__corner--tr" />
      <span className="intro__corner intro__corner--bl" />
      <span className="intro__corner intro__corner--br" />

      <button
        className="intro__mute"
        onClick={toggleMute}
        aria-label={muted ? 'Unmute clippers' : 'Mute clippers'}
      >
        {muted ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        )}
      </button>

      <div className="intro__stage">
        {/* The clipper and the reveal share one timeline, so the blade edge
            always sits exactly on the boundary of what's been uncovered. */}
        <div className="intro__logo-wrap">
          <img src="Pics/logo.jpg" alt="NOMADIC" className="intro__logo" />

          {/* Black plate sitting ON TOP of the logo. The blade shaves this
              away left-to-right, so the logo is uncovered rather than
              faded in — that's what sells it as an actual cut. */}
          <span className="intro__cover" />

          {/* Glowing edge that rides the reveal boundary — the "cut" itself */}
          <span className="intro__cutline" />

          {/* Hair clippings thrown off by the blade */}
          <span className="intro__bits" aria-hidden="true">
            {Array.from({ length: 14 }, (_, i) => (
              <i key={i} style={{ '--i': i }} />
            ))}
          </span>

          <div className="intro__clippers">
            <svg width="76" height="34" viewBox="0 0 76 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="6" width="52" height="22" rx="5" fill="#c9c9c9" />
              <rect x="4" y="8" width="48" height="18" rx="4" fill="#ececec" />
              <rect x="20" y="11" width="1.5" height="12" rx="1" fill="#b4b4b4" />
              <rect x="25" y="11" width="1.5" height="12" rx="1" fill="#b4b4b4" />
              <rect x="30" y="11" width="1.5" height="12" rx="1" fill="#b4b4b4" />
              <rect x="35" y="11" width="1.5" height="12" rx="1" fill="#b4b4b4" />
              <rect x="54" y="9" width="11" height="16" rx="2" fill="#b8960e" />
              <rect x="64" y="10.5" width="4" height="3" rx="0.5" fill="#D4AF37" />
              <rect x="64" y="15"   width="4" height="3" rx="0.5" fill="#D4AF37" />
              <rect x="64" y="19.5" width="4" height="3" rx="0.5" fill="#D4AF37" />
              <rect x="68" y="11"   width="4" height="2" rx="0.5" fill="#f0c830" />
              <rect x="68" y="15.5" width="4" height="2" rx="0.5" fill="#f0c830" />
              <rect x="68" y="20"   width="4" height="2" rx="0.5" fill="#f0c830" />
              <circle cx="11" cy="17" r="4.5" fill="#2e2e2e" />
              <circle cx="11" cy="17" r="1.2" fill="#D4AF37" />
              <path d="M2 22 C-2 26 -4 30 0 32" stroke="#4a4a4a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        {needsTap && (
          <button className="intro__tap" onClick={beginCut}>
            Tap to Cut
          </button>
        )}

        <p className="intro__tagline">Sharp Cuts. San Diego.</p>

        <button className="intro__enter" onClick={handleEnter}>
          Enter Site
        </button>
      </div>
    </div>
  )
}
