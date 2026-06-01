import React from 'react'
import './Hero.css'

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero__content">
        <div className="hero__eyebrow">Est. Your City</div>
        <h1 className="hero__h1">
          <span className="hero__h1-white">SHARP CUTS.</span>
          <span className="hero__h1-gold">YOUR BARBER.</span>
        </h1>
        <p className="hero__sub">Kevin Jones &mdash; Master Barber &bull; The Cutt'n Edge, San Diego</p>
        <div className="hero__btns">
          <a href="#booking" className="btn-gold">Book a Cut</a>
          <a href="#picks" className="btn-outline">See My Work</a>
        </div>
      </div>

      {/* Logo badge — right side */}
      <div className="hero__logo-wrap">
        <img src="Pics/logo.jpg" alt="NOMADIC" className="hero__logo" />
      </div>
    </section>
  )
}
