import type { AuditFilters, AuditLogEntry, RecordAuditInput } from '@/types/audit'

/**
 * Almacén simulado de Auditoría (Sprint 13; ampliado Sprint 19).
 * Estado en memoria durante la sesión, mismo criterio que el resto de los
 * mocks del proyecto.
 */

let AUDIT_LOG: AuditLogEntry[] = []
let sequence = 100

function simulateIp(userId: string): string {
  let hash = 0
  for (const char of userId) hash = (hash * 31 + char.charCodeAt(0)) % 65536
  return `10.20.${hash % 256}.${(hash >> 8) % 256}`
}

const SIMULATED_LOCATIONS = ['Ciudad de México, MX', 'Guadalajara, MX', 'Monterrey, MX', 'Puebla, MX']

function simulateLocation(userId: string): string {
  let hash = 0
  for (const char of userId) hash = (hash * 17 + char.charCodeAt(0)) % 997
  return SIMULATED_LOCATIONS[hash % SIMULATED_LOCATIONS.length]
}

/** Deriva navegador/SO simulados del user-agent real del navegador donde corre la demo (no hay backend que los reciba todavía). */
function simulateBrowserAndOs(): { browser: string; os: string } {
  if (typeof navigator === 'undefined') return { browser: 'Navegador desconocido', os: 'Sistema desconocido' }
  const ua = navigator.userAgent
  const os = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Linux') ? 'Linux' : 'Desconocido'
  const browser = ua.includes('Edg') ? 'Edge' : ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : 'Navegador'
  return { browser, os }
}

export function insertAuditEntry(input: RecordAuditInput): AuditLogEntry {
  sequence += 1
  const { browser, os } = simulateBrowserAndOs()
  const entry: AuditLogEntry = {
    id: `audit-${sequence}`,
    ...input,
    ipSimulated: simulateIp(input.userId),
    device: `${browser} en ${os}`,
    browserSimulated: browser,
    osSimulated: os,
    locationSimulated: simulateLocation(input.userId),
    createdAt: new Date().toISOString(),
  }
  AUDIT_LOG = [entry, ...AUDIT_LOG]
  return entry
}

export function listAuditEntries(filters: AuditFilters = {}): AuditLogEntry[] {
  const term = filters.query?.trim().toLowerCase()
  return AUDIT_LOG.filter((entry) => {
    if (filters.module && entry.module !== filters.module) return false
    if (filters.userId && entry.userId !== filters.userId) return false
    if (filters.dateFrom && entry.createdAt < filters.dateFrom) return false
    if (filters.dateTo && entry.createdAt > filters.dateTo) return false
    if (term && !`${entry.userName} ${entry.action} ${entry.module}`.toLowerCase().includes(term)) return false
    return true
  })
}
