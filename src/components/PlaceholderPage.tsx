import { Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/EmptyState'
import { Breadcrumb, type BreadcrumbItem } from '@/components/Breadcrumb'
import { BackLink } from '@/components/BackLink'

interface PlaceholderPageProps {
  title: string
  description?: string
  icon?: LucideIcon
  /** Nota sobre integraciones futuras, si aplica. */
  futureNote?: string
  /** Ruta de retorno opcional. */
  backTo?: string
  /** Ruta de la migaja de pan. Si se omite, no se muestra. */
  breadcrumb?: BreadcrumbItem[]
}

/**
 * Pantalla placeholder reutilizable para módulos aún no implementados.
 * Preparada para conectarse a datos o integraciones en fases posteriores.
 */
export function PlaceholderPage({
  title,
  description,
  icon = Wrench,
  futureNote,
  backTo,
  breadcrumb,
}: PlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {breadcrumb ? <Breadcrumb items={breadcrumb} /> : null}
        {backTo ? <BackLink to={backTo}>Volver al inicio</BackLink> : null}
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <Badge variant="secondary">En construcción</Badge>
        </div>
        {description ? <p className="text-muted-foreground">{description}</p> : null}
      </div>

      <Card className="shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <EmptyState
            icon={icon}
            title="Disponible próximamente"
            description="Este módulo estará disponible en una próxima entrega."
            className="w-full border-none"
          />
          {futureNote ? (
            <p className="max-w-md text-center text-xs text-muted-foreground">{futureNote}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
