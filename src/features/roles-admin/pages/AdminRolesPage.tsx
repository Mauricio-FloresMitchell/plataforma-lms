import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, Plus, ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { createRoleAsync, getRolesAsync } from '@/services/rbac.service'
import type { RoleDefinition, RoleIconKey } from '@/types/rbac'
import { RoleFormSheet } from '../components/RoleFormSheet'
import { ROLE_ICON_COMPONENTS } from '../utils/roleIcons'

/** Roles y Permisos (Sprint 20): 6 roles predefinidos (solo lectura) + roles personalizados creados por el Administrador Maestro. */
export function AdminRolesPage() {
  const { user } = useAuth()
  const [roles, setRoles] = useState<RoleDefinition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const actor = user ? { id: user.id, name: user.name, role: user.role } : null

  const reload = useCallback(() => {
    setIsLoading(true)
    getRolesAsync()
      .then(setRoles)
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(reload, [reload])

  async function handleCreate(input: { name: string; description: string; color: string; icon: RoleIconKey }) {
    if (!actor) return
    await createRoleAsync(actor, { ...input, permissions: [] })
    reload()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Roles y Permisos' }]}
        title="Roles y Permisos"
        subtitle="Administrador Maestro → Administradores → Roles → Permisos → Módulos."
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="size-4" />
            Nuevo rol
          </Button>
        }
      />

      {isLoading ? (
        <ListSkeleton variant="block" count={4} blockHeight="h-24" />
      ) : roles.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="Sin roles" description="Todavía no hay roles registrados." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => {
            const Icon = ROLE_ICON_COMPONENTS[role.icon]
            return (
              <Link key={role.id} to={`/admin/roles/${role.id}`}>
                <Card className="h-full p-4 transition-colors hover:border-primary/40 hover:bg-accent/40">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: role.color }}
                    >
                      <Icon className="size-5" />
                    </span>
                    {role.isSystem ? (
                      <Badge variant="outline" className="gap-1 text-[10px]"><Lock className="size-3" />Sistema</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">Personalizado</Badge>
                    )}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground">{role.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{role.description}</p>
                  <p className="mt-2 text-xs font-medium text-muted-foreground">{role.permissions.length} permisos · {role.status}</p>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      <RoleFormSheet open={isCreateOpen} onOpenChange={setIsCreateOpen} role={null} onSubmit={handleCreate} />
    </div>
  )
}
