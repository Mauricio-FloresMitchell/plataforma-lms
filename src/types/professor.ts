import type {
  Announcement,
  RecentActivityItem,
  UpcomingActivityItem,
} from '@/types/dashboard'

/**
 * Tipos de dominio de la experiencia Profesor.
 * Los tipos transversales de dashboard viven en `@/types/dashboard`.
 */

export interface ProfessorSummary {
  professorName: string
  departmentName: string
  periodName: string
}

export interface ProfessorKpis {
  assignedStudents: number
  groupsCount: number
  pendingReviews: number
  subjectsCount: number
}

export interface ProfessorSubject {
  id: string
  name: string
  groupName: string
  studentsCount: number
}

export interface PendingReport {
  id: string
  studentName: string
  subjectName: string
  week: number
  /** Fecha ISO 8601 de envío. */
  submittedAt: string
}

/** Payload completo del Dashboard del Profesor. */
export interface ProfessorDashboard {
  summary: ProfessorSummary
  kpis: ProfessorKpis
  subjects: ProfessorSubject[]
  pendingReports: PendingReport[]
  recentActivity: RecentActivityItem[]
  upcomingActivities: UpcomingActivityItem[]
  announcements: Announcement[]
}
