import { PERMISSION_MODULES } from '@/types/rbac'
import type { AdminRoleAssignment, PermissionKey, RoleDefinition, RoleInput } from '@/types/rbac'

/**
 * Almacén simulado de RBAC (Sprint 20). Estado en memoria durante la sesión,
 * mismo criterio que el resto de los mocks del proyecto.
 */

function allPermissions(): PermissionKey[] {
  return PERMISSION_MODULES.flatMap((module) => module.actions.map((action) => `${module.key}.${action}`))
}

function perms(...keys: PermissionKey[]): PermissionKey[] {
  return keys
}

const SEED_DATE = '2026-01-01T09:00:00.000Z'

let ROLES: RoleDefinition[] = [
  {
    id: 'role-maestro',
    name: 'Administrador Maestro',
    description: 'Posee absolutamente todos los permisos. No existe ningún permiso superior. No puede ser restringido.',
    color: '#dc2626',
    icon: 'Shield',
    isSystem: true,
    status: 'activo',
    permissions: allPermissions(),
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
  },
  {
    id: 'role-soporte',
    name: 'Soporte Técnico',
    description: 'Desbloquea/bloquea usuarios, reinicia contraseñas, consulta logs y monitorea la plataforma. No modifica evaluaciones, calificaciones ni gestiona pagos.',
    color: '#0891b2',
    icon: 'LifeBuoy',
    isSystem: true,
    status: 'activo',
    permissions: perms(
      'usuarios.bloquear', 'usuarios.reactivar', 'usuarios.reiniciar_contrasena',
      'auditoria.consultar', 'seguridad.consultar',
      'configuracion.api', 'configuracion.integraciones',
    ),
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
  },
  {
    id: 'role-control-escolar',
    name: 'Control Escolar',
    description: 'Gestiona alumnos, inscripciones, materias, kardex, historial, grupos, altas y bajas. No accede a Configuración, Evaluaciones ni logs técnicos.',
    color: '#059669',
    icon: 'ClipboardCheck',
    isSystem: true,
    status: 'activo',
    permissions: perms(
      'usuarios.ver', 'usuarios.crear', 'usuarios.editar', 'usuarios.eliminar', 'usuarios.exportar',
      'materias.ver', 'materias.editar', 'materias.asignar', 'materias.cambiar_plan',
      'carreras.ver', 'carreras.gestionar_plan',
      'reportes.ver',
    ),
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
  },
  {
    id: 'role-coordinador',
    name: 'Coordinador Académico',
    description: 'Aprueba modificaciones de evaluación, revisa reportes y Producto de Titulación, aprueba rúbricas, revisa incidencias académicas y asigna profesores.',
    color: '#7c3aed',
    icon: 'GraduationCap',
    isSystem: true,
    status: 'activo',
    permissions: perms(
      'evaluaciones.ver', 'evaluaciones.aprobar_cambios', 'evaluaciones.rechazar_cambios',
      'reportes.ver', 'reportes.retroalimentar', 'reportes.aprobar',
      'titulacion.ver', 'titulacion.gestionar',
      'incidencias.ver', 'incidencias.gestionar',
      'materias.cambiar_profesor',
    ),
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
  },
  {
    id: 'role-finanzas',
    name: 'Finanzas',
    description: 'Pagos, becas, estados de cuenta, facturación, descuentos e historial financiero. No accede a Evaluaciones, Usuarios ni Configuración.',
    color: '#d97706',
    icon: 'Wallet',
    isSystem: true,
    status: 'activo',
    permissions: perms(
      'finanzas.pagos', 'finanzas.becas', 'finanzas.estados_cuenta',
      'finanzas.facturacion', 'finanzas.descuentos', 'finanzas.historial',
    ),
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
  },
  {
    id: 'role-atencion',
    name: 'Atención Estudiantil',
    description: 'Tickets, solicitudes, mensajes, seguimiento, incidencias y canalización.',
    color: '#4b5563',
    icon: 'Users',
    isSystem: true,
    status: 'activo',
    permissions: perms(
      'incidencias.ver', 'incidencias.gestionar',
      'comunicacion.gestionar_conversaciones', 'comunicacion.enviar_anuncios',
      'notificaciones.ver',
    ),
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
  },
]

