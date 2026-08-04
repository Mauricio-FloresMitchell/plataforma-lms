import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { TemplateQuestion } from '@/types/reportTemplate'
import type { ReportFormErrors } from '../schemas/report-schema'

interface TemplateWeekQuestionsProps {
  questions: TemplateQuestion[]
  values: Record<string, string>
  errors: ReportFormErrors
  onChange: (questionId: string, value: string) => void
  readOnly?: boolean
}

/** Preguntas dinámicas de la semana seleccionada. El formulario muestra únicamente esta semana. */
export function TemplateWeekQuestions({ questions, values, errors, onChange, readOnly = false }: TemplateWeekQuestionsProps) {
  return (
    <div className="flex flex-col gap-5">
      {questions.map((question) => (
        <div key={question.id} className="flex flex-col gap-1.5">
          <Label htmlFor={`question-${question.id}`}>{question.label}</Label>
          <Textarea
            id={`question-${question.id}`}
            rows={4}
            value={values[question.id] ?? ''}
            placeholder={question.placeholder}
            disabled={readOnly}
            aria-invalid={!!errors[`answer.${question.id}`]}
            onChange={(event) => onChange(question.id, event.target.value)}
          />
          {errors[`answer.${question.id}`] ? (
            <p className="text-xs text-destructive">{errors[`answer.${question.id}`]}</p>
          ) : null}
        </div>
      ))}
    </div>
  )
}
