import { EventEmitter } from './EventEmitter'
import type { Notification } from '@/types/notification'

/**
 * Canal de refresco de UI para el Centro de Notificaciones (Sprint Event Bus).
 *
 * Distinto del Event Bus de dominio (`EventBus.ts`/`AppEventMap`): este no
 * representa eventos de negocio, solo avisa a `NotificationContext` que el
 * store de notificaciones cambió, para actualizar contador/lista sin sondeo.
 * Lo emite únicamente `services/notification.service.ts`.
 */
interface NotificationSignalMap {
  created: Notification
  read: Notification
  'read-all': { userId: string }
  deleted: { id: string; userId: string }
  'deleted-read': { userId: string }
}

export const notificationSignal = new EventEmitter<NotificationSignalMap>()
