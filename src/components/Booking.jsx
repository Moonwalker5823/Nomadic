import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import './Booking.css'

export default function Booking() {
  const { services, addBooking } = useApp()
  const [form, setForm] = useState({
    name: '', phone: '', service: '', date: '', time: '', address: '', notes: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = true
    if (!form.phone.trim()) e.phone = true
    if (!form.service) e.service = true
    if (!form.date) e.date = true
    if (!form.time) e.time = true
    if (!form.address.trim()) e.address = true
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    addBooking(form)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section className="booking" id="booking">
        <h2 className="section-heading">BOOK YOUR CUT</h2>
        <div className="section-rule" />
        <div className="booking__success">
          <div className="booking__check">✓</div>
          <p className="booking__success-msg">Request sent! Kevin will confirm your appointment shortly.</p>
        </div>
      </section>
    )
  }

  const err = (k) => errors[k] ? 'booking__field--error' : ''

  return (
    <section className="booking" id="booking">
      <h2 className="section-heading">BOOK YOUR CUT</h2>
      <div className="section-rule" />

      <form className="booking__card" onSubmit={handleSubmit} noValidate>
        <div className="booking__row">
          <div className={`booking__field ${err('name')}`}>
            <label>Full Name</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" />
          </div>
          <div className={`booking__field ${err('phone')}`}>
            <label>Phone Number</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" />
          </div>
        </div>

        <div className={`booking__field ${err('service')}`}>
          <label>Service</label>
          <select value={form.service} onChange={e => set('service', e.target.value)}>
            <option value="">Select a service...</option>
            {services.map(s => (
              <option key={s.id} value={s.name}>{s.name} — ${s.price}</option>
            ))}
          </select>
        </div>

        <div className="booking__row">
          <div className={`booking__field ${err('date')}`}>
            <label>Preferred Date</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div className={`booking__field ${err('time')}`}>
            <label>Preferred Time</label>
            <input type="time" value={form.time} onChange={e => set('time', e.target.value)} />
          </div>
        </div>

        <div className={`booking__field ${err('address')}`}>
          <label>Your Address <span className="booking__optional">(for reference)</span></label>
          <textarea rows={3} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Your address or area" />
        </div>

        <div className="booking__field">
          <label>Notes <span className="booking__optional">(optional)</span></label>
          <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Anything else Kevin should know?" />
        </div>

        <button type="submit" className="btn-gold booking__submit">REQUEST BOOKING</button>
        <p className="booking__square-note">
          Prefer to book directly?{' '}
          <a href="https://getsquire.com/booking/book/nomadic-barbering-san-diego/barber/kevin-j-18/services" target="_blank" rel="noreferrer">
            Book on Square →
          </a>
        </p>
      </form>
    </section>
  )
}
