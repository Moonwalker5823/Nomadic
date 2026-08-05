/**
 * Original West Coast / Latin hip hop loop, synthesized with the Web Audio API.
 *
 * Written from scratch rather than shipping an audio file: no licensing to
 * clear, nothing extra to download, and it loops forever without a seam.
 *
 * Structure — 8 bars at 96 BPM, A minor:
 *   harmony  Am - G - F - E, the Andalusian cadence. The E major against an
 *            A minor key puts a G# where the ear expects G, and that raised
 *            third is the Spanish/Latin colour the whole track leans on.
 *   guitar   nylon-string style plucks, the lead voice
 *   perc     3-2 son clave, congas, shaker over a boom-bap kick and snare
 *   bass     syncopated figure with octave jumps
 */

const BPM = 96
const BEAT = 60 / BPM
const BAR = BEAT * 4
const BARS = 8
const LOOP = BAR * BARS

// Andalusian cadence — one chord per two bars.
const PROGRESSION = [
  { root: 110.00, notes: [220.00, 261.63, 329.63, 440.00] }, // Am
  { root: 98.00,  notes: [196.00, 246.94, 293.66, 392.00] }, // G
  { root: 87.31,  notes: [174.61, 220.00, 261.63, 349.23] }, // F
  { root: 82.41,  notes: [164.81, 207.65, 246.94, 329.63] }, // E  (G# = the flavour)
]

/* Guitar phrases — [beat offset in the 2-bar block, Hz, length in beats].
   A Phrygian dominant (A Bb C# D E F G) over the E, natural minor elsewhere. */
const GUITAR = [
  [[0, 440.00, 0.7], [0.75, 523.25, 0.5], [1.5, 659.25, 0.9], [3, 587.33, 0.6],
   [4.5, 523.25, 0.7], [5.25, 440.00, 0.5], [6, 493.88, 1.2]],
  [[0, 392.00, 0.7], [1, 493.88, 0.5], [1.75, 587.33, 0.8], [3.5, 493.88, 0.6],
   [4, 392.00, 0.9], [5.5, 440.00, 0.6], [6.5, 493.88, 1.0]],
  [[0, 349.23, 0.8], [1.25, 440.00, 0.5], [2, 523.25, 0.9], [3.25, 440.00, 0.6],
   [4.5, 349.23, 0.7], [5.25, 415.30, 0.5], [6, 440.00, 1.1]],
  // Over the E: C# and F give the phrygian-dominant bite.
  [[0, 329.63, 0.7], [0.75, 415.30, 0.5], [1.5, 349.23, 0.6], [2.25, 329.63, 0.9],
   [4, 554.37, 0.8], [5, 493.88, 0.5], [5.75, 415.30, 0.6], [6.5, 329.63, 1.3]],
]

/* Syncopated bass figure — [beat offset, multiplier on root, length in beats]. */
const BASS_FIG = [
  [[0, 1, 0.9], [1.5, 1, 0.5], [2.25, 2, 0.5], [3, 1.5, 0.7], [4.5, 1, 0.8], [6, 2, 0.6], [6.75, 1, 0.9]],
  [[0, 1, 0.8], [0.75, 1, 0.5], [2, 1.5, 0.7], [3.5, 1, 0.6], [4, 2, 0.9], [5.5, 1, 0.7], [7, 1.5, 0.8]],
  [[0, 1, 0.9], [1.75, 2, 0.5], [2.5, 1, 0.7], [4, 1, 0.8], [5.25, 1.5, 0.6], [6, 2, 0.5], [6.5, 1, 1.0]],
  [[0, 1, 0.7], [1, 1.5, 0.6], [2, 2, 0.7], [3.25, 1, 0.6], [4.5, 1, 0.9], [6, 1.5, 0.6], [7, 2, 0.7]],
]

/* 3-2 son clave, in beats across two bars. */
const CLAVE = [0, 1.5, 3, 5, 6.5]

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

/* ── Drums ───────────────────────────────────────────────── */

