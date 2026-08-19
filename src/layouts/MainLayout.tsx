import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { User } from '@/types/auth'
import type { NavSection } from '@/types/nav'

interface MainLayoutProps {
  sections: NavSection[]
  brandLabel?: string
  title?: string
  user?: User | null
  onLogout?: () => void
}

/** Recuerda si el usuario prefiere la barra lateral retraída entre sesiones. */
const SIDEBAR_COLLAPSED_KEY = 'ludiclass:sidebar-collapsed'

function readStoredCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
}

export function MainLayout({
  sections,
  brandLabel = 'Ludi Class',
  title,
  user,
  onLogout,
}: MainLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readStoredCollapsed)

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0')
      return next
    })
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <div
        className={cn(
          'hidden shrink-0 border-r border-sidebar-border transition-[width] duration-200 md:block',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <Sidebar sections={sections} brandLabel={brandLabel} collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="h-16 flex-row items-center gap-2 border-b border-sidebar-border px-6">
            <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <GraduationCap className="size-4.5" />
            </span>
            <SheetTitle className="text-sm font-semibold tracking-tight">
              {brandLabel}
            </SheetTitle>
          </SheetHeader>
          <Sidebar sections={sections} brandLabel={brandLabel} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={title}
          onMenuClick={() => setMobileNavOpen(true)}
          user={user}
          onLogout={onLogout}
        />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
