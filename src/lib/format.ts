export const zar = (value: number): string =>
  `R${value.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

export const compactUnits = (units: number): string =>
  units >= 1000 ? `${(units / 1000).toFixed(1).replace('.0', '')}k` : `${units}`

export const FREE_DELIVERY_THRESHOLD = 500

const pad = (n: number) => n.toString().padStart(2, '0')

/**
 * Same-day dispatch cutoff is 14:00 SAST (UTC+2), weekdays only.
 * Computed from UTC so it is correct for a shopper in any timezone.
 */
export function dispatchCutoff(now: Date = new Date()): { open: boolean; label: string } {
  const sast = new Date(now.getTime() + 2 * 60 * 60 * 1000)
  const day = sast.getUTCDay()
  const h = sast.getUTCHours()
  const m = sast.getUTCMinutes()
  const s = sast.getUTCSeconds()

  const weekend = day === 0 || day === 6
  if (weekend) {
    return { open: false, label: day === 6 ? 'Dispatch resumes Monday' : 'Dispatch resumes Monday' }
  }

  const secondsNow = h * 3600 + m * 60 + s
  const cutoff = 14 * 3600
  if (secondsNow >= cutoff) {
    return { open: false, label: day === 5 ? 'Next dispatch Monday' : 'Next dispatch tomorrow' }
  }

  const left = cutoff - secondsNow
  const hh = Math.floor(left / 3600)
  const mm = Math.floor((left % 3600) / 60)
  const ss = left % 60
  return { open: true, label: `${pad(hh)}:${pad(mm)}:${pad(ss)}` }
}
