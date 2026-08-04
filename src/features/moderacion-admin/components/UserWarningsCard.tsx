import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/utils/date'
import type { UserModerationStatus, UserWarning } from '@/types/forum'

interface UserWarningsCardProps {
  status: UserModerationStatus
  warnings: UserWarning[]
}

const ROLE_LABELS = { alumno: 'Alumno', profesor: 'Profesor', administrador: 'Administrador' } as const

/** Usuario con advertencias: conteo y detalle de cada mensaje recibido. */
export function UserWarningsCard({ status, warnings }: UserWarningsCardProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">{status.userName}</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABELS[status.role]}</p>
          </div>
          <Badge className="bg-amber-100 text-amber-800">
            {status.warningsCount} advertencia{status.warningsCount === 1 ? '' : 's'}
          </Badge>
        </div>

        <ul className="flex flex-col gap-2 border-t border-border pt-3">
          {warnings.map((warning) => (
            <li key={warning.id} className="text-sm">
              <p className="text-foreground">{warning.message}</p>
              <p className="text-xs text-muted-foreground/80">
                {warning.issuedByName} · {formatDateTime(warning.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
