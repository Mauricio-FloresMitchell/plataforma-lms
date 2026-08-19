import type { StudentDashboard } from '@/types/student'

/**
 * Datos simulados del Dashboard del Alumno.
 * Fuente única de datos mientras no exista backend.
 * Sustituir esta fuente no debe afectar a los componentes.
 */
const DASHBOARD_BY_STUDENT: Record<string, StudentDashboard> = {
  'usr-alumno-001': {
    summary: {
      studentName: 'Andrea Guadalupe Mendez Guzman',
      careerName: 'Licenciatura en Administración',
      groupName: 'CMM-101',
      periodName: 'Ciclo 2026-1',
    },
    kpis: {
      subjectsCount: 1,
      pendingReports: 1,
      badgesEarned: 3,
      competencyLevel: 'A',
    },
    progress: {
      completedActivities: 2,
      totalActivities: 3,
      percentage: 67,
      competencies: [
        { id: 'cmp-001', name: 'Pensamiento analítico', level: 'A+' },
        { id: 'cmp-002', name: 'Comunicación efectiva', level: 'A' },
        { id: 'cmp-003', name: 'Trabajo colaborativo', level: 'B+' },
      ],
    },
    subjects: [
      {
        id: 'sub-001',
        name: 'Clase Modelo 1 y Modelo 2',
        teacherName: 'Lic. Yesus Eleazar González',
        progress: 82,
      },
    ],
    recentActivity: [
      {
        id: 'act-001',
        kind: 'feedback',
        title: 'Retroalimentación recibida',
        description: 'Lic. Yesus González comentó tu reporte de la semana 11.',
        date: '2026-07-22T16:30:00.000Z',
      },
      {
        id: 'act-002',
        kind: 'badge',
        title: 'Insignia obtenida',
        description: 'Obtuviste la insignia Colaboración Destacada.',
        date: '2026-07-21T14:05:00.000Z',
      },
      {
        id: 'act-003',
        kind: 'report',
        title: 'Reporte aprobado',
        description: 'Tu reporte semanal de Clase Modelo 1 y Modelo 2 fue aprobado.',
        date: '2026-07-20T11:20:00.000Z',
      },
      {
        id: 'act-004',
        kind: 'evaluation',
        title: 'Competencia evaluada',
        description: 'Pensamiento analítico se actualizó a nivel A+.',
        date: '2026-07-18T09:45:00.000Z',
      },
    ],
    upcomingActivities: [
      {
        id: 'upc-001',
        title: 'Reporte semanal 12',
        subtitle: 'Clase Modelo 1 y Modelo 2',
        dueDate: '2026-07-25T23:59:00.000Z',
      },
      {
        id: 'upc-002',
        title: 'Entrega de evidencias',
        subtitle: 'Clase Modelo 1 y Modelo 2',
        dueDate: '2026-07-27T23:59:00.000Z',
      },
    ],
    announcements: [
      {
        id: 'ann-001',
        title: 'Cierre de periodo',
        body: 'El periodo de entrega de reportes cierra el 31 de julio.',
        date: '2026-07-22T08:00:00.000Z',
        level: 'warning',
      },
      {
        id: 'ann-002',
        title: 'Nueva guía de evidencias',
        body: 'Ya está disponible la guía actualizada para subir evidencias.',
        date: '2026-07-19T08:00:00.000Z',
        level: 'info',
      },
    ],
  },
}

/** Dashboard vacío para alumnos sin datos registrados. */
const EMPTY_DASHBOARD: StudentDashboard = {
  summary: {
    studentName: '',
    careerName: 'Sin carrera asignada',
    groupName: 'Sin grupo',
    periodName: 'Sin periodo activo',
  },
  kpis: {
    subjectsCount: 0,
    pendingReports: 0,
    badgesEarned: 0,
    competencyLevel: 'D',
  },
  progress: {
    completedActivities: 0,
    totalActivities: 0,
    percentage: 0,
    competencies: [],
  },
  subjects: [],
  recentActivity: [],
  upcomingActivities: [],
  announcements: [],
}

export function findStudentDashboard(studentId: string): StudentDashboard | null {
  return DASHBOARD_BY_STUDENT[studentId] ?? null
}

export function buildEmptyDashboard(studentName: string): StudentDashboard {
  return {
    ...EMPTY_DASHBOARD,
    summary: { ...EMPTY_DASHBOARD.summary, studentName },
  }
}
