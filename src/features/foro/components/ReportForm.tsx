import { useState } from 'react'
import { Flag, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FORUM_REPORT_REASONS, FORUM_REPORT_REASON_LABELS } from '@/types/forum'
import type { ForumReportReason } from '@/types/forum'

interface ReportFormProps {
  onSubmit: (reason: ForumReportReason, description?: string) => Promise<void> | void
  onCancel: () => void
}

/** Formulario inline de "Reportar" (publicación o comentario). Motivo del catálogo cerrado; descripción obligatoria solo si es "Otro". */
export function ReportForm({ onSubmit, onCancel }: ReportFormProps) {
  const [reason, setReason] = useState<ForumReportReason | ''>('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!reason) {
      setError('Selecciona un motivo.')
      return
    }
    if (reason === 'otro' && description.trim().length < 5) {
      setError('Describe brevemente el motivo (mínimo 5 caracteres).')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit(reason, reason === 'otro' ? description.trim() : undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
      <Select value={reason} onValueChange={(value) => setReason(value as ForumReportReason)}>
        <SelectTrigger className="h-9 w-full sm:w-64">
          <SelectValue placeholder="Selecciona un motivo" />
        </SelectTrigger>
        <SelectContent>
          {FORUM_REPORT_REASONS.map((item) => (
            <SelectItem key={item} value={item}>
              {FORUM_REPORT_REASON_LABELS[item]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {reason === 'otro' ? (
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe el motivo del reporte…"
          rows={2}
        />
      ) : null}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="destructive" className="h-8" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <Flag className="size-3.5" />}
          Enviar reporte
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-8" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
