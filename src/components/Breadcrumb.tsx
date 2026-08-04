import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  /** Ruta del segmento. Si se omite, se renderiza como el paso actual (sin enlace). */
  to?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

/** Ruta de navegación (Inicio > Sección > Página actual) para ubicar al usuario dentro de la plataforma. */
export function Breadcrumb({ items }: BreadcrumbProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 ? <ChevronRight className="size-3.5 shrink-0" /> : null}
            {item.to && !isLast ? (
              <Link to={item.to} className="truncate transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span
                className="truncate font-medium text-foreground"
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
