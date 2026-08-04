import { EventEmitter } from './EventEmitter'
import type { AppEventMap, AppEventName } from './EventTypes'

/**
 * Instancia única del Event Bus de la plataforma (Sprint Event Bus).
 *
 * Mecanismo oficial de comunicación entre módulos: un módulo que completa una
 * acción (calificar, publicar, reportar, otorgar puntos…) emite un evento
 * aquí; no conoce ni le importa quién escucha. `core/events/listeners`
 * contiene los suscriptores (Notificaciones, Leaderboard, Badges, Analítica).
 */
export const eventBus = new EventEmitter<AppEventMap>()

/**
 * Emite un evento de la plataforma, completando `occurredAt` automáticamente
 * para que quien emite no tenga que repetirlo en cada llamada.
 */
export function emitAppEvent<K extends AppEventName>(
  event: K,
  payload: Omit<AppEventMap[K], 'occurredAt'>,
): void {
  eventBus.emit(event, { ...payload, occurredAt: new Date().toISOString() } as AppEventMap[K])
}
