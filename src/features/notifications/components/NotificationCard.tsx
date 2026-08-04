import { Check, ExternalLink, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/utils/date'
import type { Notification, NotificationPriority } from '@/types/notification'
import { resolveNotificationIcon } from './notificationIconMap'

interface NotificationCardProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onRemove: (id: string) => void
  onNavigate?: () => void
}

const PRIORITY_LABELS: Record<NotificationPriority, { label: string; className: string }> = {
  alta: { label: 'Alta', className: 'bg-destructive/10 text-destructive' },
  media: { label: 'Media', className: 'bg-amber-100 text-amber-800' },
  baja: { label: 'Baja', className: 'bg-secondary text-secondary-foreground' },
}

/** Tarjeta de una notificación (Parte 2/4/9): ícono, contenido, prioridad y acciones. */
export function NotificationCard({ notification, onMarkAsRead, onRemove, onNavigate }: NotificationCardProps) {
  const navigate = useNavigate()
  const Icon = resolveNotificationIcon(notification.icon)
  const priority = PRIORITY_LABELS[notification.priority]

  function handleOpen() {
    if (!notification.isRead) onMarkAsRead(notification.id)
    if (notification.link) {
      navigate(notification.link)
      onNavigate?.()
    }
  }

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border border-border p-3 transition-colors',
        notification.isRead ? 'bg-background opacity-70' : 'bg-primary/5',
      )}
    >
      <div
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full',
          notification.isRead ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary',
        )}
      >
        <Icon className="size-4" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm', notification.isRead ? 'font-medium text-foreground' : 'font-semibold text-foreground')}>
            {notification.title}
          </p>
          {!notification.isRead ? <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" aria-label="No leída" /> : null}
        </div>

        <p className="text-sm text-muted-foreground">{notification.description}</p>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground/80">{formatDateTime(notification.createdAt)}</span>
          <Badge className={priority.className}>{priority.label}</Badge>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {notification.link ? (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleOpen}>
              <ExternalLink className="size-3.5" />
              Abrir
            </Button>
          ) : null}
          {!notification.isRead ? (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onMarkAsRead(notification.id)}>
              <Check className="size-3.5" />
              Marcar como leída
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive"
            onClick={() => onRemove(notification.id)}
          >
            <Trash2 className="size-3.5" />
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}
