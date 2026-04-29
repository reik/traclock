export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function toSeconds(minutes: number, seconds: number): number {
  return minutes * 60 + seconds
}

export function fromSeconds(totalSeconds: number): { minutes: number; seconds: number } {
  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
  }
}