function kick(audio, out, t) {
  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.frequency.setValueAtTime(165, t)
  osc.frequency.exponentialRampToValueAtTime(48, t + 0.055)
  g.gain.setValueAtTime(1.5, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
  osc.connect(g).connect(out)
  osc.start(t); osc.stop(t + 0.32)

  // Click transient so it reads on phone speakers.
  const click = audio.createBufferSource()
  click.buffer = noiseBuffer(audio, 0.02)
  const cf = audio.createBiquadFilter()
  cf.type = 'highpass'; cf.frequency.value = 1200
  const cg = audio.createGain()
  cg.gain.setValueAtTime(0.35, t)
  cg.gain.exponentialRampToValueAtTime(0.001, t + 0.02)
  click.connect(cf).connect(cg).connect(out)
  click.start(t); click.stop(t + 0.03)

  nodes.push(osc, click)
}

function snare(audio, out, t, ghost = false) {
  const lvl = ghost ? 0.16 : 0.62
  const src = audio.createBufferSource()
  src.buffer = noiseBuffer(audio, 0.22)
  const bp = audio.createBiquadFilter()
  bp.type = 'bandpass'; bp.frequency.value = 2100; bp.Q.value = 0.6
  const g = audio.createGain()
  g.gain.setValueAtTime(lvl, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + (ghost ? 0.07 : 0.19))
  src.connect(bp).connect(g).connect(out)
  src.start(t); src.stop(t + 0.24)

  const body = audio.createOscillator()
  const bg = audio.createGain()
  body.type = 'triangle'
  body.frequency.setValueAtTime(210, t)
  body.frequency.exponentialRampToValueAtTime(150, t + 0.08)
  bg.gain.setValueAtTime(lvl * 0.5, t)
  bg.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
  body.connect(bg).connect(out)
  body.start(t); body.stop(t + 0.12)

  nodes.push(src, body)
}

function shaker(audio, out, t, accent = false) {
  const src = audio.createBufferSource()
  src.buffer = noiseBuffer(audio, 0.06)
  const hp = audio.createBiquadFilter()
  hp.type = 'highpass'; hp.frequency.value = 6500
  const g = audio.createGain()
  g.gain.setValueAtTime(accent ? 0.11 : 0.055, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
  src.connect(hp).connect(g).connect(out)
  src.start(t); src.stop(t + 0.07)
  nodes.push(src)
}

/** Woodblock-ish clave — short, hard, high. */
function clave(audio, out, t) {
  const osc = audio.createOscillator()
  osc.type = 'square'
  osc.frequency.setValueAtTime(2400, t)
  const bp = audio.createBiquadFilter()
  bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 12
  const g = audio.createGain()
  g.gain.setValueAtTime(0.18, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.045)
  osc.connect(bp).connect(g).connect(out)
  osc.start(t); osc.stop(t + 0.06)
  nodes.push(osc)
}

/** Conga — pitched membrane hit. */
function conga(audio, out, t, freq = 220) {
  const osc = audio.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq * 1.6, t)
  osc.frequency.exponentialRampToValueAtTime(freq, t + 0.045)
  const g = audio.createGain()
  g.gain.setValueAtTime(0.34, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
  osc.connect(g).connect(out)
  osc.start(t); osc.stop(t + 0.22)

  const skin = audio.createBufferSource()
  skin.buffer = noiseBuffer(audio, 0.04)
  const sf = audio.createBiquadFilter()
  sf.type = 'bandpass'; sf.frequency.value = freq * 4; sf.Q.value = 2
  const sg = audio.createGain()
  sg.gain.setValueAtTime(0.14, t)
  sg.gain.exponentialRampToValueAtTime(0.001, t + 0.04)
  skin.connect(sf).connect(sg).connect(out)
  skin.start(t); skin.stop(t + 0.05)

  nodes.push(osc, skin)
}

/* ── Pitched voices ──────────────────────────────────────── */

/** Nylon-string style pluck: bright attack, fast decay, body resonance. */
function guitar(audio, out, t, freq, dur) {
  const g = audio.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.2, t + 0.008)   // hard pluck attack
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)

  const body = audio.createBiquadFilter()
  body.type = 'bandpass'
  body.frequency.value = freq * 2.2
  body.Q.value = 1.4
  body.connect(g).connect(out)

  // Sawtooth gives the string its bite; the filter shapes it into wood.
  const osc = audio.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(freq, t)
  osc.connect(body)
  osc.start(t); osc.stop(t + dur)

  // Quiet sub adds the fundamental back under the bandpass.
  const sub = audio.createOscillator()
  const sg = audio.createGain()
  sub.type = 'triangle'
  sub.frequency.setValueAtTime(freq, t)
  sg.gain.setValueAtTime(0.09, t)
  sg.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.8)
  sub.connect(sg).connect(out)
  sub.start(t); sub.stop(t + dur)

  nodes.push(osc, sub)
}

/** Rhodes-ish chord stab. */
function chord(audio, out, t, freqs, dur) {
  const lp = audio.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(2600, t)
  lp.frequency.exponentialRampToValueAtTime(900, t + dur)
  lp.Q.value = 0.7

  const g = audio.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.1, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  lp.connect(g).connect(out)

  freqs.forEach((f, i) => {
    const osc = audio.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(f * (1 + (i - 1.5) * 0.0012), t)
    osc.connect(lp)
    osc.start(t); osc.stop(t + dur)
    nodes.push(osc)
  })
}

