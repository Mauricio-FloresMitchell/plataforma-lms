import { eventBus } from '../EventBus'
import { recordAudit } from '@/services/audit.service'
import { recordUserLoginAsync } from '@/services/userManagement.service'
import type { Unsubscribe } from '../EventEmitter'

/**
 * Registra en Auditoría inicio/cierre de sesión (Sprint 19, Parte 6) sin
 * tocar `auth.service.ts` ni `AuthProvider.tsx`: ambos ya emitían
 * `USER_LOGIN`/`USER_LOGOUT` desde el Sprint del Event Bus, este listener
 * solo se suscribe. También actualiza `ManagedUser.lastLoginAt` (Sprint 19,
 * Parte 2, "Último acceso") en la misma reacción.
 */
let unsubscribeAll: Unsubscribe | null = null

export function registerAuditListener(): Unsubscribe {
  if (unsubscribeAll) return unsubscribeAll

  const subscriptions: Unsubscribe[] = [
    eventBus.subscribe('USER_LOGIN', (payload) => {
      recordAudit({ id: payload.userId, name: payload.userName, role: payload.role }, 'Sesión', 'Inicio de sesión')
      void recordUserLoginAsync(payload.userId)
    }),
    eventBus.subscribe('USER_LOGOUT', (payload) => {
      recordAudit({ id: payload.userId, name: payload.userName, role: payload.role }, 'Sesión', 'Cierre de sesión')
    }),
  ]

  unsubscribeAll = () => {
    subscriptions.forEach((unsubscribe) => unsubscribe())
    unsubscribeAll = null
  }
  return unsubscribeAll
}
