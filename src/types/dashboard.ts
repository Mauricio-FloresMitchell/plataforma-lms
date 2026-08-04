import type { LucideIcon } from 'lucide-react'

/**
 * Tipos de dominio compartidos por los dashboards de todos los roles.
 * Los widgets que los consumen son agnósticos al rol.
 */

export type ActivityKind = 'report' | 'badge' | 'feedback' | 'evaluation'

export interface RecentActivityItem {
  id: string
  kind: ActivityKind
  title: string
  description: string
  /** Fecha ISO 8601. */
  date: string
}

export interface UpcomingActivityItem {
  id: string
  title: string
  /** Contexto secundario (materia, grupo, etc.). */
  subtitle: string
  /** Fecha ISO 8601. */
  dueDate: string
}

export type AnnouncementLevel = 'info' | 'warning'

export interface Announcement {
  id: string
  title: string
  body: string
  date: string
  level: AnnouncementLevel
}

/** Descriptor de un indicador para la retícula de KPIs. */
export interface StatItem {
  label: string
  value: string | number
  icon: LucideIcon
  hint?: string
}
