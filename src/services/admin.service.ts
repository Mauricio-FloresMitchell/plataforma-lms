import { buildEmptyAdminDashboard, findAdminDashboard } from '@/mocks/admin'
import { listCareers } from '@/mocks/careers'
import { getAdminSubjects } from '@/mocks/subjects'
import { listGroups } from '@/mocks/groups'
import { listManagedUsers } from '@/mocks/userManagement'
import { listAllReports } from '@/mocks/reports'
import { getAdminEvaluations } from '@/mocks/evaluations'
import { listPosts } from '@/mocks/forum'
import { listIncidents } from '@/mocks/incidents'
import { getGlobalLeaderboardAsync, listAllPointMovementsAsync } from '@/services/gamification.service'
import { listTitulacionProductsAsync } from '@/services/titulacion.service'
import { getEffectivePermissionsAsync } from '@/services/rbac.service'
import { getAuditLogAsync } from '@/services/audit.service'
import type { AdminAlert, AdminDashboard, AdminExecutiveIndicators, AdminKpis, SecurityOverview } from '@/types/admin'

/**
 * Capa de acceso a datos de la experiencia Administrador.
 *
 * Es el único archivo que conoce el origen de los datos.
 * Migrar a Google Sheets, API REST o PostgreSQL implica reemplazar el cuerpo
 * de estas funciones; la firma pública y los componentes no cambian.
 *
 * Sprint 13 (Dashboard Ejecutivo, Parte 1): `kpis` pasó de ser un bloque fijo
 * sembrado en `mocks/admin.ts` a calcularse en vivo componiendo los módulos
 * administrados por este mismo sprint (Carreras, Materias, Grupos, Usuarios,
 * Reportes, Evaluaciones, Leaderboard, Foro) — mismo patrón de "componer
 * varios mocks/servicios en el servicio" ya usado por `gamification.service.ts`.
 */

const NETWORK_DELAY_MS = 600

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function calculateInstitutionalAverage(): number {
  const percentages = getAdminEvaluations().flatMap((evaluation) => evaluation.competencies.map((c) => c.percentage))
  if (percentages.length === 0) return 0
  return Math.round(percentages.reduce((sum, value) => sum + value, 0) / percentages.length)
}

async function computeKpis(): Promise<AdminKpis> {
  const students = listManagedUsers('alumno')
  const professors = listManagedUsers('profesor')
  const administrators = listManagedUsers('administrador')
  const allUsers = [...students, ...professors, ...administrators]

  const reports = listAllReports()
  const posts = listPosts()
  const [leaderboard, movements] = await Promise.all([getGlobalLeaderboardAsync(), listAllPointMovementsAsync()])

  const thirtyDaysAgo = Date.now() - 30 * 86_400_000
  const newRegistrations = allUsers.filter((user) => new Date(user.createdAt).getTime() >= thirtyDaysAgo).length
  const hasBlockedUsers = allUsers.some((user) => user.status === 'bloqueado')

  return {
    registeredUsers: allUsers.length,
    students: students.length,
    professors: professors.length,
    administrators: administrators.length,
    groups: listGroups().length,
    careers: listCareers().length,
    subjects: getAdminSubjects().length,
    reportsSubmitted: reports.length,
    reportsPending: reports.filter((report) => report.status === 'pendiente').length,
    evaluationsCompleted: getAdminEvaluations().filter((evaluation) => evaluation.status === 'publicada').length,
    institutionalAveragePercentage: calculateInstitutionalAverage(),
    activeUsers: allUsers.filter((user) => user.status === 'activo').length,
    newRegistrations,
    forumPosts: posts.length,
    forumComments: posts.reduce((sum, post) => sum + post.commentCount, 0),
    badgesAwarded: leaderboard.reduce((sum, entry) => sum + entry.badgeIds.length, 0),
    totalPointsAwarded: movements.filter((movement) => movement.points > 0).reduce((sum, movement) => sum + movement.points, 0),
    eliteStudents: leaderboard.filter((entry) => entry.status === 'destacado').length,
    systemStatus: hasBlockedUsers ? 'Atención requerida' : 'Operativo',
  }
}

/** Ventana de "conectado" para el Dashboard Ejecutivo (Sprint 19, Parte 1) — sin presencia en tiempo real, se aproxima con `lastLoginAt`. */
const ONLINE_WINDOW_MS = 15 * 60_000

/**
 * Indicadores del Dashboard Ejecutivo (Sprint 19, Parte 1): reemplaza el
 * `KpiGrid` de 18 tarjetas por el set curado que pidió el sprint. Todos se
 * derivan en vivo de los mismos módulos administrados, nunca capturados a
 * mano.
 */
