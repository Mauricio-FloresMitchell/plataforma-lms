import { Bell, Info, TriangleAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/EmptyState'
import { cn } from '@/lib/utils'
import { formatShortDate } from '@/utils/date'
import type { Announcement } from '@/types/dashboard'

interface AnnouncementsCardProps {
  items: Announcement[]
}

/** Avisos institucionales. Reutilizable por cualquier rol. */
export function AnnouncementsCard({ items }: AnnouncementsCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Avisos</CardTitle>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Sin avisos"
            description="No hay comunicados por el momento."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => {
              const isWarning = item.level === 'warning'
              const Icon = isWarning ? TriangleAlert : Info
              return (
                <li
                  key={item.id}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-3',
                    isWarning ? 'border-primary/30 bg-accent/60' : 'border-border bg-muted/40',
                  )}
                >
                  <Icon
                    className={cn(
                      'mt-0.5 size-4 shrink-0',
                      isWarning ? 'text-primary' : 'text-muted-foreground',
                    )}
                  />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.body}</span>
                    <span className="text-xs text-muted-foreground/80">
                      {formatShortDate(item.date)}
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
