import React from 'react'
import { useApp } from '../context/AppContext'
import { useReveal } from '../hooks/useReveal'
import './Prices.css'

export default function Prices() {
  const { services } = useApp()
  const headRef = useReveal()
  const gridRef = useReveal()

  return (
    <section className="prices" id="prices">
      <div className="reveal" ref={headRef}>
        <h2 className="section-heading">THE MENU</h2>
        <p className="prices__sub">Premium Cuts. Precision Work.</p>
        <div className="section-rule" />
      </div>

      <div className="prices__grid reveal" ref={gridRef}>
        {services.map((s, i) => (
          <div key={s.id} className="prices__card" style={{ '--i': i }}>
            <span className="prices__num">{String(i + 1).padStart(2, '0')}</span>
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

      <p className="prices__note">Walk-ins welcome &mdash; appointments preferred</p>
    </section>
  )
}