async function computeExecutiveIndicators(): Promise<AdminExecutiveIndicators> {
  const allUsers = listManagedUsers()
  const students = allUsers.filter((user) => user.role === 'alumno')
  const professors = allUsers.filter((user) => user.role === 'profesor')
  const now = Date.now()
  const isConnected = (lastLoginAt?: string) => !!lastLoginAt && now - new Date(lastLoginAt).getTime() <= ONLINE_WINDOW_MS

  const [evaluations, incidents, titulacionProducts] = await Promise.all([
    Promise.resolve(getAdminEvaluations()),
    Promise.resolve(listIncidents()),
    listTitulacionProductsAsync(),
  ])

  const hasBlockedUsers = allUsers.some((user) => user.status === 'bloqueado')

  return {
    activeUsers: allUsers.filter((user) => user.status === 'activo').length,
    studentsConnected: students.filter((user) => isConnected(user.lastLoginAt)).length,
    professorsConnected: professors.filter((user) => isConnected(user.lastLoginAt)).length,
    pendingRequests: incidents.filter((incident) => incident.status === 'abierto').length,
    reportsToReview: listAllReports().filter((report) => report.status === 'pendiente').length,
    evaluationsPending: evaluations.filter((evaluation) => evaluation.status !== 'publicada').length,
    titulacionPending: titulacionProducts.filter((product) => product.phases.some((phase) => phase.status === 'enviada')).length,
    openTickets: incidents.filter((incident) => incident.status === 'abierto' || incident.status === 'en_proceso').length,
    systemStatus: hasBlockedUsers ? 'Atención requerida' : 'Operativo',
  }
}

/** Alertas del Dashboard Ejecutivo (Sprint 19, Parte 1) — condiciones que ameritan atención inmediata del Administrador. */
async function computeAlerts(): Promise<AdminAlert[]> {
  const allUsers = listManagedUsers()
  const blockedCount = allUsers.filter((user) => user.status === 'bloqueado').length
  const incidents = listIncidents()
  const highPriorityOpen = incidents.filter((incident) => incident.priority === 'alta' && incident.status !== 'resuelto' && incident.status !== 'cerrado')
  const reportsPending = listAllReports().filter((report) => report.status === 'pendiente').length

  const alerts: AdminAlert[] = []
  if (blockedCount > 0) {
    alerts.push({ id: 'alert-blocked', level: 'critical', message: `${blockedCount} cuenta(s) bloqueada(s) requieren revisión.`, to: '/admin/usuarios' })
  }
  if (highPriorityOpen.length > 0) {
    alerts.push({ id: 'alert-incidents', level: 'warning', message: `${highPriorityOpen.length} incidencia(s) de prioridad alta sin resolver.`, to: '/admin/incidencias' })
  }
  if (reportsPending > 10) {
    alerts.push({ id: 'alert-reports', level: 'info', message: `${reportsPending} reportes semanales acumulados sin revisar.`, to: '/admin/reportes' })
  }
  return alerts
}

/**
 * Obtiene el Dashboard completo de un administrador.
 * Si el administrador no tiene datos registrados devuelve un dashboard vacío,
 * de modo que la interfaz siempre pueda renderizar estados vacíos.
 */
export async function getAdminDashboard(
  adminId: string,
  adminName = '',
): Promise<AdminDashboard> {
  const [, kpis, executive, alerts, effectivePermissions] = await Promise.all([
    delay(NETWORK_DELAY_MS),
    computeKpis(),
    computeExecutiveIndicators(),
    computeAlerts(),
    getEffectivePermissionsAsync(adminId),
  ])

  const dashboard = findAdminDashboard(adminId) ?? buildEmptyAdminDashboard(adminName)
  return { ...dashboard, kpis, executive, alerts, effectivePermissions }
}

/** Reutilizado por el hub de Gestión Académica (Sprint 19, Parte 4) para sus tarjetas de resumen. */
export async function getAcademicSummaryAsync(): Promise<AdminKpis> {
  await delay(NETWORK_DELAY_MS)
  return computeKpis()
}

/**
 * Panel de Seguridad (Sprint 20): íntegramente derivado de Usuarios y
 * Auditoría, ya construidos en sprints anteriores — no introduce un store
 * de "sesiones" nuevo, aproxima "sesiones abiertas" con la misma ventana de
 * 15 minutos que ya usa el Dashboard Ejecutivo para "conectados".
 */
export async function getSecurityOverviewAsync(): Promise<SecurityOverview> {
  await delay(NETWORK_DELAY_MS)
  const allUsers = listManagedUsers()
  const admins = allUsers.filter((u) => u.role === 'administrador')
  const now = Date.now()
  const isConnected = (lastLoginAt?: string) => !!lastLoginAt && now - new Date(lastLoginAt).getTime() <= ONLINE_WINDOW_MS

  const auditLog = await getAuditLogAsync()
  const failedAttempts = auditLog.filter((entry) => entry.action === 'Intento de inicio de sesión fallido').length
  const passwordResets = auditLog.filter((entry) => entry.action.startsWith('Restableció la contraseña')).length
  const criticalChanges = auditLog.filter(
    (entry) => entry.module === 'Roles y Permisos' || entry.action.startsWith('Cambió el rol de') || entry.action.startsWith('Dio de alta a'),
  ).length

  return {
    activeAdmins: admins.filter((admin) => admin.status === 'activo').length,
    openSessions: allUsers.filter((u) => isConnected(u.lastLoginAt)).length,
    failedAttempts,
    blockedUsers: allUsers.filter((u) => u.status === 'bloqueado').length,
    passwordResets,
    criticalChanges,
    recentActivity: auditLog.slice(0, 15),
  }
}
