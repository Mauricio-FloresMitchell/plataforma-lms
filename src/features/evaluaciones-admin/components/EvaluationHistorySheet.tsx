import { useEffect, useState } from 'react'
import { History } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { EmptyState } from '@/components/EmptyState'
import { formatDateTime } from '@/utils/date'
import { getAuditLogAsync } from '@/services/audit.service'
import type { AuditLogEntry } from '@/types/audit'
import type { StudentEvaluation } from '@/types/evaluation'

interface EvaluationHistorySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  evaluation: StudentEvaluation | null
}

function hasId(value: unknown, id: string): boolean {
  return typeof value === 'object' && value !== null && 'id' in value && (value as { id?: string }).id === id
}

/** Historial de auditoría de una evaluación (Sprint 13, Parte 7): profesor/administrador, valor anterior, nuevo, motivo y fecha. */
export function EvaluationHistorySheet({ open, onOpenChange, evaluation }: EvaluationHistorySheetProps) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!open || !evaluation) return
    setIsLoading(true)
    getAuditLogAsync({ module: 'Evaluaciones' })
      .then((log) => setEntries(log.filter((entry) => hasId(entry.before, evaluation.id) || hasId(entry.after, evaluation.id))))
      .finally(() => setIsLoading(false))
  }, [open, evaluation])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Historial — {evaluation?.studentName}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-3 overflow-y-auto px-4 pb-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando historial…</p>
          ) : entries.length === 0 ? (
            <EmptyState icon={History} title="Sin cambios registrados" description="Esta evaluación no tiene ediciones por el Administrador." />
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-border p-3 text-sm">
                <p className="font-medium text-foreground">{entry.action}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {entry.userName} ({entry.role}) · {formatDateTime(entry.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