let sequence = 0
function nextId(prefix: string): string {
  sequence += 1
  return `${prefix}-${sequence}`
}

/** Rol de menor privilegio, asignado por defecto a un Administrador recién creado hasta que el Administrador Maestro le asigne uno explícito. */
export const DEFAULT_ROLE_ID = 'role-atencion'

let ASSIGNMENTS: AdminRoleAssignment[] = [
  { adminUserId: 'usr-admin-001', roleId: 'role-maestro', customPermissions: [] },
  { adminUserId: 'adm-002', roleId: 'role-coordinador', customPermissions: ['reportes.eliminar'] },
  { adminUserId: 'adm-003', roleId: 'role-soporte', customPermissions: [] },
  { adminUserId: 'adm-004', roleId: 'role-control-escolar', customPermissions: ['auditoria.consultar'] },
  { adminUserId: 'adm-005', roleId: 'role-finanzas', customPermissions: [] },
]

export function listRoles(): RoleDefinition[] {
  return ROLES
}

export function findRole(roleId: string): RoleDefinition | null {
  return ROLES.find((role) => role.id === roleId) ?? null
}

export function insertRole(input: RoleInput): RoleDefinition {
  const now = new Date().toISOString()
  const role: RoleDefinition = {
    id: nextId('role'),
    name: input.name,
    description: input.description,
    color: input.color,
    icon: input.icon,
    isSystem: false,
    status: 'activo',
    permissions: input.permissions,
    createdAt: now,
    updatedAt: now,
  }
  ROLES = [...ROLES, role]
  return role
}

/** Solo roles personalizados (`isSystem: false`) pueden editarse — los 6 predefinidos son de solo lectura. */
export function updateRole(roleId: string, input: RoleInput): RoleDefinition | null {
  const role = ROLES.find((item) => item.id === roleId)
  if (!role || role.isSystem) return null
  role.name = input.name
  role.description = input.description
  role.color = input.color
  role.icon = input.icon
  role.permissions = input.permissions
  role.updatedAt = new Date().toISOString()
  return role
}

export function deleteRole(roleId: string): boolean {
  const role = ROLES.find((item) => item.id === roleId)
  if (!role || role.isSystem) return false
  ROLES = ROLES.filter((item) => item.id !== roleId)
  return true
}

export function setRoleStatus(roleId: string, status: RoleDefinition['status']): RoleDefinition | null {
  const role = ROLES.find((item) => item.id === roleId)
  if (!role || role.isSystem) return null
  role.status = status
  role.updatedAt = new Date().toISOString()
  return role
}

export function listAssignments(): AdminRoleAssignment[] {
  return ASSIGNMENTS
}

export function findAssignment(adminUserId: string): AdminRoleAssignment | null {
  return ASSIGNMENTS.find((item) => item.adminUserId === adminUserId) ?? null
}

export function assignRole(adminUserId: string, roleId: string): AdminRoleAssignment {
  const existing = ASSIGNMENTS.find((item) => item.adminUserId === adminUserId)
  if (existing) {
    existing.roleId = roleId
    return existing
  }
  const assignment: AdminRoleAssignment = { adminUserId, roleId, customPermissions: [] }
  ASSIGNMENTS = [...ASSIGNMENTS, assignment]
  return assignment
}

export function setCustomPermissions(adminUserId: string, customPermissions: PermissionKey[]): AdminRoleAssignment {
  const existing = ASSIGNMENTS.find((item) => item.adminUserId === adminUserId)
  if (existing) {
    existing.customPermissions = customPermissions
    return existing
  }
  const assignment: AdminRoleAssignment = { adminUserId, roleId: DEFAULT_ROLE_ID, customPermissions }
  ASSIGNMENTS = [...ASSIGNMENTS, assignment]
  return assignment
}
