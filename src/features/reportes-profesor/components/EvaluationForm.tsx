import { useState } from 'react'
import { Check, Loader2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BadgeList } from '@/components/BadgeList'
import { ReportGradeBadge } from '@/components/ReportGradeBadge'
import { calculateFinalPercentage, percentageToReportLevel } from '@/utils/reportGrade'
import type { Badge as BadgeType } from '@/types/evaluation'
import type { EvaluateReportInput, ReviewDecision } from '@/types/report'

interface EvaluationFormProps {
  badges: BadgeType[]
  onSubmit: (values: EvaluateReportInput) => Promise<void>
}

/**
 * Bloque "Evaluación Docente" (Sprint 12): Rúbrica A (70%) + Rúbrica B (30%)
 * + bonificación, con porcentaje final y letra calculados automáticamente
 * (escala A/B/C/D/F, ADR-008) — el profesor nunca captura la letra a mano.
 */
export function EvaluationForm({ badges, onSubmit }: EvaluationFormProps) {
  const [rubricA, setRubricA] = useState(0)
  const [rubricB, setRubricB] = useState(0)
  const [bonus, setBonus] = useState(0)
  const [selectedBadges, setSelectedBadges] = useState<string[]>([])
  const [observations, setObservations] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const finalPercentage = calculateFinalPercentage(rubricA, rubricB, bonus)
  const finalLevel = percentageToReportLevel(finalPercentage)

  function toggleBadge(badgeId: string) {
    setSelectedBadges((prev) => (prev.includes(badgeId) ? prev.filter((id) => id !== badgeId) : [...prev, badgeId]))
  }

  async function submitWith(decision: ReviewDecision) {
    if (observations.trim().length < 5) {
      setError('Escribe una retroalimentación (mínimo 5 caracteres).')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit({ rubricA, rubricB, bonus, badgeIds: selectedBadges, observations, decision })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rubricA">Rúbrica A (70%)</Label>
          <Input
            id="rubricA"
            type="number"
            min={0}
            max={100}
            value={rubricA}
            onChange={(event) => setRubricA(Math.max(0, Math.min(100, Number(event.target.value) || 0)))}
            className="h-10"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rubricB">Rúbrica B (30%)</Label>
          <Input
            id="rubricB"
            type="number"
            min={0}
            max={100}
            value={rubricB}
            onChange={(event) => setRubricB(Math.max(0, Math.min(100, Number(event.target.value) || 0)))}
            className="h-10"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bonus">Bonificación (puntos)</Label>
          <Input
            id="bonus"
            type="number"
            min={0}
            max={10}
            value={bonus}
            onChange={(event) => setBonus(Math.max(0, Math.min(10, Number(event.target.value) || 0)))}
            className="h-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Porcentaje final (calculado automáticamente)</span>
        <ReportGradeBadge level={finalLevel} percentage={finalPercentage} />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Insignias</Label>
        <BadgeList badges={badges} selectable selectedBadgeIds={selectedBadges} onBadgeToggle={toggleBadge} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="observations">Retroalimentación</Label>
        <Textarea
          id="observations"
          rows={5}
          placeholder="Retroalimentación para el alumno…"
          value={observations}
          onChange={(event) => setObservations(event.target.value)}
        />
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" className="h-10" disabled={isSubmitting} onClick={() => submitWith('aprobado')}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          Aprobar reporte
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10"
          disabled={isSubmitting}
          onClick={() => submitWith('correcciones')}
        >
          <RotateCcw className="size-4" />
          Solicitar corrección
        </Button>
      </div>
    </div>
  )
}
