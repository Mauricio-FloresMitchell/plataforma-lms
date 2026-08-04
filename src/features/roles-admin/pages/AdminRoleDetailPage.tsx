import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Lock, Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { deleteRoleAsync, getRoleAsync, updateRoleAsync } from '@/services/rbac.service'
import type { PermissionKey, RoleDefinition, RoleIconKey } from '@/types/rbac'
import { RoleFormSheet } from '../components/RoleFormSheet'
import { PermissionMatrix } from '../components/PermissionMatrix'
import { ROLE_ICON_COMPONENTS } from '../utils/roleIcons'

/** Detalle de un rol y editor de su matriz de permisos (Sprint 20). Los 6 roles predefinidos son de solo lectura. */
export function AdminRoleDetailPage() {
  const { roleId } = useParams<{ roleId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [role, setRole] = useState<RoleDefinition | null>(null)
  const [permissions, setPermissions] = useState<PermissionKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const actor = user ? { id: user.id, name: user.name, role: user.role } : null

  const reload = useCallback(() => {
    if (!roleId) return
    setIsLoading(true)
    getRoleAsync(roleId)
      .then((data) => {
        setRole(data)
        setPermissions(data?.permissions ?? [])
      })
      .finally(() => setIsLoading(false))
  }, [roleId])

  useEffect(reload, [reload])

  async function handleSaveMetadata(input: { name: string; description: string; color: string; icon: RoleIconKey }) {
    if (!actor || !role) return
    await updateRoleAsync(actor, role.id, { ...input, permissions: role.permissions })
    reload()
  }

  async function handleSavePermissions() {
    if (!actor || !role) return
    setIsSaving(true)
    try {
      await updateRoleAsync(actor, role.id, { name: role.name, description: role.description, color: role.color, icon: role.icon, permissions })
      reload()
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!actor || !role) return
    if (!window.confirm(`¿Eliminar el rol "${role.name}"? Los administradores asignados quedarán sin rol hasta que se les reasigne uno.`)) return
    await deleteRoleAsync(actor, role.id, role.name)
    navigate('/admin/roles')
  }

  if (isLoading) {
    return <ListSkeleton variant="block" count={3} blockHeight="h-24" />
  }

  if (!role) {
    return <EmptyState icon={Lock} title="Rol no encontrado" description="No existe un rol con este identificador." />
  }

  const Icon = ROLE_ICON_COMPONENTS[role.icon]
  const hasChanges = JSON.stringify([...permissions].sort()) !== JSON.stringify([...role.permissions].sort())

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Roles y Permisos', to: '/admin/roles' }, { label: role.name }]}
        title={role.name}
        subtitle={role.description}
        actions={
          role.isSystem ? undefined : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                <Pencil className="size-4" />
                Editar
              </Button>
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => void handleDelete()}>
                <Trash2 className="size-4" />
                Eliminar
              </Button>
            </div>
          )
        }
      />

      <Card className="flex items-center gap-4 p-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: role.color }}>
          <Icon className="size-6" />
        </span>
        <div>
          {role.isSystem ? (
            <Badge variant="outline" className="gap-1 text-[10px]"><Lock className="size-3" />Rol del sistema — no editable ni eliminable</Badge>
          ) : (
            <Badge variant="outline" className="text-[10px]">Rol personalizado</Badge>
          )}
          <p className="mt-1 text-sm text-muted-foreground">{permissions.length} permisos activos</p>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Matriz de permisos</h3>
        {!role.isSystem ? (
          <Button size="sm" onClick={() => void handleSavePermissions()} disabled={isSaving || !hasChanges}>
            {isSaving ? 'Guardando…' : 'Guardar permisos'}
          </Button>
        ) : null}
      </div>

      <PermissionMatrix selected={permissions} onChange={setPermissions} disabled={role.isSystem} />

      <RoleFormSheet open={isEditOpen} onOpenChange={setIsEditOpen} role={role} onSubmit={handleSaveMetadata} />
    </div>
  )
}
