import React, { useState, useEffect, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { useReveal } from '../hooks/useReveal'
import { lockScroll, unlockScroll } from '../utils/scrollLock'
import './Picks.css'

export default function Picks() {
  const { gallery } = useApp()
  const [lightbox, setLightbox] = useState(null) // index or null
  const headRef = useReveal()
  const gridRef = useReveal()

  const close = useCallback(() => setLightbox(null), [])
  const prev = useCallback(() => setLightbox(i => (i - 1 + gallery.length) % gallery.length), [gallery.length])
  const next = useCallback(() => setLightbox(i => (i + 1) % gallery.length), [gallery.length])

  const isOpen = lightbox !== null

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close, prev, next])

  // Keyed on open/closed only, so arrow navigation doesn't churn the lock.
  useEffect(() => {
    if (!isOpen) return
    lockScroll()
    return unlockScroll
  }, [isOpen])

  return (
    <section className="picks" id="picks">
      <div className="reveal" ref={headRef}>
        <h2 className="section-heading">THE CUTZ</h2>
        <div className="section-rule" />
      </div>

      <div className="picks__grid reveal" ref={gridRef}>
        {gallery.map((src, i) => (
          <div key={src + i} className="picks__card" onClick={() => setLightbox(i)}>
            <img src={src} alt={`Cut ${i + 1}`} loading="lazy" />
            <div className="picks__overlay">
              <span>View</span>
            </div>
          </div>
        ))}
      </div>

      {lightbox !== null && (
        <div className="lightbox" onClick={close}>
          <button className="lightbox__close" onClick={close}>✕</button>
          <button className="lightbox__arrow lightbox__arrow--left" onClick={e => { e.stopPropagation(); prev() }}>‹</button>
          <img
            src={gallery[lightbox]}
            alt="Cut"
            className="lightbox__img"
            onClick={e => e.stopPropagation()}
          />
          <button className="lightbox__arrow lightbox__arrow--right" onClick={e => { e.stopPropagation(); next() }}>›</button>
          <div className="lightbox__counter">{lightbox + 1} / {gallery.length}</div>
        </div>
      )}
    </section>
  )
}
