/**
 * Centro de Incidencias (Sprint 19, Parte 8).
 *
 * Único bandeja de entrada para todo lo que antes vivía disperso: reportes
 * del Foro (recibidos automáticamente vía `IncidentSyncListener`) y
 * solicitudes académicas/técnicas/administrativas (creadas manualmente por
 * el Administrador — no existe todavía un formulario de Alumno/Profesor
 * para generarlas directamente, alcance deliberadamente reducido de este
 * sprint; ver `docs/DECISIONS.md`).
 */

export type IncidentOrigin = 'foro' | 'academica' | 'tecnica' | 'administrativa'

export const INCIDENT_ORIGIN_LABELS: Record<IncidentOrigin, string> = {
  foro: 'Reporte del Foro',
  academica: 'Solicitud académica',
  tecnica: 'Solicitud técnica',
  administrativa: 'Solicitud administrativa',
}

export type IncidentStatus = 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado'

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  abierto: 'Abierto',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
}

export type IncidentPriority = 'baja' | 'media' | 'alta'

export interface IncidentHistoryEntry {
  id: string
  action: string
  performedByName: string
  note?: string
  createdAt: string
}

export interface Incident {
  id: string
  title: string
  description: string
  origin: IncidentOrigin
  status: IncidentStatus
  priority: IncidentPriority
  reportedById: string
  reportedByName: string
  responsibleName?: string
  /** Módulo de origen cuando la incidencia se generó automáticamente (ej. "Foro"). */
  relatedModule?: string
  /** Ruta interna al contenido de origen (ej. la publicación reportada). */
  relatedLink?: string
  createdAt: string
  updatedAt: string
  history: IncidentHistoryEntry[]
}

export interface IncidentCreateInput {
  title: string
  description: string
  origin: IncidentOrigin
  priority: IncidentPriority
  reportedById: string
  reportedByName: string
  relatedModule?: string
  relatedLink?: string
}

export interface IncidentFilters {
  origin?: IncidentOrigin
  status?: IncidentStatus
  query?: string
}
