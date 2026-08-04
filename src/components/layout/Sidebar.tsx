import { NavLink } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavSection } from '@/types/nav'

interface SidebarProps {
  sections: NavSection[]
  brandLabel?: string
}

export function Sidebar({ sections, brandLabel = 'Imperalianz' }: SidebarProps) {
  return (
    <aside className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="hidden h-16 items-center gap-2 px-6 md:flex">
        <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <GraduationCap className="size-4.5" />
        </span>
        <span className="text-sm font-semibold tracking-tight">{brandLabel}</span>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
        {sections.map((section, index) => (
          <div key={section.label ?? index} className="flex flex-col gap-1">
            {section.label ? (
              <span className="px-3 pb-1 text-xs font-medium text-muted-foreground">
                {section.label}
              </span>
            ) : null}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
                  )
                }
              >
                <item.icon className="size-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
