/**
 * Background music.
 *
 * Uses a real produced track (public/track.mp3 — Bombinsound, Pixabay
 * license, free for commercial use) rather than synthesis.
 *
 * The element is routed through a GainNode so the level can be trimmed
 * independently of the file, and so a fade replaces an abrupt cut.
 */

const SRC = '/track.mp3'
const LEVEL = 0.34      // background bed, not a foreground listen
const FADE_IN = 1.6
const FADE_OUT = 0.6

let el = null
let ctx = null
let gainNode = null
let running = false

function getEl() {
  if (typeof Audio === 'undefined') return null
  if (!el) {
    el = new Audio(SRC)
    el.preload = 'auto'
    el.loop = true
  }
  return el
}

/**
 * Build the amplification graph once. Connecting a media element to a Web
 * Audio context reroutes its output through the graph, so this may only
 * happen a single time per element.
 */
async function ensureGraph(audio) {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return false
  if (!ctx) ctx = new AC()
  if (ctx.state === 'suspended') {
    // resume() never settles on a blocked context — it waits for a gesture
    // rather than rejecting. Race it so callers can't hang.
    await Promise.race([
      ctx.resume().catch(() => {}),
      new Promise(r => setTimeout(r, 200)),
    ])
  }
  if (ctx.state !== 'running') return false
  if (!gainNode) {
    const src = ctx.createMediaElementSource(audio)
    gainNode = ctx.createGain()
    gainNode.gain.value = 0
    src.connect(gainNode).connect(ctx.destination)
  }
  return true
}

export function isPlaying() {
  return running
}

/**
 * Start playback. Resolves true once audio is actually running; false if the
 * browser is still blocking it (caller should retry from a user gesture).
 */
export async function startTrack(volume = 1) {
  const audio = getEl()
  if (!audio) return false
  if (running) return true

  audio.volume = 1 // level is handled by the gain node

  // play() is the gate: unlike resume(), it rejects promptly when blocked.
  try {
    await audio.play()
  } catch {
    return false
  }

  running = true

  // Graph is optional — if it fails, the track still plays at file level.
  try {
    const ok = await ensureGraph(audio)
    if (ok && gainNode && ctx) {
      const t = ctx.currentTime
      gainNode.gain.cancelScheduledValues(t)
      gainNode.gain.setValueAtTime(0, t)
      gainNode.gain.linearRampToValueAtTime(LEVEL * volume, t + FADE_IN)
    }
  } catch {
    audio.volume = LEVEL * volume
  }

  return true
}

export function stopTrack() {
  if (!running) return
  running = false

  const audio = el
  if (gainNode && ctx) {
    const t = ctx.currentTime
    gainNode.gain.cancelScheduledValues(t)
    gainNode.gain.setValueAtTime(gainNode.gain.value, t)
    gainNode.gain.linearRampToValueAtTime(0.0001, t + FADE_OUT)
    setTimeout(() => { if (audio && !running) audio.pause() }, FADE_OUT * 1000)
  } else if (audio) {
    audio.pause()
  }
}

export function setVolume(v) {
  if (gainNode && ctx) {
    gainNode.gain.linearRampToValueAtTime(LEVEL * v, ctx.currentTime + 0.2)
  } else if (el) {
    el.volume = LEVEL * v
  }
}
