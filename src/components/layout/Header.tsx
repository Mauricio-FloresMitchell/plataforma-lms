import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'
import type { User } from '@/types/auth'
import { UserMenu } from './UserMenu'

interface HeaderProps {
  title?: string
  onMenuClick?: () => void
  /** Usuario en sesión. Si se provee, se muestra el menú de usuario. */
  user?: User | null
  onLogout?: () => void
}

export function Header({ title, onMenuClick, user, onLogout }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Abrir navegación"
        >
          <Menu className="size-5" />
        </Button>
        {title ? <h1 className="text-sm font-semibold text-foreground">{title}</h1> : null}
      </div>

      {user && onLogout ? (
        <div className="flex items-center gap-1">
          <NotificationBell />
          <UserMenu user={user} onLogout={onLogout} />
        </div>
      ) : (
        <Avatar className="size-8">
          <AvatarFallback className="bg-accent text-xs font-medium text-accent-foreground">
            IZ
          </AvatarFallback>
        </Avatar>
      )}
    </header>
  )
}
