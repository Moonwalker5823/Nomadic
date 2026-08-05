/**
 * Original lo-fi hip hop loop, synthesized with the Web Audio API.
 *
 * Written from scratch rather than shipping an audio file: no licensing
 * to clear, nothing extra to download, and it loops forever without a seam.
 *
 * Structure — 8 bars at 94 BPM in A minor:
 *   drums   dusty kick / soft snare / swung closed hats
 *   chords  Am9 - Dm7 - Fmaj7 - E7sus, soulful turnaround voicing
 *   melody  sparse A-minor-pentatonic motif over the changes
 *   bass    root notes with a little slide
 *   vinyl   continuous crackle + light hiss for the tape feel
 */

const BPM = 94
const BEAT = 60 / BPM
const BAR = BEAT * 4
const BARS = 8
const LOOP = BAR * BARS

// Chord voicings (Hz). One per two bars.
const PROGRESSION = [
  { root: 55.00,  notes: [261.63, 329.63, 440.00, 493.88] }, // Am9
  { root: 73.42,  notes: [293.66, 349.23, 440.00, 523.25] }, // Dm7
  { root: 87.31,  notes: [261.63, 349.23, 440.00, 523.25] }, // Fmaj7
  { root: 82.41,  notes: [246.94, 329.63, 440.00, 493.88] }, // E7sus
]

/* Sparse motif — [beat offset within the 2-bar block, Hz, length in beats].
   A minor pentatonic (A C D E G), left deliberately airy. */
const MOTIF = [
  [[0.0, 880.00, 1.2], [1.5, 1046.50, 0.8], [2.5, 987.77, 1.6], [5.0, 783.99, 1.4]],
  [[0.5, 698.46, 1.0], [2.0, 880.00, 1.4], [4.5, 1046.50, 1.8]],
  [[0.0, 1046.50, 1.4], [2.0, 987.77, 0.9], [3.0, 880.00, 2.0], [6.0, 698.46, 1.2]],
  [[1.0, 987.77, 1.0], [2.5, 880.00, 1.2], [4.0, 659.25, 2.4]],
]

let ctx = null
let master = null
let nodes = []
let loopTimer = null
let running = false

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

function noiseBuffer(audio, seconds) {
  const buf = audio.createBuffer(1, Math.ceil(audio.sampleRate * seconds), audio.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return buf
}

/* ── Instruments ─────────────────────────────────────────── */

function kick(audio, out, t) {
  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.frequency.setValueAtTime(120, t)
  osc.frequency.exponentialRampToValueAtTime(42, t + 0.09)
  g.gain.setValueAtTime(0.9, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.34)
  osc.connect(g).connect(out)
  osc.start(t); osc.stop(t + 0.36)
  nodes.push(osc)
}

function snare(audio, out, t) {
  const src = audio.createBufferSource()
  src.buffer = noiseBuffer(audio, 0.2)
  const bp = audio.createBiquadFilter()
  bp.type = 'bandpass'; bp.frequency.value = 1750; bp.Q.value = 0.8
  const g = audio.createGain()
  g.gain.setValueAtTime(0.34, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.16)
  src.connect(bp).connect(g).connect(out)
  src.start(t); src.stop(t + 0.2)
  nodes.push(src)
}

function hat(audio, out, t, open = false) {
  const src = audio.createBufferSource()
  src.buffer = noiseBuffer(audio, open ? 0.16 : 0.05)
  const hp = audio.createBiquadFilter()
  hp.type = 'highpass'; hp.frequency.value = 7600
  const g = audio.createGain()
  g.gain.setValueAtTime(open ? 0.12 : 0.075, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + (open ? 0.15 : 0.045))
  src.connect(hp).connect(g).connect(out)
  src.start(t); src.stop(t + 0.17)
  nodes.push(src)
}

/** Soft electric-piano-ish stack: triangle bodies under a lowpass. */
function chord(audio, out, t, freqs, dur) {
  const lp = audio.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(1500, t)
  lp.frequency.linearRampToValueAtTime(950, t + dur)
  lp.Q.value = 0.6

  const g = audio.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.075, t + 0.12)   // gentle swell
  g.gain.setValueAtTime(0.075, t + dur * 0.65)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  lp.connect(g).connect(out)

  freqs.forEach((f, i) => {
    const osc = audio.createOscillator()
    osc.type = 'triangle'
    // A few cents of drift per voice keeps it from sounding sterile.
    osc.frequency.setValueAtTime(f * (1 + (i - 1.5) * 0.0013), t)
    osc.connect(lp)
    osc.start(t); osc.stop(t + dur)
    nodes.push(osc)
  })
}

/** Bell-ish lead for the motif — sine plus a quiet octave for sparkle. */
function lead(audio, out, t, freq, dur) {
  const g = audio.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.085, t + 0.03)     // soft mallet attack
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)

  const lp = audio.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 2600
  lp.connect(g).connect(out)

  const osc = audio.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, t)
  osc.connect(lp)
  osc.start(t); osc.stop(t + dur)

  const shimmer = audio.createOscillator()
  const sg = audio.createGain()
  shimmer.type = 'sine'
  shimmer.frequency.setValueAtTime(freq * 2, t)
  sg.gain.value = 0.22
  shimmer.connect(sg).connect(lp)
  shimmer.start(t); shimmer.stop(t + dur * 0.6)

  nodes.push(osc, shimmer)
}