function bass(audio, out, t, freq, dur) {
  const osc = audio.createOscillator()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(freq * 0.96, t)
  osc.frequency.linearRampToValueAtTime(freq, t + 0.05)
  const lp = audio.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(2200, t)
  lp.frequency.exponentialRampToValueAtTime(500, t + dur)
  const g = audio.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.5, t + 0.03)
  g.gain.setValueAtTime(0.5, t + dur * 0.62)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  osc.connect(lp).connect(g).connect(out)
  osc.start(t); osc.stop(t + dur)
  nodes.push(osc)
}

/* ── Arrangement ─────────────────────────────────────────── */

function scheduleLoop(audio, out, startAt) {
  for (let bar = 0; bar < BARS; bar++) {
    const b0 = startAt + bar * BAR

    // Harmony, guitar and bass move in 2-bar blocks with the chord.
    if (bar % 2 === 0) {
      const idx = (bar / 2) % PROGRESSION.length
      const ch = PROGRESSION[idx]

      // Off-beat stabs rather than a sustained pad.
      ;[0, 1.5, 3.25, 4, 5.5, 7.25].forEach(o =>
        chord(audio, out, b0 + o * BEAT, ch.notes, BEAT * 0.8))

      GUITAR[idx].forEach(([o, f, len]) =>
        guitar(audio, out, b0 + o * BEAT, f, len * BEAT))

      BASS_FIG[idx].forEach(([o, deg, len]) =>
        bass(audio, out, b0 + o * BEAT, ch.root * deg, len * BEAT))

      CLAVE.forEach(o => clave(audio, out, b0 + o * BEAT))
    }

    // Boom-bap foundation.
    kick(audio, out, b0)
    kick(audio, out, b0 + BEAT * 0.75)
    kick(audio, out, b0 + BEAT * 2.5)
    if (bar % 2 === 1) kick(audio, out, b0 + BEAT * 3.5)

    snare(audio, out, b0 + BEAT)
    snare(audio, out, b0 + BEAT * 3)
    snare(audio, out, b0 + BEAT * 2.75, true)              // ghost
    if (bar % 4 === 3) snare(audio, out, b0 + BEAT * 3.5)

    // Congas answer the backbeat.
    conga(audio, out, b0 + BEAT * 1.75, 196)
    conga(audio, out, b0 + BEAT * 2.25, 262)
    if (bar % 2 === 1) conga(audio, out, b0 + BEAT * 3.75, 165)

    // Shaker on sixteenths, accented on the beat.
    for (let e = 0; e < 16; e++) {
      const swing = e % 2 === 1 ? BEAT * 0.04 : 0
      shaker(audio, out, b0 + e * (BEAT / 4) + swing, e % 4 === 0)
    }
  }
}

/* ── Public API ──────────────────────────────────────────── */

export function isPlaying() {
  return running
}

/**
 * Start the loop. Resolves true once audio is actually running; false if the
 * browser is still blocking playback (caller should retry from a gesture).
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
  master.gain.linearRampToValueAtTime(volume * 0.42, audio.currentTime + 1.2)

  // Keeps the mix glued and stops the boosted kick from clipping.
  const glue = audio.createDynamicsCompressor()
  glue.threshold.value = -14
  glue.ratio.value = 4
  glue.attack.value = 0.005
  glue.release.value = 0.18

  // Light high cut only — enough warmth to read as lo-fi, not muffled.
  const tone = audio.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 9500

  tone.connect(glue).connect(master).connect(audio.destination)

  // Vinyl crackle bed, looping independently of the musical grid.
  const crackle = audio.createBufferSource()
  crackle.buffer = noiseBuffer(audio, 4)
  crackle.loop = true
  const crackleHp = audio.createBiquadFilter()
  crackleHp.type = 'highpass'; crackleHp.frequency.value = 3500
  const crackleGain = audio.createGain()
  crackleGain.gain.value = 0.008
  crackle.connect(crackleHp).connect(crackleGain).connect(master)
  crackle.start()
  nodes.push(crackle)

  running = true

  // Keep roughly a loop and a half queued ahead of the playhead.
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
    master.gain.linearRampToValueAtTime(0, t + 0.4)  // fade, don't cut
  }
  const toKill = nodes
  nodes = []
  setTimeout(() => {
    toKill.forEach(n => { try { n.stop() } catch { /* already stopped */ } })
  }, 500)
}

export function setVolume(v) {
  if (master && ctx) {
    master.gain.linearRampToValueAtTime(v * 0.42, ctx.currentTime + 0.2)
  }
}
