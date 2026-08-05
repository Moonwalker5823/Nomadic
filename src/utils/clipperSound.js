/**
 * Hair-clipper sound for the intro.
 *
 * Uses a real recording (public/clippers.mp3, Freesound Community / CC0)
 * rather than synthesis — a genuine motor has a rasp that oscillators
 * don't reproduce convincingly.
 */

const SRC = '/clippers.mp3'
const VOLUME = 0.55
const FADE_MS = 320

let el = null

function getEl() {
  if (typeof Audio === 'undefined') return null
  if (!el) {
    el = new Audio(SRC)
    el.preload = 'auto'
    // The clip is shorter than some intro timings; loop so the buzz
    // lasts as long as the cut does.
    el.loop = true
  }
  return el
}

/** Warm the file up so the first play doesn't stutter. */
export function preloadClippers() {
  const a = getEl()
  if (a) { try { a.load() } catch { /* nothing to do */ } }
}

function fadeOut(audio, ms) {
  const steps = 12
  const startVol = audio.volume
  let i = 0
  const timer = setInterval(() => {
    i++
    audio.volume = Math.max(0, startVol * (1 - i / steps))
    if (i >= steps) {
      clearInterval(timer)
      audio.pause()
      audio.currentTime = 0
      audio.volume = startVol
    }
  }, ms / steps)
  return timer
}

/**
 * Play the clipper for `duration` seconds.
 *
 * Returns a stop() function, or null if the browser blocked playback.
 * The null matters: callers keep listening for a real user gesture
 * instead of marking the sound as already played.
 */
export async function playClippers(duration = 3) {
  const audio = getEl()
  if (!audio) return null

  audio.currentTime = 0
  audio.volume = VOLUME

  try {
    await audio.play()
  } catch {
    return null // autoplay blocked — caller should retry after a gesture
  }

  // Fade and stop at the end of the cut.
  let fadeTimer = null
  const endTimer = setTimeout(() => {
    fadeTimer = fadeOut(audio, FADE_MS)
  }, Math.max(0, duration * 1000 - FADE_MS))

  return function stop() {
    clearTimeout(endTimer)
    if (fadeTimer) clearInterval(fadeTimer)
    fadeOut(audio, 140)
  }
}
