/**
 * Original boom-bap hip hop loop, synthesized with the Web Audio API.
 *
 * Written from scratch rather than shipping an audio file: no licensing to
 * clear, nothing extra to download, and it loops forever without a seam.
 *
 * Structure — 8 bars at 90 BPM in C minor:
 *   drums    hard kick, cracking snare on 2 and 4, swung hats, ghost notes
 *   piano    dark minor stabs, the hook
 *   strings  sustained pad underneath for weight
 *   sub      deep sine bass following the root
 *   vinyl    light crackle
 */

const BPM = 90
const BEAT = 60 / BPM
const BAR = BEAT * 4
const BARS = 8
const LOOP = BAR * BARS

/** Swing amount applied to off-beat eighths — the boom-bap shuffle. */
const SWING = BEAT * 0.055

// Cm - Ab - Eb - Gm. One chord per two bars.
const PROGRESSION = [
  { root: 65.41, notes: [261.63, 311.13, 392.00], top: 523.25 }, // Cm
  { root: 51.91, notes: [207.65, 261.63, 311.13], top: 415.30 }, // Ab
  { root: 77.78, notes: [311.13, 392.00, 466.16], top: 622.25 }, // Eb
  { root: 49.00, notes: [196.00, 233.08, 293.66], top: 392.00 }, // Gm
]

/** Piano hook — [beat offset in the 2-bar block, note index, length]. */
const HOOK = [
  [[0, 'top', 0.5], [0.66, 2, 0.4], [1.5, 1, 0.6], [2.5, 'top', 0.5], [3.33, 2, 0.9], [5, 1, 0.5], [6, 'top', 1.0]],
  [[0, 2, 0.5], [1, 'top', 0.45], [1.66, 1, 0.7], [3, 2, 0.6], [4.5, 'top', 0.5], [5.33, 1, 0.8], [6.5, 2, 0.9]],
  [[0, 'top', 0.6], [0.75, 1, 0.4], [2, 2, 0.7], [3.5, 'top', 0.5], [4, 1, 0.8], [5.66, 2, 0.5], [6.5, 'top', 1.1]],
  [[0, 1, 0.5], [1.33, 2, 0.5], [2, 'top', 0.8], [3.66, 1, 0.5], [4.5, 2, 0.7], [6, 'top', 0.6], [6.75, 1, 1.0]],
]

