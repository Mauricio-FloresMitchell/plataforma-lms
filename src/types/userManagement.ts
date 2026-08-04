import type { Role } from '@/types/auth'

/** Tipos de dominio de Administración de Usuarios (Sprint 13, Parte 5). */

export type ManagedUserStatus = 'activo' | 'inactivo' | 'bloqueado'

export interface UserHistoryEntry {
  id: string
  action: string
  performedByName: string
  createdAt: string
}

export interface ManagedUser {
  id: string
  name: string
  email: string
  role: Role
  status: ManagedUserStatus
  /** Matrícula institucional (Sprint 19, Parte 2) — solo aplica a alumnos. */
  matricula?: string
  careerName?: string
  groupName?: string
  subjectNames: string[]
  createdAt: string
  /** Último inicio de sesión registrado (Sprint 19, Parte 2) — solo se actualiza para las 3 cuentas reales, ya que son las únicas con login real. */
  lastLoginAt?: string
  /** `true` para las 3 cuentas reales de inicio de sesión (`mocks/users.ts`) — el resto son registros administrativos, sin login real. */
  isRealAccount: boolean
  history: UserHistoryEntry[]
}

export interface ManagedUserEditInput {
  name: string
  email: string
  matricula?: string
}

/** Alta de un usuario nuevo (Sprint 19, Parte 2). */
export interface ManagedUserCreateInput {
  name: string
  email: string
  role: Role
  matricula?: string
  careerName?: string
  groupName?: string
}
