import { NOTIFICATION_TYPE_CATEGORY, NOTIFICATION_TYPE_ICON } from '@/types/notification'
import type { CreateNotificationInput, Notification } from '@/types/notification'

/**
 * Almacén simulado del Centro de Notificaciones (Sprint Event Bus).
 *
 * A diferencia de los demás mocks del proyecto, este arranca **vacío**: no
 * hay notificaciones sembradas a propósito ("No usar datos hardcodeados").
 * Todo lo que aparece aquí se generó en vivo porque `NotificationListener`
 * reaccionó a un evento real del Event Bus durante la sesión — es la prueba
 * de que la arquitectura orientada a eventos funciona de punta a punta.
 *
 * Estado en memoria: se reinicia al recargar, igual que el resto de la app.
 */

let NOTIFICATIONS: Notification[] = []
let sequence = 1

function clone<T>(value: T): T {
  return structuredClone(value)
}

export function insertNotification(input: CreateNotificationInput): Notification {
  sequence += 1
  const notification: Notification = {
    id: `ntf-${sequence}`,
    userId: input.userId,
    title: input.title,
    description: input.description,
    type: input.type,
    category: NOTIFICATION_TYPE_CATEGORY[input.type],
    priority: input.priority ?? 'media',
    icon: input.icon ?? NOTIFICATION_TYPE_ICON[input.type],
    link: input.link,
    isRead: false,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
    metadata: input.metadata,
  }
  NOTIFICATIONS = [notification, ...NOTIFICATIONS]
  return clone(notification)
}

export function listNotifications(userId: string): Notification[] {
  return NOTIFICATIONS.filter((item) => item.userId === userId)
    .map(clone)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function listUnreadNotifications(userId: string): Notification[] {
  return listNotifications(userId).filter((item) => !item.isRead)
}

export function markNotificationRead(notificationId: string): Notification | null {
  const notification = NOTIFICATIONS.find((item) => item.id === notificationId)
  if (!notification) return null
  notification.isRead = true
  notification.readAt = new Date().toISOString()
  return clone(notification)
}

export function markAllNotificationsRead(userId: string): void {
  const now = new Date().toISOString()
  NOTIFICATIONS.forEach((item) => {
    if (item.userId === userId && !item.isRead) {
      item.isRead = true
      item.readAt = now
    }
  })
}

export function deleteNotification(notificationId: string): boolean {
  const before = NOTIFICATIONS.length
  NOTIFICATIONS = NOTIFICATIONS.filter((item) => item.id !== notificationId)
  return NOTIFICATIONS.length < before
}

export function deleteReadNotifications(userId: string): number {
  const before = NOTIFICATIONS.length
  NOTIFICATIONS = NOTIFICATIONS.filter((item) => !(item.userId === userId && item.isRead))
  return before - NOTIFICATIONS.length
}
