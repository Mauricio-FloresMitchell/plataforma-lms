import type { Role } from '@/types/auth'

/**
 * Modelo de Auditoría (Sprint 13, Parte 12; ampliado en Sprint 19, Parte 6).
 *
 * Registra automáticamente toda acción administrativa relevante. `recordAudit`
 * (`services/audit.service.ts`) se llama al final de cada función de
 * servicio que muta datos administrativos — nunca hay una acción sin su
 * entrada correspondiente.
 *
 * Sprint 19 amplía la cobertura a inicio/cierre de sesión (vía
 * `core/events/listeners/AuditListener.ts`, sin tocar `auth.service.ts`),
 * intentos fallidos de inicio de sesión (`recordAnonymousAudit`, sin actor
 * autenticado — `role` queda ausente), descargas y moderación del Foro.
 * También separa `device` (ya existente) en `browserSimulated`/
 * `osSimulated`/`locationSimulated` — preparación explícita pedida por el
 * sprint para "IP, Sistema Operativo, Navegador, Ubicación, Dispositivo",
 * sin conectar todavía un origen de datos real (geolocalización, user-agent
 * parsing de verdad) — se siguen simulando igual que `ipSimulated`.
 */

export type AuditModule =
  | 'Carreras'
  | 'Materias'
  | 'Grupos'
  | 'Usuarios'
  | 'Reportes'
  | 'Evaluaciones'
  | 'Leaderboard'
  | 'Notificaciones'
  | 'Biblioteca'
  | 'Configuración'
  | 'Backups'
  | 'Producto de Titulación'
  | 'Sesión'
  | 'Foro'
  | 'Incidencias'
  | 'Gestión Académica'
  | 'Roles y Permisos'

export interface AuditLogEntry {
  id: string
  userId: string
  userName: string
  /** Ausente en entradas anónimas (intentos de inicio de sesión fallidos, sin usuario autenticado). */
  role?: Role
  module: AuditModule
  action: string
  /** Estado anterior, si aplica (serializable). */
  before?: unknown
  /** Estado nuevo, si aplica (serializable). */
  after?: unknown
  ipSimulated: string
  /** @deprecated Usar `browserSimulated`/`osSimulated`. Se conserva para no romper lecturas anteriores del mismo array en memoria. */
  device: string
  browserSimulated: string
  osSimulated: string
  locationSimulated: string
  /** Fecha y hora ISO 8601 — ambas se derivan del mismo campo. */
  createdAt: string
}

export interface RecordAuditInput {
  userId: string
  userName: string
  role?: Role
  module: AuditModule
  action: string
  before?: unknown
  after?: unknown
}

export interface AuditFilters {
  module?: AuditModule
  userId?: string
  query?: string
  dateFrom?: string
  dateTo?: string
}
