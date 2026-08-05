import React, { useState, useEffect, useRef } from 'react'
import { startTrack, stopTrack } from '../utils/beat'
import './MusicToggle.css'

/**
 * Floating play/pause for the lo-fi bed.
 *
 * Deliberately opt-in: nothing plays until the visitor taps it. Autoplaying
 * music on a business site is hostile, and browsers block it anyway.
 * The choice is remembered so it doesn't have to be made every visit.
 */
export default function MusicToggle() {
  const [playing, setPlaying] = useState(false)
  const [pending, setPending] = useState(false)
  const [hint, setHint] = useState(false)
  const startedOnce = useRef(false)

  // Start automatically unless the visitor previously turned it off.
  // Entering the site is itself a click, so audio is usually unlocked by
  // the time this mounts; if it isn't, retry on the next interaction.
  useEffect(() => {
    if (localStorage.getItem('nomadic_music') === '0') return
    let cancelled = false

    const tryStart = async () => {
      if (cancelled || startedOnce.current) return
      const ok = await startTrack(0.5)
      if (ok && !cancelled) {
        startedOnce.current = true
        setPlaying(true)
        window.removeEventListener('pointerdown', tryStart)
        window.removeEventListener('keydown', tryStart)
      }
    }

    tryStart()
    window.addEventListener('pointerdown', tryStart)
    window.addEventListener('keydown', tryStart)
    return () => {
      cancelled = true
      window.removeEventListener('pointerdown', tryStart)
      window.removeEventListener('keydown', tryStart)
    }
  }, [])

  // Stop the audio graph if this ever unmounts.
  useEffect(() => () => stopTrack(), [])

  const toggle = async () => {
    setHint(false)
    if (playing) {
      stopTrack()
      setPlaying(false)
      localStorage.setItem('nomadic_music', '0')
      return
    }
    setPending(true)
    const ok = await startTrack(0.5)
    setPending(false)
    if (ok) {
      startedOnce.current = true
      setPlaying(true)
      localStorage.setItem('nomadic_music', '1')
    }
  }

  return (
    <div className="music">
      {hint && !playing && (
        <span className="music__hint">Tap for vibes</span>
      )}

      <button
        className={`music__btn${playing ? ' music__btn--on' : ''}`}
        onClick={toggle}
        aria-label={playing ? 'Pause music' : 'Play music'}
        aria-pressed={playing}
        disabled={pending}
      >
        {/* Equalizer bars — animate only while playing */}
        <span className="music__bars" aria-hidden="true">
          <span /><span /><span /><span />
        </span>
      </button>
    </div>
  )
}
