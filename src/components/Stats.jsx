import React from 'react'
import { useReveal } from '../hooks/useReveal'
import './Stats.css'

const STATS = [
  { value: '4+',   label: 'Years Licensed' },
  { value: 'USN',  label: 'Navy Veteran' },
  { value: 'ALL',  label: 'Hair Types' },
  { value: 'SD',   label: 'San Diego, CA' },
]

export default function Stats() {
  const ref = useReveal()

  return (
    <div className="stats reveal" ref={ref}>
      {STATS.map((s, i) => (
        <div className="stats__item" key={s.label} style={{ '--i': i }}>
          <span className="stats__value">{s.value}</span>
          <span className="stats__label">{s.label}</span>
        </div>
      ))}
    </div>
  )
}
