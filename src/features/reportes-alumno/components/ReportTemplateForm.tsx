import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SubjectOption } from '@/mocks/reports'
import type { CreateReportInput } from '@/types/report'
import { WEEK_NUMBERS, type ReportTemplate, type WeekNumber } from '@/types/reportTemplate'
import { TemplateFieldInputs } from './TemplateFieldInputs'
import { TemplateWeekQuestions } from './TemplateWeekQuestions'
import { ReportAttachmentsSection } from './ReportAttachmentsSection'
import { createEmptyFormValues, validateReportForm, type DynamicReportFormValues } from '../schemas/report-schema'

interface ReportTemplateFormProps {
  subjects: SubjectOption[]
  templates: ReportTemplate[]
  onSubmit: (values: CreateReportInput) => Promise<void> | void
}

/**
 * Formulario dinámico de Reportes (Sprint 12): se renderiza automáticamente
 * a partir de la `ReportTemplate` de la materia elegida — sin condicionales
 * por carrera — y muestra únicamente las preguntas de la semana seleccionada.
 */
export function ReportTemplateForm({ subjects, templates, onSubmit }: ReportTemplateFormProps) {
  const [values, setValues] = useState<DynamicReportFormValues>(createEmptyFormValues())
  const [errors, setErrors] = useState<ReturnType<typeof validateReportForm>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const subject = subjects.find((item) => item.id === values.subjectId)
  const template = subject ? templates.find((item) => item.id === subject.templateId) : undefined

  function selectSubject(subjectId: string) {
    setValues(createEmptyFormValues(subjectId))
    setErrors({})
  }

  function update<K extends keyof DynamicReportFormValues>(key: K, value: DynamicReportFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!template) return

    const validationErrors = validateReportForm(template, values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const input: CreateReportInput = {
        subjectId: values.subjectId,
        templateId: template.id,
        week: values.week,
        fieldValues: Object.entries(values.fieldValues).map(([fieldId, value]) => ({ fieldId, value })),
        answers: Object.entries(values.answers).map(([questionId, value]) => ({ questionId, value })),
        titulacionIntegration: values.titulacionIntegration,
        anonymizationConfirmed: values.anonymizationConfirmed,
        evidences: values.evidences,
        links: values.links,
      }
      await onSubmit(input)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subjectId">Materia</Label>
        <Select value={values.subjectId} onValueChange={selectSubject}>
          <SelectTrigger id="subjectId" className="h-10 w-full sm:w-80" aria-invalid={!!errors.subjectId}>
            <SelectValue placeholder="Selecciona una materia" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.subjectId ? <p className="text-xs text-destructive">{errors.subjectId}</p> : null}
      </div>

      {template ? (
        <>
          <Alert>
            <AlertDescription>
              <span className="font-medium text-foreground">{template.name}</span> · Producto de titulación:{' '}
              {template.titulacionProduct}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-1.5 sm:w-48">
            <Label htmlFor="week">Semana</Label>
            <Select value={String(values.week)} onValueChange={(value) => update('week', Number(value) as WeekNumber)}>
              <SelectTrigger id="week" className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEEK_NUMBERS.map((week) => (
                  <SelectItem key={week} value={String(week)}>
                    Semana {week}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TemplateFieldInputs
            fields={template.specificFields}
            values={values.fieldValues}
            errors={errors}
            onChange={(fieldId, value) => update('fieldValues', { ...values.fieldValues, [fieldId]: value })}
          />

          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-foreground">Preguntas · Semana {values.week}</h2>
            <TemplateWeekQuestions
              questions={template.weeklyQuestions[values.week]}
              values={values.answers}
              errors={errors}
              onChange={(questionId, value) => update('answers', { ...values.answers, [questionId]: value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="titulacionIntegration">Integración al producto de titulación</Label>
            <p className="text-xs text-muted-foreground">{template.titulacionHelpText}</p>
            <Textarea
              id="titulacionIntegration"
              rows={4}
              value={values.titulacionIntegration}
              aria-invalid={!!errors.titulacionIntegration}
              onChange={(event) => update('titulacionIntegration', event.target.value)}
            />
            {errors.titulacionIntegration ? (
              <p className="text-xs text-destructive">{errors.titulacionIntegration}</p>
            ) : null}
          </div>

          {template.requiresAnonymization ? (
            <div className="flex flex-col gap-1.5">
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={values.anonymizationConfirmed}
                  onChange={(event) => update('anonymizationConfirmed', event.target.checked)}
                  className="mt-0.5 size-4 rounded border-border"
                />
                Confirmo que no incluí nombres completos ni datos personales identificables del cliente o paciente;
                usé únicamente iniciales o un identificador de caso.
              </label>
              {errors.anonymizationConfirmed ? (
                <p className="text-xs text-destructive">{errors.anonymizationConfirmed}</p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-foreground">Adjuntos</h2>
            <ReportAttachmentsSection
              evidences={values.evidences}
              links={values.links}
              errors={errors}
              onAddEvidence={(evidence) => update('evidences', [...values.evidences, evidence])}
              onRemoveEvidence={(id) => update('evidences', values.evidences.filter((item) => item.id !== id))}
              onAddLink={(link) => update('links', [...values.links, link])}
              onRemoveLink={(id) => update('links', values.links.filter((item) => item.id !== id))}
            />
          </div>

          <Button type="submit" className="h-10 w-fit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enviando…
              </>
            ) : (
              'Enviar reporte'
            )}
          </Button>
        </>
      ) : null}
    </form>
  )
}
