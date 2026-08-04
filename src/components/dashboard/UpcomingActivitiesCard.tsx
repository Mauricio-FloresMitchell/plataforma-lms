import { CalendarClock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/EmptyState'
import { daysUntil, formatDateTime } from '@/utils/date'
import type { UpcomingActivityItem } from '@/types/dashboard'

interface UpcomingActivitiesCardProps {
  items: UpcomingActivityItem[]
  title?: string
}

function dueLabel(dueDate: string): string {
  const days = daysUntil(dueDate)
  if (days < 0) return 'Vencida'
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Mañana'
  return `En ${days} días`
}

/** Entregas próximas ordenadas por cercanía. Reutilizable por cualquier rol. */
export function UpcomingActivitiesCard({
  items,
  title = 'Próximas actividades',
}: UpcomingActivitiesCardProps) {
  const sorted = [...items].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  )

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        {sorted.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Sin actividades próximas"
            description="No hay entregas programadas por ahora."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {sorted.map((item) => {
              const days = daysUntil(item.dueDate)
              return (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium text-foreground">
                      {item.title}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">{item.subtitle}</span>
                    <span className="text-xs text-muted-foreground/80">
                      {formatDateTime(item.dueDate)}
                    </span>
                  </div>
                  <Badge variant={days <= 1 ? 'default' : 'secondary'} className="shrink-0">
                    {dueLabel(item.dueDate)}
                  </Badge>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
