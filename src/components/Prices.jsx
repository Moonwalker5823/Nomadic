import React from 'react'
import { useApp } from '../context/AppContext'
import './Prices.css'

export default function Prices() {
  const { services } = useApp()

  return (
    <section className="prices" id="prices">
      <h2 className="section-heading">THE MENU</h2>
      <p className="prices__sub">Premium Cuts. No Shop Needed.</p>
      <div className="section-rule" />

      <div className="prices__grid">
        {services.map(s => (
          <div key={s.id} className="prices__card">
            <div className="prices__card-inner">
              <div className="prices__name-wrap">
                <span className="prices__name">{s.name}</span>
                {s.duration && <span className="prices__duration">{s.duration}</span>}
              </div>
              <span className="prices__price">${s.price}</span>
            </div>
            <div className="prices__card-bar" />
          </div>
        ))}
      </div>

      <p className="prices__note">* Travel fee may apply based on location</p>
    </section>
  )
}
