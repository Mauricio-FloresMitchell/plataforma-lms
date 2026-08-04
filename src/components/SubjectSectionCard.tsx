import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface SubjectSectionCardProps {
  title: string
  icon: LucideIcon
  isEmpty?: boolean
  emptyMessage?: string
  children?: React.ReactNode
  /** Acción alineada a la derecha del encabezado (ej. botón "Nueva actividad"). */
  actions?: React.ReactNode
}

export function SubjectSectionCard({
  title,
  icon: Icon,
  isEmpty = false,
  emptyMessage = 'No hay elementos disponibles',
  children,
  actions,
}: SubjectSectionCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        {actions}
      </div>

      {isEmpty ? (
        <p className="text-sm text-muted-foreground text-center py-8">{emptyMessage}</p>
      ) : (
        children
      )}
    </Card>
  )
}
