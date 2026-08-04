import { BellOff, CheckCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { SearchInput } from '@/components/SearchInput'
import { FilterChips, type FilterChipOption } from '@/components/FilterChips'
import { NOTIFICATION_CATEGORY_LABELS } from '@/types/notification'
import type { NotificationFilter } from '@/types/notification'
import { useNotifications } from '../hooks/useNotifications'
import { groupByRecency, NOTIFICATION_GROUP_LABELS } from '../utils/groupByRecency'
import { NotificationGroup } from './NotificationGroup'

const FILTER_OPTIONS: FilterChipOption[] = [
  { value: 'no_leidas', label: 'No leídas' },
  ...Object.entries(NOTIFICATION_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
]

interface NotificationDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Bandeja lateral del Centro de Notificaciones (Parte 1/2/10/11). Nunca navega a otra página. */
export function NotificationDrawer({ open, onOpenChange }: NotificationDrawerProps) {
  const {
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
  } = useNotifications()

  const groups = groupByRecency(filteredNotifications)
  const isEmpty = !isLoading && filteredNotifications.length === 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notificaciones{unreadCount > 0 ? ` (${unreadCount})` : ''}</SheetTitle>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => void markAllAsRead()}>
              <CheckCheck className="size-3.5" />
              Marcar todas como leídas
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => void removeAllRead()}>
              <Trash2 className="size-3.5" />
              Eliminar leídas
            </Button>
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-3 overflow-y-auto px-4 pb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar notificaciones…" />
          <FilterChips
            options={FILTER_OPTIONS}
            value={filter === 'todas' ? null : filter}
            onChange={(value) => setFilter((value as NotificationFilter | null) ?? 'todas')}
          />

          {isEmpty ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <BellOff className="size-8" />
              <p className="text-sm">No tienes notificaciones{search || filter !== 'todas' ? ' con este filtro' : ''}.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {(Object.keys(groups) as (keyof typeof groups)[]).map((key) => (
                <NotificationGroup
                  key={key}
                  label={NOTIFICATION_GROUP_LABELS[key]}
                  notifications={groups[key]}
                  onMarkAsRead={(id) => void markAsRead(id)}
                  onRemove={(id) => void removeNotification(id)}
                  onNavigate={() => onOpenChange(false)}
                />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
