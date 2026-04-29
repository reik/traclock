function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3
): void {
  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = frequency
  osc.type = type
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

export function playWarningSound(): void {
  playTone(880, 0.25, 'sine', 0.2)
}

export function playNextSound(): void {
  playTone(440, 0.3, 'sine', 0.4)
  setTimeout(() => playTone(550, 0.3, 'sine', 0.4), 200)
}

export function playCompleteSound(): void {
  playTone(523, 0.3, 'sine', 0.5)
  setTimeout(() => playTone(659, 0.3, 'sine', 0.5), 300)
  setTimeout(() => playTone(784, 0.5, 'sine', 0.5), 600)
}
