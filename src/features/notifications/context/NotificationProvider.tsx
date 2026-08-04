import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { notificationSignal } from '@/core/events/notificationSignal'
import {
  getNotifications,
  markAllAsRead as markAllAsReadService,
  markAsRead as markAsReadService,
  removeNotification as removeNotificationService,
  removeReadNotifications,
} from '@/services/notification.service'
import { NOTIFICATION_TYPE_CATEGORY } from '@/types/notification'
import type { Notification, NotificationFilter } from '@/types/notification'
import { NotificationContext, type NotificationContextValue } from './notification-context'

/**
 * Estado global del Centro de Notificaciones (Sprint Event Bus, Parte 8).
 *
 * No sondea: se actualiza cuando cambia el usuario en sesión y cuando
 * `notification.service.ts` emite una señal por `notificationSignal`
 * (creada/leída/eliminada) — la misma notificación que crea
 * `NotificationListener` en reacción a un evento del Event Bus llega aquí
 * sin que este Provider conozca nada del evento de negocio original.
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<NotificationFilter>('todas')
  const [search, setSearch] = useState('')

  const reload = useCallback(() => {
    if (!userId) {
      setNotifications([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    getNotifications(userId)
      .then(setNotifications)
      .finally(() => setIsLoading(false))
  }, [userId])

  useEffect(reload, [reload])

  useEffect(() => {
    if (!userId) return
    const unsubscribers = [
      notificationSignal.subscribe('created', (notification) => {
        if (notification.userId === userId) reload()
      }),
      notificationSignal.subscribe('read', (notification) => {
        if (notification.userId === userId) reload()
      }),
      notificationSignal.subscribe('read-all', ({ userId: affectedUserId }) => {
        if (affectedUserId === userId) reload()
      }),
      notificationSignal.subscribe('deleted', ({ userId: affectedUserId }) => {
        if (affectedUserId === userId) reload()
      }),
      notificationSignal.subscribe('deleted-read', ({ userId: affectedUserId }) => {
        if (affectedUserId === userId) reload()
      }),
    ]
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
  }, [userId, reload])

  const markAsRead = useCallback(
    async (id: string) => {
      await markAsReadService(id)
    },
    [],
  )

  const markAllAsRead = useCallback(async () => {
    if (!userId) return
    await markAllAsReadService(userId)
  }, [userId])

  const removeNotification = useCallback(
    async (id: string) => {
      if (!userId) return
      await removeNotificationService(id, userId)
    },
    [userId],
  )

  const removeAllRead = useCallback(async () => {
    if (!userId) return
    await removeReadNotifications(userId)
  }, [userId])

  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications])

  const filteredNotifications = useMemo(() => {
    const term = search.trim().toLowerCase()
    return notifications.filter((item) => {
      const matchesFilter =
        filter === 'todas'
          ? true
          : filter === 'no_leidas'
            ? !item.isRead
            : NOTIFICATION_TYPE_CATEGORY[item.type] === filter
      const matchesSearch =
        term === '' || item.title.toLowerCase().includes(term) || item.description.toLowerCase().includes(term)
      return matchesFilter && matchesSearch
    })
  }, [notifications, filter, search])

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      filteredNotifications,
      unreadCount,
      isLoading,
      filter,
      setFilter,
      search,
      setSearch,
      markAsRead,
      markAllAsRead,
      removeNotification,
      removeAllRead,
    }),
    [
      notifications,
      filteredNotifications,
      unreadCount,
      isLoading,
      filter,
      search,
      markAsRead,
      markAllAsRead,
      removeNotification,
      removeAllRead,
    ],
  )

  return <NotificationContext value={value}>{children}</NotificationContext>
}
