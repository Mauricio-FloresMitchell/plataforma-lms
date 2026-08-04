import type { Role } from '@/types/auth'

/** Tipos de dominio de la difusión de avisos del Administrador (Sprint 13, Parte 9). */

export type BroadcastStatus = 'borrador' | 'programada' | 'enviada' | 'archivada'

export type BroadcastAudienceType = 'todos' | 'carrera' | 'grupo' | 'profesor' | 'alumno' | 'rol'

export const AUDIENCE_LABELS: Record<BroadcastAudienceType, string> = {
  todos: 'Todos',
  carrera: 'Por carrera',
  grupo: 'Por grupo',
  profesor: 'Por profesor',
  alumno: 'Por alumno',
  rol: 'Por rol',
}

export interface NotificationBroadcast {
  id: string
  title: string
  content: string
  audienceType: BroadcastAudienceType
  /** Nombre del destino cuando `audienceType` no es `'todos'` (ej. nombre de carrera, de grupo, del alumno). */
  audienceTarget?: string
  role?: Role
  status: BroadcastStatus
  scheduledFor?: string
  createdByName: string
  createdAt: string
  sentAt?: string
}

export interface BroadcastInput {
  title: string
  content: string
  audienceType: BroadcastAudienceType
  audienceTarget?: string
  role?: Role
  scheduledFor?: string
}
