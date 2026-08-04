import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ListSkeletonProps {
  /** Número de filas/tarjetas a mostrar mientras carga. */
  count?: number
  /** "row": tarjeta con 2 líneas de texto (listas de reportes, foro, etc.). "block": bloque simple (tarjetas de materias, evaluaciones, etc.). */
  variant?: 'row' | 'block'
  /** Alto del bloque cuando variant="block". */
  blockHeight?: string
}

/**
 * Estado de carga reutilizable para listados y tablas.
 * Reemplaza los esqueletos ad-hoc repetidos en cada feature.
 */
export function ListSkeleton({ count = 3, variant = 'row', blockHeight = 'h-24' }: ListSkeletonProps) {
  if (variant === 'block') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton key={index} className={blockHeight} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-4">
          <Skeleton className="mb-2 h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
        </Card>
      ))}
    </div>
  )
}
