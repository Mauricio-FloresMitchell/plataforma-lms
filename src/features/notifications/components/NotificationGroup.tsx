import type { Notification } from '@/types/notification'
import { NotificationCard } from './NotificationCard'

interface NotificationGroupProps {
  label: string
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onRemove: (id: string) => void
  onNavigate?: () => void
}

/** Sección agrupada por antigüedad dentro de la bandeja (Parte 2). */
export function NotificationGroup({ label, notifications, onMarkAsRead, onRemove, onNavigate }: NotificationGroupProps) {
  if (notifications.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</h3>
      <div className="flex flex-col gap-2">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onRemove={onRemove}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  )
}
