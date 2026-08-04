import { ShieldCheck } from 'lucide-react'
import type { WeeklyReport } from '@/types/report'
import type { ReportTemplate } from '@/types/reportTemplate'

interface ReportTemplateAnswersProps {
  report: WeeklyReport
  template: ReportTemplate
}

/**
 * Vista de solo lectura del contenido de un reporte creado con el motor de
 * plantillas (Sprint 12): campos específicos, preguntas de la semana enviada
 * e integración al producto de titulación. El Profesor ve exactamente esta
 * misma vista al revisar el reporte (compuesta dentro de `ReportContentCard`).
 */
export function ReportTemplateAnswers({ report, template }: ReportTemplateAnswersProps) {
  const week = report.week as 1 | 2 | 3 | 4
  const questions = template.weeklyQuestions[week] ?? []

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{template.name}</span> · Producto de titulación:{' '}
        {template.titulacionProduct}
      </p>

      {template.specificFields.length > 0 ? (
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {template.specificFields.map((field) => {
            const value = report.fieldValues?.find((item) => item.fieldId === field.id)?.value
            return (
              <div key={field.id}>
                <dt className="text-xs text-muted-foreground">{field.label}</dt>
                <dd className="text-sm text-foreground">{value || '—'}</dd>
              </div>
            )
          })}
        </dl>
      ) : null}

      {questions.length > 0 ? (
        <div className="flex flex-col gap-3">
          {questions.map((question) => {
            const value = report.answers?.find((item) => item.questionId === question.id)?.value
            return (
              <div key={question.id}>
                <p className="text-sm font-medium text-foreground">{question.label}</p>
                <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{value || '—'}</p>
              </div>
            )
          })}
        </div>
      ) : null}

      {report.titulacionIntegration ? (
        <div>
          <p className="text-sm font-medium text-foreground">Integración al producto de titulación</p>
          <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
            {report.titulacionIntegration}
          </p>
        </div>
      ) : null}

      {template.requiresAnonymization && report.anonymizationConfirmed ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          El alumno confirmó no incluir datos personales identificables.
        </p>
      ) : null}
    </div>
  )
}
