import type { Role } from '@/types/auth'
import type { ManagedUser, ManagedUserCreateInput, ManagedUserEditInput, ManagedUserStatus, UserHistoryEntry } from '@/types/userManagement'

/**
 * Almacén simulado de Administración de Usuarios (Sprint 13, Parte 5).
 * Estado en memoria durante la sesión. Store propio (no cruza con
 * `mocks/users.ts`, `mocks/evaluations.ts`, etc.) — mismo criterio de "datos
 * duplicados por feature" ya documentado en el proyecto; las 3 cuentas
 * reales están marcadas con `isRealAccount: true` para distinguirlas.
 */

function historyEntry(action: string, performedByName: string, daysAgo: number): UserHistoryEntry {
  return {
    id: `hist-${Math.random().toString(36).slice(2, 9)}`,
    action,
    performedByName,
    createdAt: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
  }
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

let USERS: ManagedUser[] = [
  {
    id: 'usr-alumno-001',
    name: 'María García López',
    email: 'alumno@ludiclass.com',
    role: 'alumno',
    status: 'activo',
    matricula: 'ADM-2025-0501',
    careerName: 'Administración',
    groupName: 'ADM-501',
    subjectNames: ['Administración Estratégica', 'Comportamiento Organizacional'],
    createdAt: '2025-08-01T09:00:00.000Z',
    lastLoginAt: minutesAgo(4),
    isRealAccount: true,
    history: [historyEntry('Cuenta creada', 'Sistema', 300)],
  },
  { id: 'std-201', name: 'Jorge Ramírez Peña', email: 'jorge.ramirez@ludiclass.com', role: 'alumno', status: 'activo', matricula: 'MKT-2025-0401', careerName: 'Mercadotecnia', groupName: 'MKT-401', subjectNames: ['Mercadotecnia Digital'], createdAt: '2025-08-01T09:00:00.000Z', lastLoginAt: minutesAgo(35), isRealAccount: false, history: [historyEntry('Cuenta creada', 'Sistema', 280)] },
  { id: 'std-202', name: 'Lucía Fernández Mora', email: 'lucia.fernandez@ludiclass.com', role: 'alumno', status: 'activo', matricula: 'FIN-2025-0502', careerName: 'Contabilidad', groupName: 'FIN-502', subjectNames: ['Finanzas Corporativas'], createdAt: '2025-08-01T09:00:00.000Z', lastLoginAt: minutesAgo(720), isRealAccount: false, history: [historyEntry('Cuenta creada', 'Sistema', 280)] },
  { id: 'std-203', name: 'Andrés Solís Vega', email: 'andres.solis@ludiclass.com', role: 'alumno', status: 'activo', matricula: 'ADM-2025-0402', careerName: 'Administración', groupName: 'ADM-402', subjectNames: ['Comportamiento Organizacional'], createdAt: '2025-08-01T09:00:00.000Z', lastLoginAt: minutesAgo(12), isRealAccount: false, history: [historyEntry('Cuenta creada', 'Sistema', 280)] },
  { id: 'std-204', name: 'Diego Salinas Ortiz', email: 'diego.salinas@ludiclass.com', role: 'alumno', status: 'inactivo', matricula: 'ADM-2025-0503', careerName: 'Administración', groupName: 'ADM-501', subjectNames: [], createdAt: '2025-08-01T09:00:00.000Z', lastLoginAt: minutesAgo(60 * 24 * 20), isRealAccount: false, history: [historyEntry('Cuenta creada', 'Sistema', 280), historyEntry('Desactivada por baja temporal', 'Ana Torres Vega', 6)] },
  { id: 'std-205', name: 'Camila Rojas Herrera', email: 'camila.rojas@ludiclass.com', role: 'alumno', status: 'bloqueado', matricula: 'SIS-2025-0401', careerName: 'Ingeniería en Sistemas', groupName: 'SIS-401-A', subjectNames: ['Sistemas de Información'], createdAt: '2025-08-01T09:00:00.000Z', lastLoginAt: minutesAgo(60 * 24 * 12), isRealAccount: false, history: [historyEntry('Cuenta creada', 'Sistema', 280), historyEntry('Bloqueada por reporte de integridad académica', 'Ana Torres Vega', 12)] },
  { id: 'std-206', name: 'Fernando Castro Ibarra', email: 'fernando.castro@ludiclass.com', role: 'alumno', status: 'activo', matricula: 'DER-2025-0301', careerName: 'Derecho', groupName: 'DER-301', subjectNames: [], createdAt: '2025-08-01T09:00:00.000Z', lastLoginAt: minutesAgo(180), isRealAccount: false, history: [historyEntry('Cuenta creada', 'Sistema', 280)] },
  { id: 'std-207', name: 'Valeria Mendoza Cruz', email: 'valeria.mendoza@ludiclass.com', role: 'alumno', status: 'activo', matricula: 'PSI-2025-0201', careerName: 'Psicología', groupName: 'PSI-201', subjectNames: [], createdAt: '2025-08-01T09:00:00.000Z', lastLoginAt: minutesAgo(9), isRealAccount: false, history: [historyEntry('Cuenta creada', 'Sistema', 280)] },

  {
    id: 'usr-profesor-001',
    name: 'Carlos Méndez Ruiz',
    email: 'profesor@ludiclass.com',
    role: 'profesor',
    status: 'activo',
    subjectNames: ['Administración Estratégica', 'Gestión del Talento'],
    createdAt: '2025-07-01T09:00:00.000Z',
    lastLoginAt: minutesAgo(21),
    isRealAccount: true,
    history: [historyEntry('Cuenta creada', 'Sistema', 320)],
  },
  { id: 'prof-002', name: 'Lic. Sandra Ruiz', email: 'sandra.ruiz@ludiclass.com', role: 'profesor', status: 'activo', subjectNames: ['Mercadotecnia Digital'], createdAt: '2025-07-01T09:00:00.000Z', lastLoginAt: minutesAgo(50), isRealAccount: false, history: [historyEntry('Cuenta creada', 'Sistema', 300)] },
  { id: 'prof-003', name: 'Dr. Roberto Flores', email: 'roberto.flores@ludiclass.com', role: 'profesor', status: 'activo', subjectNames: ['Finanzas Corporativas'], createdAt: '2025-07-01T09:00:00.000Z', lastLoginAt: minutesAgo(60 * 5), isRealAccount: false, history: [historyEntry('Cuenta creada', 'Sistema', 300)] },
  { id: 'prof-004', name: 'Lic. María González', email: 'maria.gonzalez@ludiclass.com', role: 'profesor', status: 'activo', subjectNames: ['Comportamiento Organizacional'], createdAt: '2025-07-01T09:00:00.000Z', lastLoginAt: minutesAgo(15), isRealAccount: false, history: [historyEntry('Cuenta creada', 'Sistema', 300)] },
  { id: 'prof-005', name: 'Ing. Arturo Sánchez', email: 'arturo.sanchez@ludiclass.com', role: 'profesor', status: 'inactivo', subjectNames: [], createdAt: '2025-07-01T09:00:00.000Z', lastLoginAt: minutesAgo(60 * 24 * 45), isRealAccount: false, history: [historyEntry('Cuenta creada', 'Sistema', 300), historyEntry('Desactivado por año sabático', 'Ana Torres Vega', 45)] },
  { id: 'prof-006', name: 'Lic. Patricia López', email: 'patricia.lopez@ludiclass.com', role: 'profesor', status: 'activo', subjectNames: ['Gestión del Talento'], createdAt: '2025-07-01T09:00:00.000Z', lastLoginAt: minutesAgo(90), isRealAccount: false, history: [historyEntry('Cuenta creada', 'Sistema', 300)] },

  {
    id: 'usr-admin-001',
    name: 'Ana Torres Vega',
    email: 'admin@ludiclass.com',
    role: 'administrador',
    status: 'activo',
    subjectNames: [],
    createdAt: '2025-06-01T09:00:00.000Z',
    lastLoginAt: minutesAgo(1),
    isRealAccount: true,
    history: [historyEntry('Cuenta creada', 'Sistema', 350)],
  },
  { id: 'adm-002', name: 'Roberto Salinas Meza', email: 'roberto.salinas@ludiclass.com', role: 'administrador', status: 'activo', subjectNames: [], createdAt: '2025-06-01T09:00:00.000Z', lastLoginAt: minutesAgo(60 * 3), isRealAccount: false, history: [historyEntry('Cuenta creada', 'Sistema', 340)] },
  // Cuentas de Administrador con roles RBAC distintos (Sprint 20) — sin login real, para demostrar la Gestión de Administradores.
  { id: 'adm-003', name: 'Julio César Vidal', email: 'julio.vidal@ludiclass.com', role: 'administrador', status: 'activo', subjectNames: [], createdAt: '2025-09-01T09:00:00.000Z', lastLoginAt: minutesAgo(60 * 8), isRealAccount: false, history: [historyEntry('Cuenta creada', 'Ana Torres Vega', 200)] },
  { id: 'adm-004', name: 'Renata Solórzano Paz', email: 'renata.solorzano@ludiclass.com', role: 'administrador', status: 'activo', subjectNames: [], createdAt: '2025-09-15T09:00:00.000Z', lastLoginAt: minutesAgo(60 * 30), isRealAccount: false, history: [historyEntry('Cuenta creada', 'Ana Torres Vega', 185)] },
  { id: 'adm-005', name: 'Miguel Ángel Torres', email: 'miguel.torres@ludiclass.com', role: 'administrador', status: 'bloqueado', subjectNames: [], createdAt: '2025-10-01T09:00:00.000Z', lastLoginAt: minutesAgo(60 * 24 * 40), isRealAccount: false, history: [historyEntry('Cuenta creada', 'Ana Torres Vega', 170), historyEntry('Suspendido por inactividad prolongada', 'Ana Torres Vega', 40)] },
]

let userSequence = 300

export function listManagedUsers(role?: Role): ManagedUser[] {
  return role ? USERS.filter((item) => item.role === role) : USERS
}

export function findManagedUser(userId: string): ManagedUser | null {
  return USERS.find((item) => item.id === userId) ?? null
}

function pushHistory(user: ManagedUser, action: string, performedByName: string) {
  user.history = [historyEntry(action, performedByName, 0), ...user.history]
}

export function updateManagedUser(userId: string, input: ManagedUserEditInput, performedByName: string): ManagedUser | null {
  const user = USERS.find((item) => item.id === userId)
  if (!user) return null
  user.name = input.name
  user.email = input.email
  if (input.matricula !== undefined) user.matricula = input.matricula
  pushHistory(user, 'Datos editados', performedByName)
  return user
}

/** Alta de un usuario nuevo (Sprint 19, Parte 2) — nunca se elimina físicamente, solo se da de baja lógica (`setManagedUserStatus`). */
export function createManagedUser(input: ManagedUserCreateInput, performedByName: string): ManagedUser {
  userSequence += 1
  const user: ManagedUser = {
    id: `usr-${userSequence}`,
    name: input.name,
    email: input.email,
    role: input.role,
    status: 'activo',
    matricula: input.matricula,
    careerName: input.careerName,
    groupName: input.groupName,
    subjectNames: [],
    createdAt: new Date().toISOString(),
    isRealAccount: false,
    history: [historyEntry('Cuenta creada', performedByName, 0)],
  }
  USERS = [user, ...USERS]
  return user
}

/** Registra el último acceso (Sprint 19, Parte 2) — lo llama `AuditListener` al reaccionar a `USER_LOGIN`, nunca la UI directamente. */
export function recordManagedUserLogin(userId: string): ManagedUser | null {
  const user = USERS.find((item) => item.id === userId)
  if (!user) return null
  user.lastLoginAt = new Date().toISOString()
  return user
}

export function setManagedUserStatus(userId: string, status: ManagedUserStatus, performedByName: string): ManagedUser | null {
  const user = USERS.find((item) => item.id === userId)
  if (!user) return null
  user.status = status
  const label = status === 'activo' ? 'Activada' : status === 'inactivo' ? 'Desactivada' : 'Bloqueada'
  pushHistory(user, `${label} por el administrador`, performedByName)
  return user
}

export function resetManagedUserPassword(userId: string, performedByName: string): ManagedUser | null {
  const user = USERS.find((item) => item.id === userId)
  if (!user) return null
  pushHistory(user, 'Contraseña restablecida', performedByName)
  return user
}

export function changeManagedUserGroup(userId: string, groupName: string, performedByName: string): ManagedUser | null {
  const user = USERS.find((item) => item.id === userId)
  if (!user) return null
  user.groupName = groupName
  pushHistory(user, `Grupo cambiado a "${groupName}"`, performedByName)
  return user
}

export function changeManagedUserCareer(userId: string, careerName: string, performedByName: string): ManagedUser | null {
  const user = USERS.find((item) => item.id === userId)
  if (!user) return null
  user.careerName = careerName
  pushHistory(user, `Carrera cambiada a "${careerName}"`, performedByName)
  return user
}

export function changeManagedUserSubjects(userId: string, subjectNames: string[], performedByName: string): ManagedUser | null {
  const user = USERS.find((item) => item.id === userId)
  if (!user) return null
  user.subjectNames = subjectNames
  pushHistory(user, 'Materias actualizadas', performedByName)
  return user
}

export function changeManagedUserRole(userId: string, role: Role, performedByName: string): ManagedUser | null {
  const user = USERS.find((item) => item.id === userId)
  if (!user) return null
  user.role = role
  pushHistory(user, `Rol cambiado a "${role}"`, performedByName)
  return user
}
