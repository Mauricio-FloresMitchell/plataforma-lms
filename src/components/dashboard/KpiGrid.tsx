import { StatCard } from '@/components/StatCard'
import type { StatItem } from '@/types/dashboard'

interface KpiGridProps {
  items: StatItem[]
}

/** Retícula responsive de indicadores. La feature define qué KPIs mostrar. */
export function KpiGrid({ items }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <StatCard
          key={item.label}
          label={item.label}
          value={item.value}
          icon={item.icon}
          hint={item.hint}
        />
      ))}
    </div>
  )
}
