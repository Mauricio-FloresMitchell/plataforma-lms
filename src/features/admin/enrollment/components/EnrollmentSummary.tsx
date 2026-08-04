import { Card } from '@/components/ui/card'
import { PERIODOS_LICENCIATURA } from '../types/enrollment'
import type { EnrollmentFormValues } from '../schemas/enrollment-schema'

interface EnrollmentSummaryProps {
  data: Partial<EnrollmentFormValues>
}

/** Resumen de solo lectura mostrado en el último paso, antes de registrar. */
export function EnrollmentSummary({ data }: EnrollmentSummaryProps) {
  const rows: { label: string; value: string }[] = [
    { label: 'Nombre completo', value: data.nombreCompleto || '—' },
    { label: 'Correo electrónico', value: data.correo || '—' },
    { label: 'Teléfono', value: data.telefono || '—' },
    { label: 'Programa', value: data.programaGrupo || '—' },
  ]

  if (data.programaGrupo === 'Prepa') {
    rows.push({ label: 'Modalidad', value: data.modalidadPrepa || '—' })
    rows.push({
      label: 'Periodo',
      value: data.modalidadPrepa === 'Curso' ? data.periodoCurso || '—' : 'No aplica',
    })
  } else if (data.programaGrupo === 'Licenciatura') {
    rows.push({ label: 'Carrera', value: data.carrera || '—' })
    const periodoLabel = PERIODOS_LICENCIATURA.find(
      (p) => p.value === data.periodoLicenciatura,
    )?.label
    rows.push({ label: 'Periodo', value: periodoLabel || '—' })
  }

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold mb-4">Revisa la información antes de registrar</h3>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs text-muted-foreground">{row.label}</dt>
            <dd className="mt-0.5 text-sm font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
