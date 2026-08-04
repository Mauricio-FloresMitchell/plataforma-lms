import { History } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { EmptyState } from '@/components/EmptyState'
import { formatDateTime } from '@/utils/date'
import type { ManagedUser } from '@/types/userManagement'

interface UserHistorySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: ManagedUser | null
}

/** Historial de un usuario (Sprint 13, Parte 5). */
export function UserHistorySheet({ open, onOpenChange, user }: UserHistorySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Historial — {user?.name}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-3 overflow-y-auto px-4 pb-4">
          {!user || user.history.length === 0 ? (
            <EmptyState icon={History} title="Sin historial" description="Todavía no hay acciones registradas para este usuario." />
          ) : (
            user.history.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-border p-3 text-sm">
                <p className="font-medium text-foreground">{entry.action}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {entry.performedByName} · {formatDateTime(entry.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
