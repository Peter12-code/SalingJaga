

let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function playClickSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.05)
  } catch (e) {
    
  }
}

export function playSuccessSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const notes = [523.25, 659.25, 783.99, 1046.50] 
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const startTime = ctx.currentTime + idx * 0.08
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(0.12, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.18)
    })
  } catch (e) {}
}

export function playRadioChirp() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(1400, ctx.currentTime)
    osc.frequency.setValueAtTime(1900, ctx.currentTime + 0.04)
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  } catch (e) {}
}

export function playAlertSiren() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    const now = ctx.currentTime
    
    osc.frequency.setValueAtTime(600, now)
    osc.frequency.linearRampToValueAtTime(950, now + 0.25)
    osc.frequency.linearRampToValueAtTime(600, now + 0.5)
    osc.frequency.linearRampToValueAtTime(950, now + 0.75)
    osc.frequency.linearRampToValueAtTime(600, now + 1.0)

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.1)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 1.1)
  } catch (e) {}
}
