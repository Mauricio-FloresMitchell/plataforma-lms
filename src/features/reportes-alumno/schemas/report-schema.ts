import type { ReportEvidence, ReportLink } from '@/types/report'
import type { ReportTemplate, WeekNumber } from '@/types/reportTemplate'

/**
 * Validación del formulario dinámico de Reportes (Sprint 12).
 *
 * A diferencia del resto de formularios del proyecto (React Hook Form + Zod
 * con un esquema estático), aquí los campos y preguntas varían por plantilla:
 * el esquema no puede conocerse en tiempo de compilación. En su lugar, esta
 * función construye las reglas de validación a partir de la propia
 * `ReportTemplate` en tiempo de ejecución — así el motor sigue siendo
 * "renderizado y validado desde la definición", sin condicionales por carrera.
 */

export interface DynamicReportFormValues {
  subjectId: string
  week: WeekNumber
  fieldValues: Record<string, string>
  answers: Record<string, string>
  titulacionIntegration: string
  anonymizationConfirmed: boolean
  evidences: ReportEvidence[]
  links: ReportLink[]
}

export type ReportFormErrors = Partial<Record<string, string>>

const TITULACION_MIN_LENGTH = 20

export function validateReportForm(
  template: ReportTemplate,
  values: DynamicReportFormValues,
): ReportFormErrors {
  const errors: ReportFormErrors = {}

  if (!values.subjectId) {
    errors.subjectId = 'Selecciona una materia.'
  }

  for (const field of template.specificFields) {
    if (field.required && !values.fieldValues[field.id]?.trim()) {
      errors[`field.${field.id}`] = `Completa "${field.label}".`
    }
  }

  const weekQuestions = template.weeklyQuestions[values.week] ?? []
  for (const question of weekQuestions) {
    const value = values.answers[question.id]?.trim() ?? ''
    if (value.length < question.minLength) {
      errors[`answer.${question.id}`] = `Responde con al menos ${question.minLength} caracteres.`
    }
  }

  if (!values.titulacionIntegration.trim() || values.titulacionIntegration.trim().length < TITULACION_MIN_LENGTH) {
    errors.titulacionIntegration = `Explica la integración a tu producto de titulación (mínimo ${TITULACION_MIN_LENGTH} caracteres).`
  }

  if (template.requiresAnonymization && !values.anonymizationConfirmed) {
    errors.anonymizationConfirmed = 'Debes confirmar que no incluiste datos personales identificables.'
  }

  if (template.filesRequired && values.evidences.length === 0 && values.links.length === 0) {
    errors.attachments = 'Adjunta al menos un archivo o enlace como evidencia.'
  }

  return errors
}

export function createEmptyFormValues(subjectId = '', week: WeekNumber = 1): DynamicReportFormValues {
  return {
    subjectId,
    week,
    fieldValues: {},
    answers: {},
    titulacionIntegration: '',
    anonymizationConfirmed: false,
    evidences: [],
    links: [],
  }
}
