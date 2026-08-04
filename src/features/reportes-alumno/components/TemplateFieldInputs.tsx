import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TemplateField } from '@/types/reportTemplate'
import type { ReportFormErrors } from '../schemas/report-schema'

interface TemplateFieldInputsProps {
  fields: TemplateField[]
  values: Record<string, string>
  errors: ReportFormErrors
  onChange: (fieldId: string, value: string) => void
  readOnly?: boolean
}

/** Campos específicos de la plantilla (sección "Datos generales" ampliada). */
export function TemplateFieldInputs({ fields, values, errors, onChange, readOnly = false }: TemplateFieldInputsProps) {
  if (fields.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.id} className="flex flex-col gap-1.5">
          <Label htmlFor={`field-${field.id}`}>
            {field.label}
            {field.required ? <span className="text-destructive"> *</span> : null}
          </Label>
          <Input
            id={`field-${field.id}`}
            value={values[field.id] ?? ''}
            placeholder={field.placeholder}
            disabled={readOnly}
            aria-invalid={!!errors[`field.${field.id}`]}
            onChange={(event) => onChange(field.id, event.target.value)}
            className="h-10"
          />
          {errors[`field.${field.id}`] ? (
            <p className="text-xs text-destructive">{errors[`field.${field.id}`]}</p>
          ) : null}
        </div>
      ))}
    </div>
  )
}
