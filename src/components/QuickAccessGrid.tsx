import { QuickAccessCard, type QuickAccessItem } from './QuickAccessCard'

interface QuickAccessGridProps {
  items: QuickAccessItem[]
}

/** Retícula responsive de accesos rápidos. */
export function QuickAccessGrid({ items }: QuickAccessGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <QuickAccessCard key={item.to} item={item} />
      ))}
    </div>
  )
}
