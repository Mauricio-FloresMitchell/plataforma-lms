import { useCallback, useEffect, useState } from 'react'
import { Lock, MoreVertical, Power, ShieldOff, UserCog, UserPlus, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { createManagedUserAsync, getManagedUsersAsync, setUserStatusAsync } from '@/services/userManagement.service'
import { assignRoleAsync, getAssignmentsAsync, getRolesAsync, setCustomPermissionsAsync } from '@/services/rbac.service'
import { UserCreateSheet } from '@/features/usuarios-admin/components/UserCreateSheet'
import type { ManagedUser, ManagedUserCreateInput } from '@/types/userManagement'
import type { AdminRoleAssignment, PermissionKey, RoleDefinition } from '@/types/rbac'
import { AdminAssignSheet } from '../components/AdminAssignSheet'
import { ROLE_ICON_COMPONENTS } from '../utils/roleIcons'

function formatLastLogin(lastLoginAt?: string): string {
  if (!lastLoginAt) return 'Sin accesos registrados'
  const minutes = Math.round((Date.now() - new Date(lastLoginAt).getTime()) / 60_000)
  if (minutes < 1) return 'Conectado ahora'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`
  return `Hace ${Math.round(hours / 24)} d`
}

/**
 * Gestión de Administradores (Sprint 20): pantalla nueva y distinta de
 * Usuarios — muestra rol, permisos heredados y personalizados de cada
 * cuenta de Administrador. Reutiliza `userManagement.service.ts` para
 * alta/suspensión/baja (nunca elimina físicamente) y `rbac.service.ts` para
 * rol y permisos.
 */
export function AdminAdministratorsPage() {
  const { user } = useAuth()
  const [admins, setAdmins] = useState<ManagedUser[]>([])
  const [roles, setRoles] = useState<RoleDefinition[]>([])
  const [assignments, setAssignments] = useState<AdminRoleAssignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<ManagedUser | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const actor = user ? { id: user.id, name: user.name, role: user.role } : null

  const reload = useCallback(() => {
    setIsLoading(true)
    Promise.all([getManagedUsersAsync('administrador'), getRolesAsync(), getAssignmentsAsync()])
      .then(([adminsData, rolesData, assignmentsData]) => {
        setAdmins(adminsData)
        setRoles(rolesData)
        setAssignments(assignmentsData)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(reload, [reload])

  function assignmentFor(adminId: string): AdminRoleAssignment | null {
    return assignments.find((item) => item.adminUserId === adminId) ?? null
  }

  function roleFor(adminId: string): RoleDefinition | null {
    const assignment = assignmentFor(adminId)
    return assignment ? roles.find((role) => role.id === assignment.roleId) ?? null : null
  }

  async function handleCreate(input: ManagedUserCreateInput) {
    if (!actor) return
    await createManagedUserAsync(actor, input)
    reload()
  }

  async function handleSetStatus(admin: ManagedUser, status: ManagedUser['status']) {
    if (!actor) return
    await setUserStatusAsync(actor, admin.id, status)
    reload()
  }

  async function handleChangeRole(admin: ManagedUser, roleId: string) {
    if (!actor) return
    await assignRoleAsync(actor, admin.id, admin.name, roleId)
    reload()
  }

  async function handleChangeCustomPermissions(admin: ManagedUser, permissions: PermissionKey[]) {
    if (!actor) return
    await setCustomPermissionsAsync(actor, admin.id, admin.name, permissions)
    reload()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Administradores' }]}
        title="Administradores"
        subtitle="El Administrador Maestro es el único capaz de crear administradores y definir exactamente qué pueden hacer."
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <UserPlus className="size-4" />
            Nuevo administrador
          </Button>
        }
      />

      {isLoading ? (
        <ListSkeleton variant="row" count={4} />
      ) : admins.length === 0 ? (
        <EmptyState icon={Users} title="Sin administradores" description="Todavía no hay cuentas de Administrador registradas." />
      ) : (
        <div className="flex flex-col gap-3">
          {admins.map((admin) => {
            const role = roleFor(admin.id)
            const assignment = assignmentFor(admin.id)
            const Icon = role ? ROLE_ICON_COMPONENTS[role.icon] : Users
            const isMaestro = role?.id === 'role-maestro'
            return (
              <Card key={admin.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: role?.color ?? '#6b7280' }}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-foreground">{admin.name}</h3>
                        <Badge className={admin.status === 'activo' ? 'bg-emerald-100 text-emerald-800' : admin.status === 'bloqueado' ? 'bg-destructive/10 text-destructive' : 'bg-slate-200 text-slate-700'}>
                          {admin.status}
                        </Badge>
                        {isMaestro ? <Badge variant="outline" className="gap-1 text-[10px]"><Lock className="size-3" />Irrestricto</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{admin.email}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Rol: {role?.name ?? 'Sin asignar'} · {role?.permissions.length ?? 0} permisos heredados · {assignment?.customPermissions.length ?? 0} personalizados
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground/80">Último acceso: {formatLastLogin(admin.lastLoginAt)}</p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="Más opciones">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        disabled={isMaestro}
                        onSelect={() => {
                          setEditingAdmin(admin)
                          setIsEditOpen(true)
                        }}
                      >
                        <UserCog className="size-4" />
                        Editar rol y permisos
                      </DropdownMenuItem>
                      {admin.status === 'bloqueado' ? (
                        <DropdownMenuItem disabled={isMaestro} onSelect={() => void handleSetStatus(admin, 'activo')}>
                          <Power className="size-4" />
                          Reactivar
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem disabled={isMaestro} onSelect={() => void handleSetStatus(admin, 'bloqueado')}>
                          <ShieldOff className="size-4" />
                          Suspender
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={isMaestro}
                        onSelect={() => void handleSetStatus(admin, 'inactivo')}
                      >
                        <ShieldOff className="size-4" />
                        Dar de baja
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <UserCreateSheet open={isCreateOpen} onOpenChange={setIsCreateOpen} defaultRole="administrador" onSubmit={handleCreate} />
      <AdminAssignSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        admin={editingAdmin}
        assignment={editingAdmin ? assignmentFor(editingAdmin.id) : null}
        roles={roles}
        onChangeRole={(roleId) => (editingAdmin ? handleChangeRole(editingAdmin, roleId) : Promise.resolve())}
        onChangeCustomPermissions={(permissions) => (editingAdmin ? handleChangeCustomPermissions(editingAdmin, permissions) : Promise.resolve())}
      />
    </div>
  )
}