/** Sub bass figure — [beat offset, octave multiplier, length]. */
const SUB = [
  [[0, 1, 1.1], [1.75, 1, 0.5], [2.5, 2, 0.5], [4, 1, 1.2], [6, 1, 0.6], [6.75, 2, 0.7]],
  [[0, 1, 1.0], [1.5, 2, 0.5], [3, 1, 0.8], [4, 1, 1.1], [5.75, 1, 0.5], [6.5, 2, 0.8]],
  [[0, 1, 1.2], [2, 1, 0.6], [2.75, 2, 0.5], [4, 1, 1.0], [5.5, 1, 0.7], [7, 1, 0.8]],
  [[0, 1, 0.9], [1.25, 2, 0.5], [2.5, 1, 0.9], [4, 1, 1.2], [6.25, 1, 0.6], [7, 2, 0.7]],
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

/* ── Drums ───────────────────────────────────────────────── */

/** Deep kick with a click on top so it lands on phone speakers too. */
function kick(audio, out, t, hard = true) {
  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.frequency.setValueAtTime(180, t)
  osc.frequency.exponentialRampToValueAtTime(45, t + 0.05)
  g.gain.setValueAtTime(hard ? 1.9 : 1.1, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.34)
  osc.connect(g).connect(out)
  osc.start(t); osc.stop(t + 0.36)

  const click = audio.createBufferSource()
  click.buffer = noiseBuffer(audio, 0.02)
  const cf = audio.createBiquadFilter()
  cf.type = 'highpass'; cf.frequency.value = 1400
  const cg = audio.createGain()
  cg.gain.setValueAtTime(0.4, t)
  cg.gain.exponentialRampToValueAtTime(0.001, t + 0.018)
  click.connect(cf).connect(cg).connect(out)
  click.start(t); click.stop(t + 0.03)

  nodes.push(osc, click)
}

/** Cracking snare — noise burst, tuned body, short room tail. */
function snare(audio, out, t, ghost = false) {
  const lvl = ghost ? 0.14 : 0.85

  const src = audio.createBufferSource()
  src.buffer = noiseBuffer(audio, 0.26)
  const bp = audio.createBiquadFilter()
  bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 0.5
  const g = audio.createGain()
  g.gain.setValueAtTime(lvl, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + (ghost ? 0.06 : 0.17))
  src.connect(bp).connect(g).connect(out)
  src.start(t); src.stop(t + 0.28)

  const body = audio.createOscillator()
  const bg = audio.createGain()
  body.type = 'triangle'
  body.frequency.setValueAtTime(235, t)
  body.frequency.exponentialRampToValueAtTime(160, t + 0.07)
  bg.gain.setValueAtTime(lvl * 0.55, t)
  bg.gain.exponentialRampToValueAtTime(0.001, t + 0.09)
  body.connect(bg).connect(out)
  body.start(t); body.stop(t + 0.11)

  nodes.push(src, body)

  // Short room tail on the main hits gives it that sampled-off-vinyl depth.
  if (!ghost) {
    const tail = audio.createBufferSource()
    tail.buffer = noiseBuffer(audio, 0.3)
    const tf = audio.createBiquadFilter()
    tf.type = 'bandpass'; tf.frequency.value = 1400; tf.Q.value = 0.8
    const tg = audio.createGain()
    tg.gain.setValueAtTime(0.11, t + 0.01)
    tg.gain.exponentialRampToValueAtTime(0.001, t + 0.26)
    tail.connect(tf).connect(tg).connect(out)
    tail.start(t + 0.01); tail.stop(t + 0.3)
    nodes.push(tail)
  }
}

function hat(audio, out, t, open = false, accent = false) {
  const src = audio.createBufferSource()
  src.buffer = noiseBuffer(audio, open ? 0.24 : 0.05)
  const hp = audio.createBiquadFilter()
  hp.type = 'highpass'; hp.frequency.value = 8200
  const g = audio.createGain()
  g.gain.setValueAtTime(open ? 0.15 : (accent ? 0.13 : 0.07), t)
  g.gain.exponentialRampToValueAtTime(0.001, t + (open ? 0.22 : 0.04))
  src.connect(hp).connect(g).connect(out)
  src.start(t); src.stop(t + 0.26)
  nodes.push(src)
}

/* ── Pitched voices ──────────────────────────────────────── */

/** Dark piano stab: fast attack, bandpassed harmonics, quick decay. */
function piano(audio, out, t, freq, dur) {
  const g = audio.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.26, t + 0.006)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)

  const lp = audio.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(3400, t)
  lp.frequency.exponentialRampToValueAtTime(900, t + dur)
  lp.connect(g).connect(out)

  // Two partials plus a detuned twin reads as a struck string.
  ;[[1, 1], [2, 0.4], [3, 0.16]].forEach(([mult, amp]) => {
    const osc = audio.createOscillator()
    const og = audio.createGain()
    osc.type = mult === 1 ? 'triangle' : 'sine'
    osc.frequency.setValueAtTime(freq * mult, t)
    og.gain.value = amp
    osc.connect(og).connect(lp)
    osc.start(t); osc.stop(t + dur)
    nodes.push(osc)
  })

  const detune = audio.createOscillator()
  const dg = audio.createGain()
  detune.type = 'triangle'
  detune.frequency.setValueAtTime(freq * 1.0016, t)
  dg.gain.value = 0.5
  detune.connect(dg).connect(lp)
  detune.start(t); detune.stop(t + dur)
  nodes.push(detune)
}

