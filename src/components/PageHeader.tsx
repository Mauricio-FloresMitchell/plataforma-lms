import type { ReactNode } from 'react'
import { BackLink } from '@/components/BackLink'
import { Breadcrumb, type BreadcrumbItem } from '@/components/Breadcrumb'

interface PageHeaderProps {
  /** Ruta de la migaja de pan, del inicio a la página actual (el último ítem es la página actual). */
  breadcrumb: BreadcrumbItem[]
  /** Ruta a la que regresa el botón "Volver". Si se omite, no se muestra el botón. */
  backTo?: string
  backLabel?: string
  title: string
  subtitle?: string
  /** Acción alineada a la derecha del título (ej. botón "Nueva publicación"). */
  actions?: ReactNode
}

/**
 * Encabezado estándar de página: breadcrumb, botón "Volver" (opcional), título y subtítulo.
 * Se coloca al inicio del contenido de cada página para mantener una estructura consistente
 * en toda la plataforma (el Header y el Sidebar ya son compartidos por MainLayout/AppLayout).
 */
export function PageHeader({ breadcrumb, backTo, backLabel, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <Breadcrumb items={breadcrumb} />
      {backTo ? <BackLink to={backTo}>{backLabel}</BackLink> : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {subtitle ? <p className="mt-2 text-muted-foreground">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}
