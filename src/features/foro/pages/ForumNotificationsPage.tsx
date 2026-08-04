import { AlertTriangle, AtSign, Bell, MessageSquare, Reply, ShieldAlert, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BackLink } from '@/components/BackLink'
import { Breadcrumb } from '@/components/Breadcrumb'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROLE_HOME } from '@/routes/navigation'
import { markAllForumNotificationsRead, markForumNotificationRead } from '@/services/forum.service'
import { formatRelativeToNow } from '@/utils/date'
import { useForumNotifications } from '../hooks/useForumNotifications'
import type { ForumNotificationType } from '@/types/forum'

const TYPE_CONFIG: Record<ForumNotificationType, { icon: typeof MessageSquare; label: string }> = {
  reply_to_post: { icon: MessageSquare, label: 'respondió tu publicación' },
  reply_to_comment: { icon: Reply, label: 'respondió tu comentario' },
  mention: { icon: AtSign, label: 'te mencionó' },
  report_update: { icon: ShieldAlert, label: 'revisó tu reporte' },
  warning_received: { icon: AlertTriangle, label: 'te envió una advertencia' },
  content_removed: { icon: Trash2, label: 'eliminó tu contenido' },
}

/** Notificaciones internas del Foro (Sprint 13.1): respuestas y menciones. */
export function ForumNotificationsPage() {
  const { user } = useAuth()
  const { notifications, isLoading, refresh } = useForumNotifications(user?.id)
  const roleHome = user ? ROLE_HOME[user.role] : '/'

  async function handleOpen(notificationId: string) {
    await markForumNotificationRead(notificationId)
    refresh()
  }

  async function handleMarkAllRead() {
    if (!user) return
    await markAllForumNotificationsRead(user.id)
    refresh()
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Breadcrumb
        items={[
          { label: 'Inicio', to: roleHome },
          { label: 'Foro académico', to: '/foro' },
          { label: 'Notificaciones' },
        ]}
      />
      <BackLink to="/foro" />

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Notificaciones</h1>
        {notifications.some((item) => !item.read) ? (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Marcar todas como leídas
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <ListSkeleton variant="row" count={3} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Sin notificaciones"
          description="Cuando alguien responda tus publicaciones, tus comentarios o te mencione, lo verás aquí."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notification) => {
            const config = TYPE_CONFIG[notification.type]
            const Icon = config.icon
            return (
              <Link key={notification.id} to={`/foro/${notification.postId}`} onClick={() => handleOpen(notification.id)}>
                <Card className={`shadow-sm transition-colors hover:border-primary/40 ${notification.read ? '' : 'bg-accent/40'}`}>
                  <CardContent className="flex items-start gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="size-4" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{notification.actorName}</span> {config.label}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{notification.postTitle}</p>
                      <p className="truncate text-xs text-muted-foreground/80">{notification.excerpt}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground/80">
                      {formatRelativeToNow(notification.createdAt)}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
