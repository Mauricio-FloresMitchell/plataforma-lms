import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { User } from '@/types/auth'
import type { NavSection } from '@/types/nav'

interface MainLayoutProps {
  sections: NavSection[]
  brandLabel?: string
  title?: string
  user?: User | null
  onLogout?: () => void
}

export function MainLayout({
  sections,
  brandLabel = 'Ludi Class',
  title,
  user,
  onLogout,
}: MainLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <div className="hidden w-64 shrink-0 border-r border-sidebar-border md:block">
        <Sidebar sections={sections} brandLabel={brandLabel} />
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
