import { Badge } from '@/components/ui/badge'
import type { Role } from '@/types/auth'

interface AuthorRoleBadgeProps {
  role: Role
}

const ROLE_BADGE: Partial<Record<Role, string>> = {
  profesor: 'Profesor',
  administrador: 'Administrador',
}

/**
 * Insignia del rol del autor. Distingue a profesores y administradores;
 * para alumnos no muestra nada.
 */
export function AuthorRoleBadge({ role }: AuthorRoleBadgeProps) {
  const label = ROLE_BADGE[role]
  if (!label) return null
  return (
    <Badge variant="secondary" className="border-primary/30 bg-accent text-accent-foreground">
      {label}
    </Badge>
  )
}
