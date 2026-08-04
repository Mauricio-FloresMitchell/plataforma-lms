import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PermissionMatrix } from './PermissionMatrix'
import type { AdminRoleAssignment, PermissionKey, RoleDefinition } from '@/types/rbac'
import type { ManagedUser } from '@/types/userManagement'

interface AdminAssignSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  admin: ManagedUser | null
  assignment: AdminRoleAssignment | null
  roles: RoleDefinition[]
  onChangeRole: (roleId: string) => Promise<void>
  onChangeCustomPermissions: (permissions: PermissionKey[]) => Promise<void>
}

/**
 * Editar el rol y los permisos personalizados de un Administrador (Sprint
 * 20, "Herencia de Permisos"): el rol se cambia aparte (aplica de
 * inmediato), los permisos personalizados se acumulan sobre la matriz —
 * los ya heredados del rol se muestran marcados y bloqueados.
 */
export function AdminAssignSheet({ open, onOpenChange, admin, assignment, roles, onChangeRole, onChangeCustomPermissions }: AdminAssignSheetProps) {
  const [roleId, setRoleId] = useState('')
  const [customPermissions, setCustomPermissions] = useState<PermissionKey[]>([])
  const [isSavingRole, setIsSavingRole] = useState(false)
  const [isSavingPermissions, setIsSavingPermissions] = useState(false)

  useEffect(() => {
    if (!open) return
    setRoleId(assignment?.roleId ?? '')
    setCustomPermissions(assignment?.customPermissions ?? [])
  }, [open, assignment])

  const selectedRole = roles.find((role) => role.id === roleId)
  const isMaestro = selectedRole?.id === 'role-maestro'

  async function handleChangeRole(value: string) {
    setRoleId(value)
    setIsSavingRole(true)
    try {
      await onChangeRole(value)
    } finally {
      setIsSavingRole(false)
    }
  }

  async function handleSavePermissions() {
    setIsSavingPermissions(true)
    try {
      await onChangeCustomPermissions(customPermissions)
    } finally {
      setIsSavingPermissions(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Permisos de {admin?.name}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex flex-col gap-1.5">
            <Label>Rol</Label>
            <div className="flex gap-2">
              <Select value={roleId} onValueChange={(value) => void handleChangeRole(value)} disabled={isSavingRole}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Seleccionar rol…" /></SelectTrigger>
                <SelectContent>
                  {roles.filter((role) => role.status === 'activo').map((role) => (
                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isMaestro ? (
            <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
              El Administrador Maestro posee todos los permisos y no puede ser restringido — no hay permisos personalizados que asignar.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Label>Permisos personalizados (adicionales al rol)</Label>
                <Button size="sm" onClick={() => void handleSavePermissions()} disabled={isSavingPermissions}>
                  {isSavingPermissions ? 'Guardando…' : 'Guardar permisos'}
                </Button>
              </div>
              <PermissionMatrix
                selected={customPermissions}
                onChange={setCustomPermissions}
                inherited={selectedRole?.permissions ?? []}
              />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
