import React, { useState, useRef, useEffect } from 'react'
import './PasswordModal.css'

export default function PasswordModal({ onSuccess, onClose }) {
  const [val, setVal] = useState('')
  const [shake, setShake] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const submit = (e) => {
    e.preventDefault()
    if (val === 'nomadic2025') {
      onSuccess()
    } else {
      setShake(true)
      setVal('')
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="pwd-modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <form className={`pwd-modal__box${shake ? ' pwd-modal__box--shake' : ''}`} onSubmit={submit}>
        <span className="pwd-modal__label">ADMIN ACCESS</span>
        <input
          ref={inputRef}
          className="pwd-modal__input"
          type="password"
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder="Enter password"
        />
        <button className="btn-gold pwd-modal__btn" type="submit">ENTER</button>
      </form>
    </div>
  )
}
