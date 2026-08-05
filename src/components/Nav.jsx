import React, { useState, useEffect } from 'react'
import { lockScroll, unlockScroll } from '../utils/scrollLock'
import './Nav.css'

const LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Cutz', href: '#picks' },
  { label: 'Prices', href: '#prices' },
  { label: 'About', href: '#about' },
]

export default function Nav() {
  const [active, setActive] = useState('home')
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    // Small delay ensures sections are in the DOM after intro unmounts
    const timer = setTimeout(() => {
      const sections = document.querySelectorAll('section[id]')
      const observer = new IntersectionObserver(
        entries => entries.forEach(e => e.isIntersecting && setActive(e.target.id)),
        { threshold: 0.3 }
      )
      sections.forEach(s => observer.observe(s))
      return () => observer.disconnect()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!open) return
    lockScroll()
    return unlockScroll
  }, [open])

  return (
    <>
      <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
        <a href="#home" className="nav__brand" onClick={() => setOpen(false)}>
          <div className="nav__badge">
            <div className="nav__badge-pole" />
          </div>
          <span className="nav__brand-name">NOMADIC</span>
        </a>

        <div className="nav__links">
          {LINKS.map(l => (
            <a
              key={l.label}
              href={l.href}
              className={`nav__link${active === l.href.slice(1) ? ' nav__link--active' : ''}`}
            >
              {l.label}
            </a>
          ))}
          <a href="#booking" className="btn-gold nav__cta">Book Now</a>
        </div>

        <button
          className={`nav__hamburger${open ? ' nav__hamburger--open' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Rendered outside <nav> — backdrop-filter on .nav--scrolled would
          otherwise become the containing block for this fixed element. */}
      <div className={`nav__mobile${open ? ' nav__mobile--open' : ''}`}>
        {LINKS.map(l => (
          <a
            key={l.label}
            href={l.href}
            className="nav__mobile-link"
            onClick={() => setOpen(false)}
          >
            {l.label}
          </a>
        ))}
        <a href="#booking" className="btn-gold nav__mobile-cta" onClick={() => setOpen(false)}>
          Book Now
        </a>
      </div>
    </>
  )
}
