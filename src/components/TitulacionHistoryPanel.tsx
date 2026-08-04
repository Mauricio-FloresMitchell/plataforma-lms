import { Card } from '@/components/ui/card'
import type { TitulacionHistoryEntry } from '@/types/titulacion'

const ACTION_LABEL: Record<TitulacionHistoryEntry['action'], string> = {
  creo: 'creó el proyecto',
  modifico: 'modificó',
  comento: 'comentó',
  aprobo: 'aprobó',
  rechazo: 'rechazó',
  descargo: 'descargó',
  publico: 'publicó',
  subio_archivo: 'subió un archivo',
  sincronizo: 'sincronizó automáticamente',
  reasigno_profesor: 'reasignó al profesor',
  desbloqueo_fase: 'desbloqueó una fase',
  edito_estado: 'editó el estado',
  cerro_producto: 'cerró el producto',
  exporto: 'exportó',
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/** Historial global del Producto de Titulación (Sprint 18, Parte 11): quién, qué, cuándo, desde dónde. */
export function TitulacionHistoryPanel({ entries }: { entries: TitulacionHistoryEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin actividad registrada todavía.</p>
  }

  const sorted = [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <Card className="divide-y divide-border">
      {sorted.map((entry) => (
        <div key={entry.id} className="p-3 text-sm">
          <p>
            <span className="font-medium">{entry.actorName}</span> {ACTION_LABEL[entry.action]}
            {entry.detail ? <span className="text-muted-foreground"> — {entry.detail}</span> : null}
          </p>
          <p className="text-xs text-muted-foreground">{formatDateTime(entry.createdAt)} · {entry.source}</p>
        </div>
      ))}
    </Card>
  )
}
