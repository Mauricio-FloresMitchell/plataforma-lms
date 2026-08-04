import { createContext } from 'react'
import type { Notification, NotificationFilter } from '@/types/notification'

export interface NotificationContextValue {
  notifications: Notification[]
  filteredNotifications: Notification[]
  unreadCount: number
  isLoading: boolean
  filter: NotificationFilter
  setFilter: (filter: NotificationFilter) => void
  search: string
  setSearch: (search: string) => void
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  removeNotification: (id: string) => Promise<void>
  removeAllRead: () => Promise<void>
}

export const NotificationContext = createContext<NotificationContextValue | null>(null)
