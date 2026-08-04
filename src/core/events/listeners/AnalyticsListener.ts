import { eventBus } from '../EventBus'
import type { AppEventName } from '../EventTypes'
import type { Unsubscribe } from '../EventEmitter'

/**
 * Bitácora genérica de eventos de negocio (Sprint Event Bus, Parte 15).
 *
 * No envía nada a ningún proveedor todavía — es el punto de conexión
 * preparado para analítica/auditoría real (Mixpanel, Amplitude, un endpoint
 * propio de auditoría, etc.): cuando exista ese proveedor, solo hay que
 * reemplazar el cuerpo de `recordEntry`, no tocar los módulos que emiten.
 *
 * Sprint 12 (Chat, Parte 15 "Registrar auditoría"): incluye `MESSAGE_READ`,
 * el único evento de Chat que ningún otro listener consume — aquí sí queda
 * registrado, que es exactamente para lo que sirve esta bitácora.
 */
export interface AnalyticsLogEntry {
  event: AppEventName
  occurredAt: string
  payload: unknown
}

const MAX_ENTRIES = 500

const TRACKED_EVENTS: AppEventName[] = [
  'REPORT_SUBMITTED',
  'REPORT_APPROVED',
  'REPORT_REJECTED',
  'GRADE_UPDATED',
  'FORUM_POST_CREATED',
  'FORUM_COMMENT_CREATED',
  'FORUM_REPLY_CREATED',
  'FORUM_POST_REPORTED',
  'FORUM_COMMENT_REPORTED',
  'BADGE_GRANTED',
  'POINTS_GRANTED',
  'POINTS_REMOVED',
  'LEADERBOARD_UPDATED',
  'ACTIVITY_CREATED',
  'MATERIAL_CREATED',
  'NOTICE_SENT',
  'USER_LOGIN',
  'USER_LOGOUT',
  'ADMIN_WARNING_SENT',
  'MESSAGE_SENT',
  'MESSAGE_EDITED',
  'MESSAGE_DELETED',
  'MESSAGE_READ',
  'CONVERSATION_CREATED',
  'CONVERSATION_ARCHIVED',
  'CONVERSATION_PINNED',
  'FILE_SHARED',
  'IMAGE_SHARED',
  'AUDIO_SHARED',
  'DOCUMENT_SHARED',
  'REACTION_ADDED',
  'REACTION_REMOVED',
]

let ANALYTICS_LOG: AnalyticsLogEntry[] = []
let unsubscribeAll: Unsubscribe | null = null

function recordEntry(event: AppEventName, payload: unknown): void {
  ANALYTICS_LOG = [{ event, occurredAt: new Date().toISOString(), payload }, ...ANALYTICS_LOG].slice(0, MAX_ENTRIES)
}

export function registerAnalyticsListener(): Unsubscribe {
  if (unsubscribeAll) return unsubscribeAll

  const subscriptions = TRACKED_EVENTS.map((eventName) =>
    eventBus.subscribe(eventName, (payload) => recordEntry(eventName, payload)),
  )

  unsubscribeAll = () => {
    subscriptions.forEach((unsubscribe) => unsubscribe())
    unsubscribeAll = null
  }
  return unsubscribeAll
}

export function getAnalyticsLog(): AnalyticsLogEntry[] {
  return [...ANALYTICS_LOG]
}
