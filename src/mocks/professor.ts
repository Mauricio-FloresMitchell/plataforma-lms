import type { ProfessorDashboard } from '@/types/professor'

/**
 * Datos simulados del Dashboard del Profesor.
 * Fuente única de datos mientras no exista backend.
 * Sustituir esta fuente no debe afectar a los componentes.
 */
const DASHBOARD_BY_PROFESSOR: Record<string, ProfessorDashboard> = {
  'usr-profesor-001': {
    summary: {
      professorName: 'Carlos Méndez Ruiz',
      departmentName: 'Departamento de Administración',
      periodName: 'Ciclo 2026-1',
    },
    kpis: {
      assignedStudents: 68,
      groupsCount: 4,
      pendingReviews: 9,
      subjectsCount: 3,
    },
    subjects: [
      {
        id: 'sub-001',
        name: 'Administración Estratégica',
        groupName: 'ADM-501',
        studentsCount: 24,
      },
      {
        id: 'sub-004',
        name: 'Comportamiento Organizacional',
        groupName: 'ADM-402',
        studentsCount: 22,
      },
      {
        id: 'sub-007',
        name: 'Gestión del Talento',
        groupName: 'ADM-303',
        studentsCount: 22,
      },
    ],
    pendingReports: [
      {
        id: 'rep-101',
        studentName: 'María García López',
        subjectName: 'Administración Estratégica',
        week: 11,
        submittedAt: '2026-07-22T18:10:00.000Z',
      },
      {
        id: 'rep-102',
        studentName: 'Jorge Ramírez Peña',
        subjectName: 'Comportamiento Organizacional',
        week: 11,
        submittedAt: '2026-07-22T09:35:00.000Z',
      },
      {
        id: 'rep-103',
        studentName: 'Lucía Fernández Mora',
        subjectName: 'Gestión del Talento',
        week: 10,
        submittedAt: '2026-07-21T20:05:00.000Z',
      },
      {
        id: 'rep-104',
        studentName: 'Andrés Solís Vega',
        subjectName: 'Administración Estratégica',
        week: 11,
        submittedAt: '2026-07-21T14:50:00.000Z',
      },
    ],
    recentActivity: [
      {
        id: 'pact-001',
        kind: 'report',
        title: 'Reporte recibido',
        description: 'María García envió su reporte de la semana 11.',
        date: '2026-07-22T18:10:00.000Z',
      },
      {
        id: 'pact-002',
        kind: 'badge',
        title: 'Insignia otorgada',
        description: 'Otorgaste Colaboración Destacada a Lucía Fernández.',
        date: '2026-07-21T16:20:00.000Z',
      },
      {
        id: 'pact-003',
        kind: 'evaluation',
        title: 'Competencia registrada',
        description: 'Evaluaste Pensamiento analítico del grupo ADM-501.',
        date: '2026-07-20T12:00:00.000Z',
      },
      {
        id: 'pact-004',
        kind: 'feedback',
        title: 'Retroalimentación enviada',
        description: 'Comentaste el reporte de Andrés Solís.',
        date: '2026-07-19T10:15:00.000Z',
      },
    ],
    upcomingActivities: [
      {
        id: 'pupc-001',
        title: 'Cierre de revisión semana 11',
        subtitle: 'Grupo ADM-501',
        dueDate: '2026-07-25T23:59:00.000Z',
      },
      {
        id: 'pupc-002',
        title: 'Registro de competencias',
        subtitle: 'Grupo ADM-402',
        dueDate: '2026-07-28T23:59:00.000Z',
      },
      {
        id: 'pupc-003',
        title: 'Sesión de retroalimentación',
        subtitle: 'Grupo ADM-303',
        dueDate: '2026-07-30T23:59:00.000Z',
      },
    ],
    announcements: [
      {
        id: 'pann-001',
        title: 'Cierre de periodo',
        body: 'La captura de evaluaciones cierra el 31 de julio.',
        date: '2026-07-22T08:00:00.000Z',
        level: 'warning',
      },
      {
        id: 'pann-002',
        title: 'Reunión de academia',
        body: 'Reunión del departamento el viernes a las 10:00.',
        date: '2026-07-20T08:00:00.000Z',
        level: 'info',
      },
    ],
  },
}

/** Dashboard vacío para profesores sin datos registrados. */
const EMPTY_DASHBOARD: ProfessorDashboard = {
  summary: {
    professorName: '',
    departmentName: 'Sin departamento asignado',
    periodName: 'Sin periodo activo',
  },
  kpis: {
    assignedStudents: 0,
    groupsCount: 0,
    pendingReviews: 0,
    subjectsCount: 0,
  },
  subjects: [],
  pendingReports: [],
  recentActivity: [],
  upcomingActivities: [],
  announcements: [],
}

export function findProfessorDashboard(professorId: string): ProfessorDashboard | null {
  return DASHBOARD_BY_PROFESSOR[professorId] ?? null
}

export function buildEmptyProfessorDashboard(professorName: string): ProfessorDashboard {
  return {
    ...EMPTY_DASHBOARD,
    summary: { ...EMPTY_DASHBOARD.summary, professorName },
  }
}
