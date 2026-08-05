/**
 * Synthesized hair-clipper buzz using the Web Audio API.
 * No audio file needed — the motor hum is built from a couple of
 * detuned sawtooth oscillators plus a filtered noise layer for the blades.
 */

let ctx = null

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

/** Noise buffer reused for the blade-chatter layer. */
function makeNoiseBuffer(audio, seconds) {
  const buffer = audio.createBuffer(1, audio.sampleRate * seconds, audio.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1
  }
  return buffer
}

/**
 * Play the clipper for `duration` seconds.
 * Returns a stop() function so callers can cut it short.
 */
export function playClippers(duration = 3) {
  const audio = getCtx()
  if (!audio) return () => {}

  // Browsers suspend the context until a user gesture.
  if (audio.state === 'suspended') audio.resume()

  const now = audio.currentTime
  const master = audio.createGain()
  master.gain.setValueAtTime(0, now)
  master.gain.linearRampToValueAtTime(0.16, now + 0.15)   // spin up
  master.gain.setValueAtTime(0.16, now + duration - 0.3)
  master.gain.linearRampToValueAtTime(0, now + duration)  // spin down
  master.connect(audio.destination)

  // Motor hum — two slightly detuned saws give it that gritty beat.
  const motorFilter = audio.createBiquadFilter()
  motorFilter.type = 'lowpass'
  motorFilter.frequency.value = 1400
  motorFilter.Q.value = 6
  motorFilter.connect(master)

  const oscs = [
    { freq: 105, gain: 0.6 },
    { freq: 108, gain: 0.5 },
    { freq: 212, gain: 0.25 },
  ].map(({ freq, gain }) => {
    const osc = audio.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(freq * 0.7, now)
    osc.frequency.linearRampToValueAtTime(freq, now + 0.25) // motor revs up
    const g = audio.createGain()
    g.gain.value = gain
    osc.connect(g).connect(motorFilter)
    osc.start(now)
    osc.stop(now + duration)
    return osc
  })

  // Blade chatter — bandpassed white noise riding on top.
  const noise = audio.createBufferSource()
  noise.buffer = makeNoiseBuffer(audio, duration)
  noise.loop = true
  const noiseFilter = audio.createBiquadFilter()
  noiseFilter.type = 'bandpass'
  noiseFilter.frequency.value = 3200
  noiseFilter.Q.value = 1.2
  const noiseGain = audio.createGain()
  noiseGain.gain.value = 0.09
  noise.connect(noiseFilter).connect(noiseGain).connect(master)
  noise.start(now)
  noise.stop(now + duration)

  return function stop() {
    const t = audio.currentTime
    master.gain.cancelScheduledValues(t)
    master.gain.setValueAtTime(master.gain.value, t)
    master.gain.linearRampToValueAtTime(0, t + 0.12)
    oscs.forEach(o => { try { o.stop(t + 0.15) } catch {} })
    try { noise.stop(t + 0.15) } catch {}
  }
}
