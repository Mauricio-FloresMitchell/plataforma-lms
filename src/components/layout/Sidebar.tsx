import { NavLink } from 'react-router-dom'
import { GraduationCap, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { NavSection } from '@/types/nav'

interface SidebarProps {
  sections: NavSection[]
  brandLabel?: string
  /** Retraída a solo iconos. Si se omite, la barra siempre se muestra expandida (uso en el drawer móvil). */
  collapsed?: boolean
  /** Presente solo en la barra fija de escritorio: muestra el botón para expandir/retraer. */
  onToggleCollapse?: () => void
}

export function Sidebar({ sections, brandLabel = 'Imperalianz', collapsed = false, onToggleCollapse }: SidebarProps) {
  return (
    <aside className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
      <div className={cn('hidden h-16 items-center px-3 md:flex', collapsed ? 'justify-center' : 'justify-between gap-2 px-6')}>
        {collapsed ? null : (
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <GraduationCap className="size-4.5" />
            </span>
            <span className="text-sm font-semibold tracking-tight">{brandLabel}</span>
          </div>
        )}
        {onToggleCollapse ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expandir barra lateral' : 'Retraer barra lateral'}
            title={collapsed ? 'Expandir barra lateral' : 'Retraer barra lateral'}
          >
            {collapsed ? <PanelLeftOpen className="size-4.5" /> : <PanelLeftClose className="size-4.5" />}
          </Button>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
        {sections.map((section, index) => (
          <div key={section.label ?? index} className="flex flex-col gap-1">
            {section.label && !collapsed ? (
              <span className="px-3 pb-1 text-xs font-medium text-muted-foreground">
                {section.label}
              </span>
            ) : null}
            {index > 0 && collapsed ? <div className="mx-2 mb-1 border-t border-sidebar-border" /> : null}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    collapsed && 'justify-center px-0',
                    isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
                  )
                }
              >
                <item.icon className="size-4 shrink-0" />
                {collapsed ? null : item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
