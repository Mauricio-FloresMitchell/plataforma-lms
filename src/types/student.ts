import type {
  Announcement,
  RecentActivityItem,
  UpcomingActivityItem,
} from '@/types/dashboard'
import type { CompetencyLevel } from '@/types/evaluation'

/**
 * Tipos de dominio de la experiencia Alumno.
 * La escala de competencias (RN-005) vive en `@/types/evaluation`.
 * Los tipos transversales de dashboard viven en `@/types/dashboard`.
 */
export type { CompetencyLevel }

export interface StudentSummary {
  studentName: string
  careerName: string
  groupName: string
  periodName: string
}

export interface StudentKpis {
  subjectsCount: number
  pendingReports: number
  badgesEarned: number
  competencyLevel: CompetencyLevel
}

export interface CompetencyProgress {
  id: string
  name: string
  level: CompetencyLevel
}

export interface StudentProgress {
  /** Actividades cubiertas del periodo (avance, no calificación). */
  completedActivities: number
  totalActivities: number
  percentage: number
  competencies: CompetencyProgress[]
}

export interface StudentSubject {
  id: string
  name: string
  teacherName: string
  /** Avance del curso en porcentaje. */
  progress: number
}

/** Payload completo del Dashboard del Alumno. */
export interface StudentDashboard {
  summary: StudentSummary
  kpis: StudentKpis
  progress: StudentProgress
  subjects: StudentSubject[]
  recentActivity: RecentActivityItem[]
  upcomingActivities: UpcomingActivityItem[]
  announcements: Announcement[]
}
