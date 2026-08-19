import { COMPANY_SEMAPHORE_LABELS, type CompanySemaphore } from '@/utils/companyStatus'
import { formatRelativeToNow } from '@/utils/date'

interface CompanySemaphoreBadgeProps {
  semaphore: CompanySemaphore
  lastReportSubmittedAt?: string
}

const DOT_CLASSNAME: Record<CompanySemaphore, string> = {
  verde: 'bg-emerald-500',
  amarillo: 'bg-amber-500',
  rojo: 'bg-red-500',
  azul: 'bg-sky-500',
}

const TEXT_CLASSNAME: Record<CompanySemaphore, string> = {
  verde: 'text-emerald-700',
  amarillo: 'text-amber-700',
  rojo: 'text-red-700',
  azul: 'text-sky-700',
}

/** Semáforo de Empresa del roster del Profesor (Manual de Mejoras Transversales): salud de la relación alumno-empresa, visible de un vistazo. */
export function CompanySemaphoreBadge({ semaphore, lastReportSubmittedAt }: CompanySemaphoreBadgeProps) {
  const detail =
    semaphore === 'azul'
      ? undefined
      : lastReportSubmittedAt
        ? `Último reporte ${formatRelativeToNow(lastReportSubmittedAt)}`
        : 'Sin reportes entregados todavía'

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${TEXT_CLASSNAME[semaphore]}`}
      title={detail}
    >
      <span className={`size-2 shrink-0 rounded-full ${DOT_CLASSNAME[semaphore]}`} aria-hidden="true" />
      {COMPANY_SEMAPHORE_LABELS[semaphore]}
    </span>
  )
}
