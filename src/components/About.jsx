import React from 'react'
import { useApp } from '../context/AppContext'
import './About.css'

export default function About() {
  const { bio } = useApp()

  return (
    <section className="about" id="about">
      <h2 className="section-heading">THE BARBER</h2>
      <div className="section-rule" />

      <div className="about__grid">
        <div className="about__photo-wrap">
          <img
            src="Pics/kevin-jones.jpg"
            alt="Kevin Jones"
            className="about__photo"
          />
        </div>

        <div className="about__text">
          <p className="about__bio">{bio}</p>
          <div className="about__sep" />
          <div className="about__id">
            <span className="about__name">Kevin Jones</span>
            <span className="about__title">Master Barber &bull; The Cutt'n Edge &bull; San Diego, CA</span>
          </div>
          <div className="about__contact">
            <a href="https://www.instagram.com/theenomadicbarber" target="_blank" rel="noreferrer" className="about__contact-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="17.5" cy="6.5" r="1.2"/>
              </svg>
              @theenomadicbarber
            </a>
            <a href="tel:8049291680" className="about__contact-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.06 6.06l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              (804) 929-1680
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
