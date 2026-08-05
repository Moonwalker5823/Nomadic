/**
 * Hair-clipper sound for the intro.
 *
 * Uses a real recording (public/clippers.mp3, Freesound Community / CC0)
 * rather than synthesis — a genuine motor has a rasp that oscillators
 * don't reproduce convincingly.
 */

const SRC = '/clippers.mp3'
/** The source recording is very quiet (~0.009 RMS, roughly 15x below a
 *  normal level), and HTMLAudioElement.volume caps at 1. So the element is
 *  routed through a GainNode, which can amplify past unity. */
const GAIN = 11
const FADE_MS = 320

let el = null
let ctx = null
let gainNode = null

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

/**
 * Build the amplification graph once. Connecting a media element to a
 * Web Audio context reroutes its output through the graph, so this must
 * happen exactly once per element.
 */
async function ensureGraph(audio) {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return false
  if (!ctx) ctx = new AC()
  if (ctx.state === 'suspended') {
    // resume() on a blocked context never settles — it waits indefinitely
    // for a gesture rather than rejecting. Race it so we can't hang.
    await Promise.race([
      ctx.resume().catch(() => {}),
      new Promise(r => setTimeout(r, 200)),
    ])
  }
  if (ctx.state !== 'running') return false
  if (!gainNode) {
    const src = ctx.createMediaElementSource(audio)
    gainNode = ctx.createGain()
    gainNode.gain.value = GAIN
    // Catches peaks the boost might push past 0 dBFS.
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -3
    limiter.ratio.value = 12
    limiter.attack.value = 0.003
    src.connect(gainNode).connect(limiter).connect(ctx.destination)
  }
  return true
}

function fadeOut(ms) {
  // Ramp the gain when the graph exists, but the element must be paused
  // either way — bailing early here left the clipper buzzing into the
  // home page whenever the graph had not been built.
  if (gainNode && ctx) {
    const t = ctx.currentTime
    gainNode.gain.cancelScheduledValues(t)
    gainNode.gain.setValueAtTime(gainNode.gain.value, t)
    gainNode.gain.linearRampToValueAtTime(0.0001, t + ms / 1000)
  }
  return setTimeout(() => {
    if (el) { el.pause(); el.currentTime = 0 }
    if (gainNode && ctx) gainNode.gain.setValueAtTime(GAIN, ctx.currentTime)
  }, ms)
}

/**
 * Hard stop, safe to call at any time. Used when leaving the intro, where
 * the per-play stop() handle may not exist yet — playClippers resolves
 * asynchronously, so a fast Enter click can beat it.
 */
export function stopClippers() {
  if (gainNode && ctx) {
    const t = ctx.currentTime
    gainNode.gain.cancelScheduledValues(t)
    gainNode.gain.setValueAtTime(0.0001, t)
  }
  if (el) { el.pause(); el.currentTime = 0 }
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
  audio.volume = 1 // level is handled by the gain node

  // play() is the gate: unlike resume(), it rejects promptly when blocked.
  try {
    await audio.play()
  } catch {
    return null // caller should retry after a gesture
  }

  // Playback started, so a gesture exists and the graph can be built safely.
  await ensureGraph(audio)
  if (gainNode && ctx) gainNode.gain.setValueAtTime(GAIN, ctx.currentTime)

  // Fade and stop at the end of the cut.
  let fadeTimer = null
  const endTimer = setTimeout(() => {
    fadeTimer = fadeOut(FADE_MS)
  }, Math.max(0, duration * 1000 - FADE_MS))

  return function stop() {
    clearTimeout(endTimer)
    if (fadeTimer) clearTimeout(fadeTimer)
    fadeOut(140)
  }
}
