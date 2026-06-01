import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import './Admin.css'

const TABS = ['Services', 'About', 'Gallery', 'Bookings']

export default function Admin({ onClose }) {
  const [tab, setTab] = useState('Services')
  const { services, saveServices, bio, saveBio, gallery, saveGallery, bookings, updateBooking, clearBookings } = useApp()

  return (
    <div className="admin" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin__panel">
        <div className="admin__header">
          <span className="admin__title">ADMIN PANEL</span>
          <button className="admin__close" onClick={onClose}>✕</button>
        </div>

        <div className="admin__tabs">
          {TABS.map(t => (
            <button key={t} className={`admin__tab${tab === t ? ' admin__tab--active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        <div className="admin__body">
          {tab === 'Services' && <ServicesTab services={services} saveServices={saveServices} />}
          {tab === 'About' && <AboutTab bio={bio} saveBio={saveBio} />}
          {tab === 'Gallery' && <GalleryTab gallery={gallery} saveGallery={saveGallery} />}
          {tab === 'Bookings' && <BookingsTab bookings={bookings} updateBooking={updateBooking} clearBookings={clearBookings} />}
        </div>
      </div>
    </div>
  )
}

/* ── Services ── */
function ServicesTab({ services, saveServices }) {
  const [list, setList] = useState(services.map(s => ({ ...s })))

  const update = (id, key, val) => setList(l => l.map(s => s.id === id ? { ...s, [key]: val } : s))
  const remove = (id) => setList(l => l.filter(s => s.id !== id))
  const add = () => setList(l => [...l, { id: Date.now(), name: '', price: 0 }])
  const save = () => saveServices(list)

  return (
    <div className="admin__section">
      <div className="admin__service-list">
        {list.map(s => (
          <div key={s.id} className="admin__service-row">
            <input
              className="admin__input"
              value={s.name}
              onChange={e => update(s.id, 'name', e.target.value)}
              placeholder="Service name"
            />
            <div className="admin__price-wrap">
              <span className="admin__dollar">$</span>
              <input
                className="admin__input admin__input--price"
                type="number"
                value={s.price}
                onChange={e => update(s.id, 'price', Number(e.target.value))}
              />
            </div>
            <button className="admin__del" onClick={() => remove(s.id)}>✕</button>
          </div>
        ))}
      </div>
      <div className="admin__actions">
        <button className="admin__btn-ghost" onClick={add}>+ Add Service</button>
        <button className="admin__btn-gold" onClick={save}>Save Changes</button>
      </div>
    </div>
  )
}

/* ── About ── */
function AboutTab({ bio, saveBio }) {
  const [text, setText] = useState(bio)
  return (
    <div className="admin__section">
      <label className="admin__label">Bio</label>
      <textarea className="admin__textarea" rows={8} value={text} onChange={e => setText(e.target.value)} />
      <div className="admin__actions">
        <button className="admin__btn-gold" onClick={() => saveBio(text)}>Save</button>
      </div>
    </div>
  )
}

/* ── Gallery ── */
function GalleryTab({ gallery, saveGallery }) {
  const [list, setList] = useState([...gallery])
  const [newUrl, setNewUrl] = useState('')

  const remove = (i) => setList(l => l.filter((_, idx) => idx !== i))
  const add = () => {
    if (!newUrl.trim()) return
    setList(l => [...l, newUrl.trim()])
    setNewUrl('')
  }
  const save = () => saveGallery(list)

  return (
    <div className="admin__section">
      <div className="admin__gallery-list">
        {list.map((src, i) => (
          <div key={src + i} className="admin__gallery-row">
            <img src={src} alt="" className="admin__gallery-thumb" onError={e => { e.target.style.opacity = 0.3 }} />
            <span className="admin__gallery-path">{src}</span>
            <button className="admin__del" onClick={() => remove(i)}>✕</button>
          </div>
        ))}
      </div>
      <div className="admin__add-row">
        <input
          className="admin__input"
          value={newUrl}
          onChange={e => setNewUrl(e.target.value)}
          placeholder="Pics/filename.jpg or https://..."
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <button className="admin__btn-ghost" onClick={add}>Add</button>
      </div>
      <div className="admin__actions">
        <button className="admin__btn-gold" onClick={save}>Save Gallery</button>
      </div>
    </div>
  )
}

/* ── Bookings ── */
const STATUS_COLORS = { Pending: '#D4AF37', Confirmed: '#22c55e', Cancelled: '#ef4444' }

function BookingsTab({ bookings, updateBooking, clearBookings }) {
  const handleClear = () => {
    if (window.confirm('Clear all booking requests? This cannot be undone.')) {
      clearBookings()
    }
  }

  if (!bookings.length) return (
    <div className="admin__section admin__empty">No booking requests yet.</div>
  )

  return (
    <div className="admin__section">
      <div className="admin__bookings-list">
        {bookings.map(b => (
          <div key={b.id} className="admin__booking-card">
            <div className="admin__booking-top">
              <span className="admin__booking-name">{b.name}</span>
              <select
                className="admin__status-sel"
                value={b.status}
                style={{ color: STATUS_COLORS[b.status] }}
                onChange={e => updateBooking(b.id, e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="admin__booking-details">
              <span>📞 {b.phone}</span>
              <span>✂️ {b.service}</span>
              <span>📅 {b.date} @ {b.time}</span>
              <span>📍 {b.address}</span>
              {b.notes && <span>💬 {b.notes}</span>}
            </div>
          </div>
        ))}
      </div>
      <div className="admin__actions">
        <button className="admin__btn-danger" onClick={handleClear}>Clear All Bookings</button>
      </div>
    </div>
  )
}
