import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export interface QuickAccessItem {
  label: string
  description?: string
  icon: LucideIcon
  to: string
}

interface QuickAccessCardProps {
  item: QuickAccessItem
}

/** Tarjeta de acceso rápido que enlaza a una sección. Reutilizable por cualquier rol. */
export function QuickAccessCard({ item }: QuickAccessCardProps) {
  const { label, description, icon: Icon, to } = item

  return (
    <Link to={to} className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
      <Card className="shadow-sm transition-colors group-hover:border-primary/40 group-hover:bg-accent/40">
        <CardContent className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Icon className="size-4.5" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-foreground">{label}</span>
            {description ? (
              <span className="truncate text-xs text-muted-foreground">{description}</span>
            ) : null}
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </CardContent>
      </Card>
    </Link>
  )
}
