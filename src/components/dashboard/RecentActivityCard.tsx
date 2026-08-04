import { Award, FileCheck2, History, MessageSquare, Target } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/EmptyState'
import { formatRelativeToNow } from '@/utils/date'
import type { ActivityKind, RecentActivityItem } from '@/types/dashboard'

interface RecentActivityCardProps {
  items: RecentActivityItem[]
  title?: string
}

const ACTIVITY_ICONS: Record<ActivityKind, LucideIcon> = {
  report: FileCheck2,
  badge: Award,
  feedback: MessageSquare,
  evaluation: Target,
}

/** Bitácora de movimientos recientes. Reutilizable por cualquier rol. */
export function RecentActivityCard({
  items,
  title = 'Actividad reciente',
}: RecentActivityCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={History}
            title="Sin actividad reciente"
            description="Los movimientos más recientes aparecerán aquí."
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {items.map((item) => {
              const Icon = ACTIVITY_ICONS[item.kind]
              return (
                <li key={item.id} className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="size-4" />
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                    <span className="text-xs text-muted-foreground/80">
                      {formatRelativeToNow(item.date)}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
