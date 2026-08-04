import type { Notification } from '@/types/notification'

export interface NotificationGroups {
  hoy: Notification[]
  ayer: Notification[]
  estaSemana: Notification[]
  masAntiguas: Notification[]
}

/** Agrupa notificaciones por antigüedad (Parte 2): Hoy, Ayer, Esta semana, Más antiguas. */
export function groupByRecency(notifications: Notification[]): NotificationGroups {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - 7)

  const groups: NotificationGroups = { hoy: [], ayer: [], estaSemana: [], masAntiguas: [] }

  for (const notification of notifications) {
    const createdAt = new Date(notification.createdAt)
    if (createdAt >= startOfToday) groups.hoy.push(notification)
    else if (createdAt >= startOfYesterday) groups.ayer.push(notification)
    else if (createdAt >= startOfWeek) groups.estaSemana.push(notification)
    else groups.masAntiguas.push(notification)
  }

  return groups
}

export const NOTIFICATION_GROUP_LABELS: Record<keyof NotificationGroups, string> = {
  hoy: 'Hoy',
  ayer: 'Ayer',
  estaSemana: 'Esta semana',
  masAntiguas: 'Más antiguas',
}
