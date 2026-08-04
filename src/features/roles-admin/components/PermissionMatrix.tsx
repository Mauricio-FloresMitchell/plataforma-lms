import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { PERMISSION_MODULES } from '@/types/rbac'
import type { PermissionKey } from '@/types/rbac'
import { actionLabel } from '../utils/actionLabels'

interface PermissionMatrixProps {
  /** Permisos marcados por esta selección (rol, o permisos personalizados de un Administrador). */
  selected: PermissionKey[]
  onChange: (next: PermissionKey[]) => void
  disabled?: boolean
  /** Permisos ya concedidos por otra vía (ej. el rol base) — se muestran marcados y bloqueados, para visualizar la herencia. */
  inherited?: PermissionKey[]
}

/** Matriz de permisos por módulo (Sprint 20) — un checkbox por acción, agrupado por módulo, igual estructura que pidió el sprint. */
export function PermissionMatrix({ selected, onChange, disabled, inherited = [] }: PermissionMatrixProps) {
  function toggle(permission: PermissionKey, checked: boolean) {
    if (disabled || inherited.includes(permission)) return
    onChange(checked ? [...selected, permission] : selected.filter((item) => item !== permission))
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {PERMISSION_MODULES.map((module) => {
        const modulePermissions = module.actions.map((action) => `${module.key}.${action}`)
        const checkedCount = modulePermissions.filter((permission) => selected.includes(permission) || inherited.includes(permission)).length
        return (
          <Card key={module.key} className="p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{module.label}</p>
              <Badge variant="outline" className="text-[10px]">{checkedCount}/{modulePermissions.length}</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {module.actions.map((action) => {
                const permission = `${module.key}.${action}`
                const isInherited = inherited.includes(permission)
                const isChecked = selected.includes(permission) || isInherited
                return (
                  <label key={permission} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={isChecked}
                      disabled={disabled || isInherited}
                      onCheckedChange={(checked) => toggle(permission, checked === true)}
                    />
                    <span className={isInherited ? 'text-muted-foreground' : ''}>
                      {actionLabel(permission)}
                      {isInherited ? ' (heredado)' : ''}
                    </span>
                  </label>
                )
              })}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
