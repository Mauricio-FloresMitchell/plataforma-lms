import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CompetencyEvaluator } from '@/components/CompetencyEvaluator'
import { percentageToLevel } from '@/utils/grade'
import type { Competency, FeedbackStatus, StudentEvaluation } from '@/types/evaluation'

interface EvaluationEditSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  evaluation: StudentEvaluation | null
  onSubmit: (competencies: Competency[], feedback: string | undefined, status: FeedbackStatus, reason: string) => Promise<void>
}

const STATUS_OPTIONS: { value: FeedbackStatus; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'publicada', label: 'Publicada' },
]

/** Edición de evaluación por el Administrador (Sprint 13, Parte 7): motivo obligatorio, siempre auditada. */
export function EvaluationEditSheet({ open, onOpenChange, evaluation, onSubmit }: EvaluationEditSheetProps) {
  const [competencies, setCompetencies] = useState<Competency[]>([])
  const [feedback, setFeedback] = useState('')
  const [status, setStatus] = useState<FeedbackStatus>('pendiente')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open || !evaluation) return
    setCompetencies(evaluation.competencies)
    setFeedback(evaluation.feedback ?? '')
    setStatus(evaluation.status)
    setReason('')
  }, [open, evaluation])

  function handlePercentageChange(competencyId: string, percentage: number) {
    setCompetencies((current) =>
      current.map((item) => (item.id === competencyId ? { ...item, percentage, currentLevel: percentageToLevel(percentage) } : item)),
    )
  }

  const isValid = reason.trim().length > 0

  async function handleSubmit() {
    if (!isValid) return
    setIsSubmitting(true)
    try {
      await onSubmit(competencies, feedback.trim() || undefined, status, reason.trim())
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Editar evaluación — {evaluation?.studentName}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4">
          <CompetencyEvaluator competencies={competencies} onPercentageChange={handlePercentageChange} />

          <div className="flex flex-col gap-1.5">
            <Label>Retroalimentación</Label>
            <Textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} rows={3} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Estado</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as FeedbackStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Motivo del cambio (obligatorio, queda en auditoría)</Label>
            <Textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} placeholder="Ej. Corrección solicitada por el alumno vía Rectoría." />
          </div>

          <Button onClick={() => void handleSubmit()} disabled={isSubmitting || !isValid}>
            {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