function bass(audio, out, t, freq, dur) {
  const osc = audio.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq * 0.97, t)
  osc.frequency.linearRampToValueAtTime(freq, t + 0.06)  // slight slide in
  const g = audio.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.26, t + 0.04)
  g.gain.setValueAtTime(0.26, t + dur * 0.7)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  osc.connect(g).connect(out)
  osc.start(t); osc.stop(t + dur)
  nodes.push(osc)
}

/* ── Arrangement ─────────────────────────────────────────── */

function scheduleLoop(audio, out, startAt) {
  for (let bar = 0; bar < BARS; bar++) {
    const b0 = startAt + bar * BAR

    // Chords change every two bars.
    if (bar % 2 === 0) {
      const idx = (bar / 2) % PROGRESSION.length
      const ch = PROGRESSION[idx]
      chord(audio, out, b0, ch.notes, BAR * 2 - 0.12)
      bass(audio, out, b0, ch.root, BEAT * 1.6)
      bass(audio, out, b0 + BEAT * 2.5, ch.root, BEAT * 1.2)
      bass(audio, out, b0 + BAR + BEAT * 1.5, ch.root, BEAT * 0.9)

      // Motif rides the same 2-bar block as the chord.
      MOTIF[idx].forEach(([offset, freq, len]) => {
        lead(audio, out, b0 + offset * BEAT, freq, len * BEAT)
      })
    }

    // Busier boom-bap: syncopated pickups keep it moving instead of plodding.
    kick(audio, out, b0)
    kick(audio, out, b0 + BEAT * 0.75)
    kick(audio, out, b0 + BEAT * 2.5)
    if (bar % 2 === 1) kick(audio, out, b0 + BEAT * 3.5)

    // Backbeat, with a ghost note leading into bar ends.
    snare(audio, out, b0 + BEAT)
    snare(audio, out, b0 + BEAT * 3)
    if (bar % 4 === 3) snare(audio, out, b0 + BEAT * 3.5)

    // Swung sixteenths — twice the hat density of the old pattern, which is
    // most of what makes this feel upbeat rather than sleepy.
    for (let e = 0; e < 16; e++) {
      const swing = e % 2 === 1 ? BEAT * 0.045 : 0
      hat(audio, out, b0 + e * (BEAT / 4) + swing, e === 14 && bar % 4 === 3)
    }
  }
}

/* ── Public API ──────────────────────────────────────────── */

export function isPlaying() {
  return running
}

/**
 * Start the loop. Resolves to true once audio is actually running;
 * false if the browser is still blocking playback (caller should retry
 * from a user gesture).
 */
export async function startTrack(volume = 0.5) {
  const audio = getCtx()
  if (!audio) return false
  if (running) return true

  if (audio.state === 'suspended') {
    try { await audio.resume() } catch { /* still blocked */ }
  }
  if (audio.state !== 'running') return false

  master = audio.createGain()
  master.gain.setValueAtTime(0, audio.currentTime)
  master.gain.linearRampToValueAtTime(volume * 0.5, audio.currentTime + 1.5)

  // Gentle high cut — the "through a closed door" softness.
  const tone = audio.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 5200
  tone.connect(master).connect(audio.destination)

  // Vinyl crackle bed, looping independently of the musical grid.
  const crackle = audio.createBufferSource()
  crackle.buffer = noiseBuffer(audio, 4)
  crackle.loop = true
  const crackleHp = audio.createBiquadFilter()
  crackleHp.type = 'highpass'; crackleHp.frequency.value = 3000
  const crackleGain = audio.createGain()
  crackleGain.gain.value = 0.014
  crackle.connect(crackleHp).connect(crackleGain).connect(master)
  crackle.start()
  nodes.push(crackle)

  running = true

  // Schedule the current loop plus the next one, then keep topping up.
  let nextAt = audio.currentTime + 0.15
  const pump = () => {
    if (!running) return
    while (nextAt < audio.currentTime + LOOP * 1.5) {
      scheduleLoop(audio, tone, nextAt)
      nextAt += LOOP
    }
  }
  pump()
  loopTimer = setInterval(pump, (LOOP * 1000) / 2)

  return true
}

export function stopTrack() {
  if (!running) return
  running = false
  clearInterval(loopTimer)
  loopTimer = null

  const audio = ctx
  if (master && audio) {
    const t = audio.currentTime
    master.gain.cancelScheduledValues(t)
    master.gain.setValueAtTime(master.gain.value, t)
    master.gain.linearRampToValueAtTime(0, t + 0.5)  // fade, don't cut
  }
  const toKill = nodes
  nodes = []
  setTimeout(() => {
    toKill.forEach(n => { try { n.stop() } catch { /* already stopped */ } })
  }, 600)
}

export function setVolume(v) {
  if (master && ctx) {
    master.gain.linearRampToValueAtTime(v * 0.5, ctx.currentTime + 0.2)
  }
}
