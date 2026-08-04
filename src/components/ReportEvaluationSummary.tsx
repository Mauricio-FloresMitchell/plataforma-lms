import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReportGradeBadge } from '@/components/ReportGradeBadge'
import { formatDateTime } from '@/utils/date'
import type { Badge as BadgeType } from '@/types/evaluation'
import type { ReportEvaluation } from '@/types/report'

interface ReportEvaluationSummaryProps {
  evaluation: ReportEvaluation
  /** Catálogo de insignias, para mostrar nombre e ícono de las otorgadas. */
  badges?: BadgeType[]
}

/**
 * Resumen de una evaluación ya registrada. Reutilizable por Alumno y Profesor.
 * Desde el Sprint 12, si la evaluación se generó con el motor de plantillas
 * (Rúbrica A/B), muestra también ese desglose e insignias otorgadas; las
 * evaluaciones previas (sin desglose) solo muestran letra y observaciones.
 */
export function ReportEvaluationSummary({ evaluation, badges = [] }: ReportEvaluationSummaryProps) {
  const hasRubric = evaluation.rubricA !== undefined && evaluation.rubricB !== undefined
  const earnedBadges = (evaluation.badgeIds ?? [])
    .map((id) => badges.find((badge) => badge.id === id))
    .filter((badge): badge is BadgeType => Boolean(badge))

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Evaluación Docente</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {hasRubric ? 'Porcentaje final (calculado automáticamente)' : 'Nivel'}
          </span>
          <ReportGradeBadge level={evaluation.level} percentage={evaluation.finalPercentage} />
        </div>

        {hasRubric ? (
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>Rúbrica A (70%): {evaluation.rubricA}%</span>
            <span>Rúbrica B (30%): {evaluation.rubricB}%</span>
            <span>Bonificación: +{evaluation.bonus ?? 0}</span>
          </div>
        ) : null}

        {earnedBadges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map((badge) => (
              <span key={badge.id} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
                <span>{badge.icon}</span>
                {badge.name}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">Retroalimentación</span>
          <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
            {evaluation.observations}
          </p>
        </div>

        <span className="text-xs text-muted-foreground/80">
          Evaluado el {formatDateTime(evaluation.evaluatedAt)}
        </span>
      </CardContent>
    </Card>
  )
}
