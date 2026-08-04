import type { Announcement, RecentActivityItem } from '@/types/dashboard'
import type { PermissionKey } from '@/types/rbac'
import type { AuditLogEntry } from '@/types/audit'

/**
 * Tipos de dominio de la experiencia Administrador.
 * Los tipos transversales de dashboard viven en `@/types/dashboard`.
 */

export interface AdminSummary {
  adminName: string
  institutionName: string
  periodName: string
}

export interface AdminKpis {
  registeredUsers: number
  students: number
  professors: number
  groups: number
  /** Ampliado en Sprint 13 (Dashboard Ejecutivo, Parte 1) — todos calculados en vivo desde los módulos administrados. */
  administrators: number
  careers: number
  subjects: number
  reportsSubmitted: number
  reportsPending: number
  evaluationsCompleted: number
  institutionalAveragePercentage: number
  activeUsers: number
  newRegistrations: number
  forumPosts: number
  forumComments: number
  badgesAwarded: number
  totalPointsAwarded: number
  eliteStudents: number
  systemStatus: string
}

export interface InstitutionalIndicator {
  id: string
  label: string
  /** Valor porcentual 0–100. */
  value: number
  hint?: string
}

/**
 * Indicadores del Dashboard Ejecutivo (Sprint 19, Parte 1) — reemplaza el
 * `KpiGrid` de 18 tarjetas por el set curado que pidió el sprint. Todos se
 * calculan en vivo (`admin.service.ts#computeExecutiveIndicators`).
 */
export interface AdminExecutiveIndicators {
  activeUsers: number
  studentsConnected: number
  professorsConnected: number
  pendingRequests: number
  reportsToReview: number
  evaluationsPending: number
  titulacionPending: number
  openTickets: number
  systemStatus: string
}

export type AdminAlertLevel = 'info' | 'warning' | 'critical'

export interface AdminAlert {
  id: string
  level: AdminAlertLevel
  message: string
  to?: string
}

/** Panel de Seguridad (Sprint 20) — derivado de Usuarios y Auditoría, sin un store propio. */
export interface SecurityOverview {
  activeAdmins: number
  openSessions: number
  failedAttempts: number
  blockedUsers: number
  passwordResets: number
  criticalChanges: number
  recentActivity: AuditLogEntry[]
}

/** Payload completo del Dashboard del Administrador. */
export interface AdminDashboard {
  summary: AdminSummary
  kpis: AdminKpis
  executive: AdminExecutiveIndicators
  alerts: AdminAlert[]
  indicators: InstitutionalIndicator[]
  recentActivity: RecentActivityItem[]
  announcements: Announcement[]
  /** Permisos efectivos del administrador en sesión (Sprint 20, RBAC) — rol ∪ permisos personalizados. */
  effectivePermissions: PermissionKey[]
}