/** Sustained string pad sitting under the hook. */
function strings(audio, out, t, freqs, dur) {
  const lp = audio.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 1700
  lp.Q.value = 0.5

  const g = audio.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.075, t + 0.35)   // slow bow-in
  g.gain.setValueAtTime(0.075, t + dur * 0.7)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  lp.connect(g).connect(out)

  freqs.forEach((f, i) => {
    const osc = audio.createOscillator()
    osc.type = 'sawtooth'
    // Slight per-voice drift keeps the section from sounding like one synth.
    osc.frequency.setValueAtTime(f * 0.5 * (1 + (i - 1) * 0.0015), t)
    osc.connect(lp)
    osc.start(t); osc.stop(t + dur)
    nodes.push(osc)
  })
}

/** Deep sub — mostly felt, not heard. */
function sub(audio, out, t, freq, dur) {
  const osc = audio.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq * 0.98, t)
  osc.frequency.linearRampToValueAtTime(freq, t + 0.04)
  const g = audio.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.72, t + 0.03)
  g.gain.setValueAtTime(0.72, t + dur * 0.65)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  osc.connect(g).connect(out)
  osc.start(t); osc.stop(t + dur)
  nodes.push(osc)
}

/* ── Arrangement ─────────────────────────────────────────── */

function scheduleLoop(audio, out, startAt) {
  for (let bar = 0; bar < BARS; bar++) {
    const b0 = startAt + bar * BAR

    // Harmony moves in 2-bar blocks.
    if (bar % 2 === 0) {
      const idx = (bar / 2) % PROGRESSION.length
      const ch = PROGRESSION[idx]

      strings(audio, out, b0, ch.notes, BAR * 2 - 0.15)

      HOOK[idx].forEach(([o, which, len]) => {
        const f = which === 'top' ? ch.top : ch.notes[which]
        piano(audio, out, b0 + o * BEAT, f, len * BEAT)
      })

      SUB[idx].forEach(([o, mult, len]) => {
        sub(audio, out, b0 + o * BEAT, ch.root * mult, len * BEAT)
      })
    }

    /* Boom bap: kick on 1 and the "and" of 2, snare hard on 2 and 4. */
    kick(audio, out, b0)
    kick(audio, out, b0 + BEAT * 1.5, false)
    kick(audio, out, b0 + BEAT * 2.5)
    if (bar % 2 === 1) kick(audio, out, b0 + BEAT * 3.75, false)

    snare(audio, out, b0 + BEAT)
    snare(audio, out, b0 + BEAT * 3)
    snare(audio, out, b0 + BEAT * 2.25, true)   // ghost
    snare(audio, out, b0 + BEAT * 3.75, true)   // ghost
    if (bar === 7) snare(audio, out, b0 + BEAT * 3.5)  // turnaround fill

    // Swung eighth hats, accented on the beat, open on the last eighth.
    for (let e = 0; e < 8; e++) {
      const swing = e % 2 === 1 ? SWING : 0
      hat(audio, out, b0 + e * (BEAT / 2) + swing, e === 7 && bar % 4 === 3, e % 2 === 0)
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
  master.gain.linearRampToValueAtTime(volume * 0.4, audio.currentTime + 1.0)

  // Glue bus — keeps the loud kick and snare from clipping the mix.
  const glue = audio.createDynamicsCompressor()
  glue.threshold.value = -16
  glue.ratio.value = 5
  glue.attack.value = 0.004
  glue.release.value = 0.16

  // Gentle top roll-off for the sampled-off-vinyl character.
  const tone = audio.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 11000

  tone.connect(glue).connect(master).connect(audio.destination)

  // Vinyl crackle bed, looping independently of the musical grid.
  const crackle = audio.createBufferSource()
  crackle.buffer = noiseBuffer(audio, 4)
  crackle.loop = true
  const crackleHp = audio.createBiquadFilter()
  crackleHp.type = 'highpass'; crackleHp.frequency.value = 4000
  const crackleGain = audio.createGain()
  crackleGain.gain.value = 0.007
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
    master.gain.linearRampToValueAtTime(v * 0.4, ctx.currentTime + 0.2)
  }
}
