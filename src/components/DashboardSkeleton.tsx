import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardSkeletonProps {
  /** Número de tarjetas de KPI en la segunda fila. */
  kpiCount?: number
  /** "cards": tarjetas con título y 3 líneas de texto. "grid": tarjetas de ícono + 2 líneas (accesos rápidos). */
  bottomVariant?: 'cards' | 'grid'
  bottomCount?: number
}

/**
 * Estado de carga reutilizable para los tres dashboards (Alumno, Profesor,
 * Administrador), que comparten la misma retícula: bienvenida, KPIs y un
 * bloque inferior de tarjetas o accesos rápidos.
 */
export function DashboardSkeleton({
  kpiCount = 4,
  bottomVariant = 'cards',
  bottomCount = 3,
}: DashboardSkeletonProps) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-sm">
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-72" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-24" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: kpiCount }).map((_, index) => (
          <Card key={index} className="shadow-sm">
            <CardContent className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-7 w-12" />
              </div>
              <Skeleton className="size-9 rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>

      {bottomVariant === 'cards' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {Array.from({ length: bottomCount }).map((_, index) => (
            <Card key={index} className="shadow-sm">
              <CardContent className="flex flex-col gap-3 pt-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: bottomCount }).map((_, index) => (
            <Card key={index} className="shadow-sm">
              <CardContent className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-lg" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
