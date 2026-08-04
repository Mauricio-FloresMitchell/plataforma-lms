import { useState } from 'react'
import { AlertTriangle, Check, EyeOff, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/utils/date'
import { FORUM_REPORT_REASON_LABELS } from '@/types/forum'
import type { ForumReport } from '@/types/forum'
import { WarningForm } from './WarningForm'

interface ReportCardProps {
  report: ForumReport
  readOnly?: boolean
  onIgnore?: () => Promise<void> | void
  onResolve?: () => Promise<void> | void
  onDeleteContent?: () => Promise<void> | void
  onWarn?: (message: string) => Promise<void> | void
}

const STATUS_LABELS: Record<ForumReport['status'], { label: string; className: string }> = {
  pendiente: { label: 'Pendiente', className: 'bg-secondary text-secondary-foreground' },
  resuelto: { label: 'Resuelto', className: 'bg-emerald-100 text-emerald-800' },
  ignorado: { label: 'Ignorado', className: 'bg-slate-200 text-slate-700' },
}

const TARGET_LABELS = { post: 'Publicación', comment: 'Comentario', reply: 'Respuesta' } as const

/** Tarjeta de un reporte del Foro, con acciones de moderación cuando `readOnly` es falso. */
export function ReportCard({ report, readOnly = false, onIgnore, onResolve, onDeleteContent, onWarn }: ReportCardProps) {
  const [showWarningForm, setShowWarningForm] = useState(false)
  const status = STATUS_LABELS[report.status]

  async function handleWarn(message: string) {
    await onWarn?.(message)
    setShowWarningForm(false)
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{TARGET_LABELS[report.targetType]}</Badge>
          <Badge variant="secondary">{FORUM_REPORT_REASON_LABELS[report.reason]}</Badge>
          <Badge className={status.className}>{status.label}</Badge>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">{report.postTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">"{report.contentExcerpt}"</p>
          <p className="mt-1 text-xs text-muted-foreground">Autor: {report.contentAuthorName}</p>
        </div>

        {report.description ? (
          <p className="text-sm text-muted-foreground">Descripción: {report.description}</p>
        ) : null}

        <p className="text-xs text-muted-foreground/80">
          Reportado por {report.reportedByName} el {formatDateTime(report.createdAt)}
        </p>

        {report.status !== 'pendiente' ? (
          <p className="text-xs text-muted-foreground/80">
            {status.label} por {report.resolvedByName} el {report.resolvedAt ? formatDateTime(report.resolvedAt) : ''}
          </p>
        ) : null}

        {!readOnly ? (
          <div className="flex flex-wrap gap-2 border-t border-border pt-3">
            <Button variant="outline" size="sm" className="h-8" onClick={onIgnore}>
              <EyeOff className="size-3.5" />
              Ignorar
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={onResolve}>
              <Check className="size-3.5" />
              Marcar como resuelto
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-destructive hover:text-destructive"
              onClick={onDeleteContent}
            >
              <Trash2 className="size-3.5" />
              Eliminar {report.targetType === 'post' ? 'publicación' : 'comentario'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-amber-700 hover:text-amber-700"
              onClick={() => setShowWarningForm((current) => !current)}
            >
              <AlertTriangle className="size-3.5" />
              Enviar advertencia
            </Button>
          </div>
        ) : null}

        {showWarningForm ? <WarningForm onSubmit={handleWarn} onCancel={() => setShowWarningForm(false)} /> : null}
      </CardContent>
    </Card>
  )
}
