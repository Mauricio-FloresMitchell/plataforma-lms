const LOCALE = 'es-MX'

/** Formato corto: 25 jul. */
export function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'short',
  })
}

/** Formato con hora: 25 jul, 11:59 p.m. */
export function formatDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString(LOCALE, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Distancia relativa legible respecto a ahora: "hace 2 días", "en 3 días".
 */
export function formatRelativeToNow(isoDate: string, now: Date = new Date()): string {
  const diffMs = new Date(isoDate).getTime() - now.getTime()
  const formatter = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' })

  const units: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
    { unit: 'day', ms: 86_400_000 },
    { unit: 'hour', ms: 3_600_000 },
    { unit: 'minute', ms: 60_000 },
  ]

  for (const { unit, ms } of units) {
    const value = Math.trunc(diffMs / ms)
    if (value !== 0) return formatter.format(value, unit)
  }

  return 'ahora'
}

/** Días restantes hasta una fecha. Negativo si ya pasó. */
export function daysUntil(isoDate: string, now: Date = new Date()): number {
  const diffMs = new Date(isoDate).getTime() - now.getTime()
  return Math.ceil(diffMs / 86_400_000)
}
