import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, User as UserIcon, Settings } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { User } from '@/types/auth'
import { ROLE_LABELS } from '@/mocks/users'

interface UserMenuProps {
  user: User
  onLogout: () => void
}

/** Avatar con menú desplegable de sesión (perfil + configuración + cerrar sesión). */
export function UserMenu({ user, onLogout }: UserMenuProps) {
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const profileRoute = {
    alumno: '/alumno/perfil',
    profesor: '/profesor/perfil',
    administrador: '/admin/perfil',
  }[user.role]

  const settingsRoute = {
    alumno: '/alumno/configuracion',
    profesor: '/profesor/configuracion',
    administrador: '/admin/configuracion',
  }[user.role]

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await onLogout()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
        <Avatar className="size-8">
          <AvatarFallback className="bg-accent text-xs font-medium text-accent-foreground">
            {user.avatarInitials}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">{user.name}</span>
          <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
          <Badge variant="secondary" className="mt-1 w-fit">
            {ROLE_LABELS[user.role]}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => navigate(profileRoute)}
        >
          <UserIcon className="size-4" />
          Mi Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate(settingsRoute)}>
          <Settings className="size-4" />
          Configuración
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={(event) => {
            event.preventDefault()
            void handleLogout()
          }}
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
