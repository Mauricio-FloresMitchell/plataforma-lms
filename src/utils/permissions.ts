import { PERMISSION_MODULES } from '@/types/rbac'
import type { ModuleKey, PermissionKey } from '@/types/rbac'

/**
 * Utilidades puras de RBAC (Sprint 20) — no acceden a ningún store, solo
 * operan sobre la lista de permisos efectivos ya calculada
 * (`services/rbac.service.ts#getEffectivePermissionsAsync`). Reemplaza el
 * stub de Sprint 19 (`hasPermission(role, permission)`, siempre `true` para
 * `administrador`) por una verificación real contra permisos concretos.
 */

/** Verifica que `"modulo.accion"` exista realmente en `PERMISSION_MODULES` — evita permisos "fantasma" por error de tipeo. */
export function isValidPermission(permission: PermissionKey): boolean {
  const [moduleKey, action] = permission.split('.')
  const module = PERMISSION_MODULES.find((item) => item.key === moduleKey)
  return !!module && (module.actions as readonly string[]).includes(action ?? '')
}

/** ¿La lista de permisos efectivos incluye exactamente este permiso? */
export function hasPermission(effectivePermissions: PermissionKey[], permission: PermissionKey): boolean {
  return effectivePermissions.includes(permission)
}

/** ¿La lista de permisos efectivos incluye AL MENOS UN permiso de este módulo? Usado para decidir si se muestra una sección completa (ej. accesos rápidos del Dashboard). */
export function hasModuleAccess(effectivePermissions: PermissionKey[], moduleKey: ModuleKey): boolean {
  const prefix = `${moduleKey}.`
  return effectivePermissions.some((permission) => permission.startsWith(prefix))
}
