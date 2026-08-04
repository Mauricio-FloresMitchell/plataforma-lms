/**
 * Modelo RBAC (Role Based Access Control) — Sprint 20, cierre funcional del MVP.
 *
 * Jerarquía: Administrador Maestro → Administradores → Roles → Permisos → Módulos.
 * Reemplaza el stub de `types/permissions.ts` (Sprint 19, siempre `true` para
 * `administrador`) por un catálogo granular real: cada módulo administrativo
 * declara sus propias acciones (ver/crear/editar/eliminar/…), un Rol es un
 * conjunto de `PermissionKey`, y un Administrador tiene un Rol base más
 * permisos personalizados adicionales (unión, nunca resta — ver
 * `docs/RBAC.md`).
 */

export interface PermissionModule {
  key: string
  label: string
  actions: readonly string[]
}

/**
 * Catálogo de módulos y acciones. Los primeros 10 módulos son exactamente
 * los que pidió el sprint ("MATRIZ DE PERMISOS"); los siguientes se agregan
 * para que el resto de la plataforma (construida en los Sprints 13-19)
 * quede bajo el mismo sistema de permisos — ningún módulo administrativo
 * queda fuera del RBAC.
 */
export const PERMISSION_MODULES = [
  { key: 'usuarios', label: 'Usuarios', actions: ['ver', 'crear', 'editar', 'eliminar', 'exportar', 'reiniciar_contrasena', 'bloquear', 'suspender', 'reactivar'] },
  { key: 'materias', label: 'Materias', actions: ['ver', 'crear', 'editar', 'eliminar', 'asignar', 'cambiar_profesor', 'cambiar_plan'] },
  { key: 'carreras', label: 'Carreras', actions: ['ver', 'crear', 'editar', 'eliminar', 'gestionar_plan', 'gestionar_titulacion'] },
  { key: 'evaluaciones', label: 'Evaluaciones', actions: ['ver', 'modificar', 'aprobar_cambios', 'rechazar_cambios', 'publicar', 'recalcular'] },
  { key: 'reportes', label: 'Reportes', actions: ['ver', 'retroalimentar', 'aprobar', 'solicitar_correccion', 'eliminar'] },
  { key: 'leaderboard', label: 'Leaderboard', actions: ['consultar', 'modificar_puntos', 'asignar_badges', 'recalcular_ranking'] },
  { key: 'biblioteca', label: 'Biblioteca', actions: ['ver', 'subir', 'editar', 'eliminar', 'descargar', 'gestionar_categorias'] },
  { key: 'foro', label: 'Foro', actions: ['moderar', 'eliminar_publicaciones', 'eliminar_comentarios', 'suspender_usuarios', 'resolver_reportes', 'destacar_publicaciones'] },
  { key: 'comunicacion', label: 'Comunicación', actions: ['enviar_anuncios', 'crear_grupos', 'gestionar_conversaciones'] },
  { key: 'configuracion', label: 'Configuración', actions: ['general', 'integraciones', 'api', 'zoom', 'drive', 'correos', 'variables'] },
  // Adicionales — cubren el resto de la plataforma (Sprints 13-19) bajo el mismo sistema.
  { key: 'titulacion', label: 'Producto de Titulación', actions: ['ver', 'gestionar'] },
  { key: 'cursos', label: 'Cursos y Certificaciones', actions: ['ver', 'gestionar'] },
  { key: 'notificaciones', label: 'Notificaciones', actions: ['ver', 'enviar', 'eliminar'] },
  { key: 'auditoria', label: 'Auditoría', actions: ['consultar'] },
  { key: 'seguridad', label: 'Seguridad', actions: ['consultar'] },
  { key: 'backups', label: 'Respaldos', actions: ['gestionar'] },
  { key: 'incidencias', label: 'Incidencias', actions: ['ver', 'gestionar'] },
  { key: 'matriculas', label: 'Generador de Matrículas', actions: ['generar'] },
  { key: 'roles', label: 'Roles y Permisos', actions: ['ver', 'crear', 'editar', 'eliminar', 'asignar'] },
  { key: 'administradores', label: 'Administradores', actions: ['ver', 'crear', 'editar', 'suspender', 'eliminar'] },
  /**
   * Módulo "Finanzas" (rol predefinido del sprint) — no existe todavía una
   * feature de Finanzas en la plataforma (sin pagos/becas/facturación
   * construidos en ningún sprint anterior). Se modelan los permisos para
   * que el rol exista de forma honesta y quede listo para cuando el módulo
   * se construya, sin fabricar una UI falsa — mismo criterio que
   * "preparar arquitectura sin implementar" ya usado en Configuración
   * (Sprint 19/20). Ver `docs/DECISIONS.md` ADR-014.
   */
  { key: 'finanzas', label: 'Finanzas', actions: ['pagos', 'becas', 'estados_cuenta', 'facturacion', 'descuentos', 'historial'] },
] as const satisfies readonly PermissionModule[]

export type ModuleKey = (typeof PERMISSION_MODULES)[number]['key']

/** `"modulo.accion"` — ej. `"usuarios.crear"`, `"foro.moderar"`. Se valida en runtime contra `PERMISSION_MODULES` (`utils/permissions.ts#isValidPermission`), no solo por convención de nombre. */
export type PermissionKey = string

export const ROLE_COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#4b5563'] as const
export type RoleColor = (typeof ROLE_COLORS)[number]

/** Catálogo cerrado de íconos disponibles al crear un rol personalizado (`features/roles-admin`). */
export const ROLE_ICON_KEYS = ['Shield', 'Users', 'GraduationCap', 'Wallet', 'LifeBuoy', 'ClipboardCheck', 'Settings', 'Award'] as const
export type RoleIconKey = (typeof ROLE_ICON_KEYS)[number]

export type RoleStatus = 'activo' | 'inactivo'

export interface RoleDefinition {
  id: string
  name: string
  description: string
  color: string
  icon: RoleIconKey
  /** `true` para los 6 roles predefinidos del sprint — no editables ni eliminables, solo consultables. */
  isSystem: boolean
  status: RoleStatus
  permissions: PermissionKey[]
  createdAt: string
  updatedAt: string
}

export interface RoleInput {
  name: string
  description: string
  color: string
  icon: RoleIconKey
  permissions: PermissionKey[]
}

/**
 * Asignación de rol a un Administrador, más permisos personalizados
 * (Sprint 20, "Herencia de Permisos"): efectivos = permisos del rol ∪
 * permisos personalizados — nunca se resta un permiso del rol base desde
 * aquí, solo se suma. Ver `services/rbac.service.ts#getEffectivePermissionsAsync`.
 */
export interface AdminRoleAssignment {
  adminUserId: string
  roleId: string
  customPermissions: PermissionKey[]
}
