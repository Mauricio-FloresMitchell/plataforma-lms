import { insertAuditEntry, listAuditEntries } from '@/mocks/audit'
import type { Role } from '@/types/auth'
import type { AuditFilters, AuditLogEntry, AuditModule } from '@/types/audit'

/**
 * Capa de acceso a datos de Auditoría (Sprint 13, Parte 12).
 *
 * `recordAudit` es síncrona a propósito (mismo criterio que `emitAppEvent`):
 * la llaman como último paso todas las funciones de servicio que mutan datos
 * administrativos en este sprint, sin que el llamador tenga que esperarla.
 */

export interface AuditActor {
  id: string
  name: string
  role: Role
}

export function recordAudit(actor: AuditActor, module: AuditModule, action: string, before?: unknown, after?: unknown): void {
  insertAuditEntry({
    userId: actor.id,
    userName: actor.name,
    role: actor.role,
    module,
    action,
    before,
    after,
  })
}

/**
 * Registra una acción sin actor autenticado (Sprint 19, Parte 6: "intentos
 * fallidos" de inicio de sesión) — no hay `userId`/`role` reales todavía.
 */
export function recordAnonymousAudit(module: AuditModule, action: string, attemptedLabel: string): void {
  insertAuditEntry({
    userId: 'anonimo',
    userName: attemptedLabel,
    module,
    action,
  })
}

const NETWORK_DELAY_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getAuditLogAsync(filters?: AuditFilters): Promise<AuditLogEntry[]> {
  await delay(NETWORK_DELAY_MS)
  return listAuditEntries(filters).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
