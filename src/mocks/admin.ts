import type { AdminDashboard } from '@/types/admin'

/**
 * Datos simulados del Dashboard del Administrador.
 * Fuente única de datos mientras no exista backend.
 * Sustituir esta fuente no debe afectar a los componentes.
 */
const DASHBOARD_BY_ADMIN: Record<string, AdminDashboard> = {
  'usr-admin-001': {
    summary: {
      adminName: 'Ana Torres Vega',
      institutionName: 'Universidad Imperalianz',
      periodName: 'Ciclo 2026-1',
    },
    // `kpis` se sobrescribe siempre con el cálculo en vivo de `admin.service.ts`
    // (Sprint 13, Dashboard Ejecutivo) — este bloque solo satisface el tipo.
    kpis: {
      registeredUsers: 0,
      students: 0,
      professors: 0,
      groups: 0,
      administrators: 0,
      careers: 0,
      subjects: 0,
      reportsSubmitted: 0,
      reportsPending: 0,
      evaluationsCompleted: 0,
      institutionalAveragePercentage: 0,
      activeUsers: 0,
      newRegistrations: 0,
      forumPosts: 0,
      forumComments: 0,
      badgesAwarded: 0,
      totalPointsAwarded: 0,
      eliteStudents: 0,
      systemStatus: '',
    },
    // `executive`/`alerts` se sobrescriben siempre con el cálculo en vivo de
    // `admin.service.ts` (Sprint 19, Dashboard Ejecutivo) — solo satisfacen el tipo.
    executive: {
      activeUsers: 0,
      studentsConnected: 0,
      professorsConnected: 0,
      pendingRequests: 0,
      reportsToReview: 0,
      evaluationsPending: 0,
      titulacionPending: 0,
      openTickets: 0,
      systemStatus: '',
    },
    alerts: [],
    effectivePermissions: [],
    indicators: [
      { id: 'ind-001', label: 'Reportes entregados', value: 78, hint: 'del periodo' },
      { id: 'ind-002', label: 'Participación en foro', value: 61, hint: 'usuarios activos' },
      { id: 'ind-003', label: 'Avance del periodo', value: 70 },
      { id: 'ind-004', label: 'Ocupación de grupos', value: 85 },
    ],
    recentActivity: [
      {
        id: 'aact-001',
        kind: 'report',
        title: 'Nuevo alumno registrado',
        description: 'Se dio de alta a Wendy Vázquez en el grupo CMM-101.',
        date: '2026-07-23T15:40:00.000Z',
      },
      {
        id: 'aact-002',
        kind: 'feedback',
        title: 'Profesor asignado',
        description: 'Lic. Yesus González fue asignado a Clase Modelo 1 y Modelo 2.',
        date: '2026-07-23T11:10:00.000Z',
      },
      {
        id: 'aact-003',
        kind: 'evaluation',
        title: 'Grupo creado',
        description: 'Se creó el grupo CMM-101 para el Ciclo 2026-1.',
        date: '2026-07-22T09:25:00.000Z',
      },
      {
        id: 'aact-004',
        kind: 'badge',
        title: 'Carrera actualizada',
        description: 'Se actualizó el plan de Licenciatura en Administración.',
        date: '2026-07-21T17:00:00.000Z',
      },
    ],
    announcements: [
      {
        id: 'aann-001',
        title: 'Cierre de periodo',
        body: 'El Ciclo 2026-1 cierra el 31 de julio. Verifica la captura de datos.',
        date: '2026-07-23T08:00:00.000Z',
        level: 'warning',
      },
      {
        id: 'aann-002',
        title: 'Mantenimiento programado',
        body: 'La plataforma tendrá mantenimiento el domingo de 02:00 a 04:00.',
        date: '2026-07-20T08:00:00.000Z',
        level: 'info',
      },
    ],
  },
}

/** Dashboard vacío para administradores sin datos registrados. */
const EMPTY_DASHBOARD: AdminDashboard = {
  summary: {
    adminName: '',
    institutionName: 'Universidad Imperalianz',
    periodName: 'Sin periodo activo',
  },
  kpis: {
    registeredUsers: 0,
    students: 0,
    professors: 0,
    groups: 0,
    administrators: 0,
    careers: 0,
    subjects: 0,
    reportsSubmitted: 0,
    reportsPending: 0,
    evaluationsCompleted: 0,
    institutionalAveragePercentage: 0,
    activeUsers: 0,
    newRegistrations: 0,
    forumPosts: 0,
    forumComments: 0,
    badgesAwarded: 0,
    totalPointsAwarded: 0,
    eliteStudents: 0,
    systemStatus: '',
  },
  executive: {
    activeUsers: 0,
    studentsConnected: 0,
    professorsConnected: 0,
    pendingRequests: 0,
    reportsToReview: 0,
    evaluationsPending: 0,
    titulacionPending: 0,
    openTickets: 0,
    systemStatus: '',
  },
  alerts: [],
  effectivePermissions: [],
  indicators: [],
  recentActivity: [],
  announcements: [],
}

export function findAdminDashboard(adminId: string): AdminDashboard | null {
  return DASHBOARD_BY_ADMIN[adminId] ?? null
}

export function buildEmptyAdminDashboard(adminName: string): AdminDashboard {
  return {
    ...EMPTY_DASHBOARD,
    summary: { ...EMPTY_DASHBOARD.summary, adminName },
  }
}
