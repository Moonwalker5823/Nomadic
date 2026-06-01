import React, { useState, useEffect, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import './Picks.css'

export default function Picks() {
  const { gallery } = useApp()
  const [lightbox, setLightbox] = useState(null) // index or null

  const close = useCallback(() => setLightbox(null), [])
  const prev = useCallback(() => setLightbox(i => (i - 1 + gallery.length) % gallery.length), [gallery.length])
  const next = useCallback(() => setLightbox(i => (i + 1) % gallery.length), [gallery.length])

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    document.body.classList.add('no-scroll')
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('no-scroll')
    }
  }, [lightbox, close, prev, next])

  return (
    <section className="picks" id="picks">
      <h2 className="section-heading">THE CUTZ</h2>
      <div className="section-rule" />

      <div className="picks__grid">
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
