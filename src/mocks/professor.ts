import type { ProfessorDashboard } from '@/types/professor'

/**
 * Datos simulados del Dashboard del Profesor.
 * Fuente única de datos mientras no exista backend.
 * Sustituir esta fuente no debe afectar a los componentes.
 */
const DASHBOARD_BY_PROFESSOR: Record<string, ProfessorDashboard> = {
  'usr-profesor-001': {
    summary: {
      professorName: 'Lic. Yesus Eleazar González',
      departmentName: 'Departamento de Administración',
      periodName: 'Ciclo 2026-1',
    },
    kpis: {
      assignedStudents: 16,
      groupsCount: 1,
      pendingReviews: 4,
      subjectsCount: 1,
    },
    subjects: [
      {
        id: 'sub-001',
        name: 'Clase Modelo 1 y Modelo 2',
        groupName: 'CMM-101',
        studentsCount: 16,
      },
    ],
    pendingReports: [
      {
        id: 'rep-101',
        studentName: 'Andrea Guadalupe Mendez Guzman',
        subjectName: 'Clase Modelo 1 y Modelo 2',
        week: 11,
        submittedAt: '2026-07-22T18:10:00.000Z',
      },
      {
        id: 'rep-102',
        studentName: 'Axel Martínez Betanzos',
        subjectName: 'Clase Modelo 1 y Modelo 2',
        week: 11,
        submittedAt: '2026-07-22T09:35:00.000Z',
      },
      {
        id: 'rep-103',
        studentName: 'Edith Hortencia Ramírez Hernández',
        subjectName: 'Clase Modelo 1 y Modelo 2',
        week: 10,
        submittedAt: '2026-07-21T20:05:00.000Z',
      },
      {
        id: 'rep-104',
        studentName: 'Fernando Dominguez Chavez',
        subjectName: 'Clase Modelo 1 y Modelo 2',
        week: 11,
        submittedAt: '2026-07-21T14:50:00.000Z',
      },
    ],
    recentActivity: [
      {
        id: 'pact-001',
        kind: 'report',
        title: 'Reporte recibido',
        description: 'Andrea Mendez envió su reporte de la semana 11.',
        date: '2026-07-22T18:10:00.000Z',
      },
      {
        id: 'pact-002',
        kind: 'badge',
        title: 'Insignia otorgada',
        description: 'Otorgaste Colaboración Destacada a Edith Ramírez.',
        date: '2026-07-21T16:20:00.000Z',
      },
      {
        id: 'pact-003',
        kind: 'evaluation',
        title: 'Competencia registrada',
        description: 'Evaluaste Pensamiento analítico del grupo CMM-101.',
        date: '2026-07-20T12:00:00.000Z',
      },
      {
        id: 'pact-004',
        kind: 'feedback',
        title: 'Retroalimentación enviada',
        description: 'Comentaste el reporte de Fernando Dominguez.',
        date: '2026-07-19T10:15:00.000Z',
      },
    ],
    upcomingActivities: [
      {
        id: 'pupc-001',
        title: 'Cierre de revisión semana 11',
        subtitle: 'Grupo CMM-101',
        dueDate: '2026-07-25T23:59:00.000Z',
      },
      {
        id: 'pupc-002',
        title: 'Registro de competencias',
        subtitle: 'Grupo CMM-101',
        dueDate: '2026-07-28T23:59:00.000Z',
      },
      {
        id: 'pupc-003',
        title: 'Sesión de retroalimentación',
        subtitle: 'Grupo CMM-101',
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
