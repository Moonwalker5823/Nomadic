/**
 * Booking delivery.
 *
 * This is a static site with no backend, so a submitted form cannot be
 * "sent" on its own. Instead we compose the request and hand it to the
 * visitor's own SMS or email client, addressed to Kevin. The visitor
 * taps send, and it arrives from their real number/address — which also
 * gives Kevin a thread to reply in.
 */

export const KEVIN_PHONE = '8049291680'
export const KEVIN_PHONE_DISPLAY = '(804) 929-1680'
export const SQUIRE_URL =
  'https://getsquire.com/booking/book/nomadic-barbering-san-diego/barber/kevin-j-18/services'

/** Human-readable booking summary used for both SMS and email bodies. */
export function formatBooking(f) {
  const lines = [
    'NOMADIC — Booking Request',
    '',
    `Name: ${f.name}`,
    `Phone: ${f.phone}`,
    `Service: ${f.service}`,
    `Preferred: ${formatDate(f.date)} at ${formatTime(f.time)}`,
  ]
  if (f.address?.trim()) lines.push(`Address: ${f.address.trim()}`)
  if (f.notes?.trim()) lines.push(`Notes: ${f.notes.trim()}`)
  return lines.join('\n')
}

function formatDate(d) {
  if (!d) return '—'
  // Parse as local time; `new Date('2026-08-05')` would shift by timezone.
  const [y, m, day] = d.split('-').map(Number)
  return new Date(y, m - 1, day).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatTime(t) {
  if (!t) return '—'
  const [h, min] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(min).padStart(2, '0')} ${period}`
}

/** iOS wants `&body=`, everything else wants `?body=`. */
export function smsHref(body) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const sep = isIOS ? '&' : '?'
  return `sms:${KEVIN_PHONE}${sep}body=${encodeURIComponent(body)}`
}

export function mailtoHref(body, name) {
  const subject = `Booking Request — ${name || 'New Client'}`
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
