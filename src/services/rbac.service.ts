import {
  DEFAULT_ROLE_ID,
  assignRole,
  deleteRole,
  findAssignment,
  findRole,
  insertRole,
  listAssignments,
  listRoles,
  setCustomPermissions,
  setRoleStatus,
  updateRole,
} from '@/mocks/rbac'
import { recordAudit, type AuditActor } from '@/services/audit.service'
import type { AdminRoleAssignment, PermissionKey, RoleDefinition, RoleInput, RoleStatus } from '@/types/rbac'

/**
 * Capa de acceso a datos de RBAC (Sprint 20). Único punto que combina el
 * almacén en memoria con Auditoría — mismo patrón que el resto de los
 * servicios administrativos del proyecto.
 */

const NETWORK_DELAY_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getRolesAsync(): Promise<RoleDefinition[]> {
  await delay(NETWORK_DELAY_MS)
  return listRoles()
}

export async function getRoleAsync(roleId: string): Promise<RoleDefinition | null> {
  await delay(NETWORK_DELAY_MS)
  return findRole(roleId)
}

export async function createRoleAsync(actor: AuditActor, input: RoleInput): Promise<RoleDefinition> {
  await delay(NETWORK_DELAY_MS)
  const role = insertRole(input)
  recordAudit(actor, 'Roles y Permisos', `Creó el rol "${role.name}" (${role.permissions.length} permisos)`, undefined, role)
  return role
}

export async function updateRoleAsync(actor: AuditActor, roleId: string, input: RoleInput): Promise<RoleDefinition | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findRole(roleId)
  const role = updateRole(roleId, input)
  if (role) recordAudit(actor, 'Roles y Permisos', `Editó el rol "${role.name}"`, before, role)
  return role
}

export async function deleteRoleAsync(actor: AuditActor, roleId: string, roleName: string): Promise<boolean> {
  await delay(NETWORK_DELAY_MS)
  const removed = deleteRole(roleId)
  if (removed) recordAudit(actor, 'Roles y Permisos', `Eliminó el rol "${roleName}"`)
  return removed
}

export async function setRoleStatusAsync(actor: AuditActor, roleId: string, status: RoleStatus): Promise<RoleDefinition | null> {
  await delay(NETWORK_DELAY_MS)
  const role = setRoleStatus(roleId, status)
  if (role) recordAudit(actor, 'Roles y Permisos', `Cambió el estado del rol "${role.name}" a "${status}"`)
  return role
}

export async function getAssignmentsAsync(): Promise<AdminRoleAssignment[]> {
  await delay(NETWORK_DELAY_MS)
  return listAssignments()
}

export async function getAssignmentAsync(adminUserId: string): Promise<AdminRoleAssignment | null> {
  await delay(NETWORK_DELAY_MS)
  return findAssignment(adminUserId)
}

/**
 * Inicializa el rol de un Administrador nuevo (Sprint 20, "Alta" de
 * administradores) con el rol de menor privilegio — nunca sobrescribe una
 * asignación ya existente. Sin `actor`/audit — lo llama
 * `userManagement.service.ts` al dar de alta o al cambiar un rol a
 * `administrador`.
 */
export function ensureDefaultAssignment(adminUserId: string): AdminRoleAssignment {
  const existing = findAssignment(adminUserId)
  if (existing) return existing
  return assignRole(adminUserId, DEFAULT_ROLE_ID)
}

export async function assignRoleAsync(actor: AuditActor, adminUserId: string, adminName: string, roleId: string): Promise<AdminRoleAssignment> {
  await delay(NETWORK_DELAY_MS)
  const role = findRole(roleId)
  const assignment = assignRole(adminUserId, roleId)
  recordAudit(actor, 'Roles y Permisos', `Cambió el rol de ${adminName} a "${role?.name ?? roleId}"`)
  return assignment
}

export async function setCustomPermissionsAsync(
  actor: AuditActor,
  adminUserId: string,
  adminName: string,
  customPermissions: PermissionKey[],
): Promise<AdminRoleAssignment> {
  await delay(NETWORK_DELAY_MS)
  const assignment = setCustomPermissions(adminUserId, customPermissions)
  recordAudit(actor, 'Roles y Permisos', `Actualizó los permisos personalizados de ${adminName} (${customPermissions.length})`)
  return assignment
}

/**
 * Permisos efectivos de un Administrador (Sprint 20, "Herencia de
 * Permisos"): permisos del rol ∪ permisos personalizados. El Administrador
 * Maestro siempre tiene el rol `role-maestro`, que ya contiene el catálogo
 * completo — nunca se le puede restringir desde aquí.
 */
export async function getEffectivePermissionsAsync(adminUserId: string): Promise<PermissionKey[]> {
  await delay(NETWORK_DELAY_MS)
  const assignment = findAssignment(adminUserId)
  if (!assignment) return []
  const role = findRole(assignment.roleId)
  const rolePermissions = role?.status === 'activo' ? role.permissions : []
  return Array.from(new Set([...rolePermissions, ...assignment.customPermissions]))
}
