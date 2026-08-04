import { RotateCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/utils/date'
import type { ModerationLogEntry } from '@/types/forum'

interface ModerationLogRowProps {
  entry: ModerationLogEntry
  onRestore?: () => Promise<void> | void
}

const ACTION_LABELS: Record<ModerationLogEntry['action'], string> = {
  ignorar: 'Reporte ignorado',
  resolver: 'Reporte resuelto',
  eliminar_publicacion: 'Publicación eliminada',
  eliminar_comentario: 'Comentario eliminado',
  advertencia: 'Advertencia enviada',
  restaurar: 'Contenido restaurado',
}

const RESTORABLE_ACTIONS = new Set<ModerationLogEntry['action']>(['eliminar_publicacion', 'eliminar_comentario'])

/** Fila del historial de moderación. Permite restaurar contenido eliminado que aún no se ha restaurado. */
export function ModerationLogRow({ entry, onRestore }: ModerationLogRowProps) {
  const canRestore = RESTORABLE_ACTIONS.has(entry.action) && !entry.restoredAt

  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{ACTION_LABELS[entry.action]}</Badge>
          {entry.restoredAt ? <Badge className="bg-emerald-100 text-emerald-800">Restaurado</Badge> : null}
        </div>
        <p className="text-sm text-foreground">{entry.postTitle}</p>
        {entry.targetAuthorName ? (
          <p className="text-xs text-muted-foreground">Contenido de: {entry.targetAuthorName}</p>
        ) : null}
        {entry.note ? <p className="text-xs text-muted-foreground">Nota: {entry.note}</p> : null}
        <p className="text-xs text-muted-foreground/80">
          {entry.performedByName} · {formatDateTime(entry.createdAt)}
        </p>
        {canRestore ? (
          <div>
            <Button variant="outline" size="sm" className="h-8" onClick={onRestore}>
              <RotateCcw className="size-3.5" />
              Restaurar
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
