import { useCallback, useEffect, useState } from 'react'
import { getForumNotifications } from '@/services/forum.service'
import type { ForumNotification } from '@/types/forum'

interface UseForumNotificationsResult {
  notifications: ForumNotification[]
  unreadCount: number
  isLoading: boolean
  refresh: () => void
}

/** Notificaciones internas del Foro del usuario en sesión (Sprint 13.1). */
export function useForumNotifications(recipientId: string | undefined): UseForumNotificationsResult {
  const [notifications, setNotifications] = useState<ForumNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!recipientId) return

    let active = true
    setIsLoading(true)

    getForumNotifications(recipientId)
      .then((data) => {
        if (active) setNotifications(data)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [recipientId, reloadToken])

  const refresh = useCallback(() => setReloadToken((token) => token + 1), [])

  const unreadCount = notifications.filter((item) => !item.read).length

  return { notifications, unreadCount, isLoading, refresh }
}
