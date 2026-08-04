import { useCallback, useEffect, useState } from 'react'
import { Archive, Megaphone, MoreVertical, Pencil, Send, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/utils/date'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  archiveBroadcastAsync,
  deleteBroadcastAsync,
  getBroadcastsAsync,
  saveBroadcastDraftAsync,
  sendBroadcastNowAsync,
} from '@/services/notificationBroadcast.service'
import { AUDIENCE_LABELS } from '@/types/notificationBroadcast'
import type { BroadcastInput, BroadcastStatus, NotificationBroadcast } from '@/types/notificationBroadcast'
import { BroadcastComposerSheet } from '../components/BroadcastComposerSheet'

type Tab = BroadcastStatus

const TABS: { id: Tab; label: string }[] = [
  { id: 'borrador', label: 'Borradores' },
  { id: 'programada', label: 'Programadas' },
  { id: 'enviada', label: 'Enviadas' },
  { id: 'archivada', label: 'Archivadas' },
]

/** Centro de Notificaciones del Administrador (Sprint 13, Parte 9): difusión por audiencia, reutilizando el Event Bus. */
export function AdminNotificationsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('borrador')
  const [broadcasts, setBroadcasts] = useState<NotificationBroadcast[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [editingBroadcast, setEditingBroadcast] = useState<NotificationBroadcast | null>(null)

  const actor = user ? { id: user.id, name: user.name, role: user.role } : null

  const reload = useCallback(() => {
    setIsLoading(true)
    getBroadcastsAsync(tab)
      .then(setBroadcasts)
      .finally(() => setIsLoading(false))
  }, [tab])

  useEffect(reload, [reload])

  function openCreate() {
    setEditingBroadcast(null)
    setIsComposerOpen(true)
  }

  async function handleSubmit(input: BroadcastInput) {
    if (!actor) return
    await saveBroadcastDraftAsync(actor, input, editingBroadcast?.id)
    reload()
  }

  async function handleSendNow(broadcast: NotificationBroadcast) {
    if (!actor) return
    if (!window.confirm(`¿Enviar el aviso "${broadcast.title}" ahora?`)) return
    await sendBroadcastNowAsync(actor, broadcast.id)
    reload()
  }

  async function handleArchive(broadcast: NotificationBroadcast) {
    if (!actor) return
    await archiveBroadcastAsync(actor, broadcast.id)
    reload()
  }

  async function handleDelete(broadcast: NotificationBroadcast) {
    if (!actor) return
    if (!window.confirm(`¿Eliminar el aviso "${broadcast.title}"?`)) return
    await deleteBroadcastAsync(actor, broadcast.id)
    reload()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Notificaciones' }]}
        title="Centro de Notificaciones"
        subtitle="Difunde avisos institucionales por audiencia."
        actions={<Button onClick={openCreate}>Nuevo aviso</Button>}
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              tab === item.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <ListSkeleton variant="block" count={3} blockHeight="h-24" />
      ) : broadcasts.length === 0 ? (
        <EmptyState icon={Megaphone} title="Sin avisos aquí" description="Los avisos de esta categoría aparecerán aquí." />
      ) : (
        <div className="flex flex-col gap-3">
          {broadcasts.map((broadcast) => (
            <Card key={broadcast.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-foreground">{broadcast.title}</h3>
                    <Badge variant="outline">{AUDIENCE_LABELS[broadcast.audienceType]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{broadcast.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {broadcast.status === 'enviada' && broadcast.sentAt
                      ? `Enviado ${formatDateTime(broadcast.sentAt)}`
                      : broadcast.status === 'programada' && broadcast.scheduledFor
                        ? `Programado para ${formatDateTime(broadcast.scheduledFor)}`
                        : `Creado ${formatDateTime(broadcast.createdAt)}`}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Más opciones">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {broadcast.status !== 'enviada' ? (
                      <DropdownMenuItem
                        onSelect={() => {
                          setEditingBroadcast(broadcast)
                          setIsComposerOpen(true)
                        }}
                      >
                        <Pencil className="size-4" />
                        Editar
                      </DropdownMenuItem>
                    ) : null}
                    {broadcast.status !== 'enviada' ? (
                      <DropdownMenuItem onSelect={() => void handleSendNow(broadcast)}>
                        <Send className="size-4" />
                        Enviar ahora
                      </DropdownMenuItem>
                    ) : null}
                    {broadcast.status !== 'archivada' ? (
                      <DropdownMenuItem onSelect={() => void handleArchive(broadcast)}>
                        <Archive className="size-4" />
                        Archivar
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={() => void handleDelete(broadcast)}>
                      <Trash2 className="size-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}

      <BroadcastComposerSheet open={isComposerOpen} onOpenChange={setIsComposerOpen} broadcast={editingBroadcast} onSubmit={handleSubmit} />
    </div>
  )
}
