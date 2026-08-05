import React from 'react'
import './Marquee.css'

const ITEMS = [
  'FADES', 'TAPERS', 'COMBOVERS', 'BEARD WORK',
  'LINE-UPS', 'ALL HAIR TYPES', 'NAVY VETERAN', 'SAN DIEGO',
]

/**
 * Scrolling signage band. The item list is rendered twice so the
 * translation can loop seamlessly at -50%.
 */
export default function Marquee({ reverse = false }) {
  const strip = ITEMS.map((item, i) => (
    <span className="marquee__item" key={i}>
      {item}
      <span className="marquee__star">✦</span>
    </span>
  ))

  return (
    <div className="marquee" aria-hidden="true">
      <div className={`marquee__track${reverse ? ' marquee__track--reverse' : ''}`}>
        {strip}
        {strip}
      </div>
    </div>
  )
}
