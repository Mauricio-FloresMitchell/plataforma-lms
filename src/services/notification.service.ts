import {
  deleteNotification,
  deleteReadNotifications,
  insertNotification,
  listNotifications,
  listUnreadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/mocks/notifications'
import { notificationSignal } from '@/core/events/notificationSignal'
import type { CreateNotificationInput, Notification } from '@/types/notification'

/**
 * Capa de acceso a datos del Centro de Notificaciones (Sprint Event Bus).
 *
 * Espeja el contrato REST pedido en el sprint (`GET /notifications`,
 * `GET /notifications/unread`, `POST /notifications`, `PATCH /:id/read`,
 * `PATCH /read-all`, `DELETE /:id`, `DELETE /read`) como funciones async,
 * mismo patrón que el resto de `services/*` — migrar a HTTP real implica
 * reemplazar el cuerpo de estas funciones, no su firma.
 *
 * Es el único punto que crea notificaciones (`createNotification`), y solo
 * lo invoca `NotificationListener`; ningún componente ni otro módulo debe
 * llamarlo directamente.
 */

const NETWORK_DELAY_MS = 200

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** GET /notifications */
export async function getNotifications(userId: string): Promise<Notification[]> {
  await delay(NETWORK_DELAY_MS)
  return listNotifications(userId)
}

/** GET /notifications/unread */
export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  await delay(NETWORK_DELAY_MS)
  return listUnreadNotifications(userId)
}

/** POST /notifications — invocado únicamente por `NotificationListener`. */
export async function createNotification(input: CreateNotificationInput): Promise<Notification> {
  await delay(50)
  const notification = insertNotification(input)
  notificationSignal.emit('created', notification)
  return notification
}

/** PATCH /notifications/:id/read */
export async function markAsRead(notificationId: string): Promise<Notification | null> {
  await delay(120)
  const notification = markNotificationRead(notificationId)
  if (notification) notificationSignal.emit('read', notification)
  return notification
}

/** PATCH /notifications/read-all */
export async function markAllAsRead(userId: string): Promise<void> {
  await delay(120)
  markAllNotificationsRead(userId)
  notificationSignal.emit('read-all', { userId })
}

/** DELETE /notifications/:id */
export async function removeNotification(notificationId: string, userId: string): Promise<boolean> {
  await delay(120)
  const removed = deleteNotification(notificationId)
  if (removed) notificationSignal.emit('deleted', { id: notificationId, userId })
  return removed
}

/** DELETE /notifications/read */
export async function removeReadNotifications(userId: string): Promise<number> {
  await delay(120)
  const count = deleteReadNotifications(userId)
  if (count > 0) notificationSignal.emit('deleted-read', { userId })
  return count
}
