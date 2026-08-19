import type { Incident, IncidentCreateInput, IncidentFilters, IncidentPriority, IncidentStatus } from '@/types/incident'

/** Almacén simulado del Centro de Incidencias (Sprint 19, Parte 8). Estado en memoria durante la sesión. */

let sequence = 0
function nextId(prefix: string): string {
  sequence += 1
  return `${prefix}-${sequence}`
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

function seedIncidents(): Incident[] {
  return [
    {
      id: nextId('inc'),
      title: 'Solicitud de cambio de grupo',
      description: 'El alumno solicita cambiar de grupo por conflicto de horario con otra materia.',
      origin: 'academica',
      status: 'en_proceso',
      priority: 'media',
      reportedById: 'std-004',
      reportedByName: 'Fernando Dominguez Chavez',
      responsibleName: 'Ana Torres Vega',
      createdAt: daysAgo(4),
      updatedAt: daysAgo(1),
      history: [
        { id: nextId('ih'), action: 'Incidencia creada', performedByName: 'Fernando Dominguez Chavez', createdAt: daysAgo(4) },
        { id: nextId('ih'), action: 'Asignada a Ana Torres Vega', performedByName: 'Ana Torres Vega', createdAt: daysAgo(2) },
        { id: nextId('ih'), action: 'Marcada en proceso', performedByName: 'Ana Torres Vega', note: 'Se está validando disponibilidad en el grupo destino.', createdAt: daysAgo(1) },
      ],
    },
    {
      id: nextId('inc'),
      title: 'No puedo subir archivos en Materias',
      description: 'El adjunto de la actividad "Plan de negocios" no carga, el botón se queda girando.',
      origin: 'tecnica',
      status: 'abierto',
      priority: 'alta',
      reportedById: 'std-009',
      reportedByName: 'Liliana León Guadarrama',
      relatedModule: 'Materias',
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
      history: [{ id: nextId('ih'), action: 'Incidencia creada', performedByName: 'Liliana León Guadarrama', createdAt: daysAgo(1) }],
    },
    {
      id: nextId('inc'),
      title: 'Corrección de nombre en constancia',
      description: 'El nombre en la constancia de finalización de curso tiene un error ortográfico.',
      origin: 'administrativa',
      status: 'resuelto',
      priority: 'baja',
      reportedById: 'std-006',
      reportedByName: 'Jessica Flores',
      responsibleName: 'Ana Torres Vega',
      createdAt: daysAgo(10),
      updatedAt: daysAgo(6),
      history: [
        { id: nextId('ih'), action: 'Incidencia creada', performedByName: 'Jessica Flores', createdAt: daysAgo(10) },
        { id: nextId('ih'), action: 'Resuelta', performedByName: 'Ana Torres Vega', note: 'Constancia reemitida con el nombre correcto.', createdAt: daysAgo(6) },
      ],
    },
  ]
}

let INCIDENTS: Incident[] = seedIncidents()

export function listIncidents(filters: IncidentFilters = {}): Incident[] {
  const term = filters.query?.trim().toLowerCase()
  return INCIDENTS.filter((item) => {
    if (filters.origin && item.origin !== filters.origin) return false
    if (filters.status && item.status !== filters.status) return false
    if (term && !`${item.title} ${item.description} ${item.reportedByName}`.toLowerCase().includes(term)) return false
    return true
  })
}

export function findIncident(incidentId: string): Incident | null {
  return INCIDENTS.find((item) => item.id === incidentId) ?? null
}

function pushHistory(incident: Incident, action: string, performedByName: string, note?: string): void {
  incident.history = [...incident.history, { id: nextId('ih'), action, performedByName, note, createdAt: new Date().toISOString() }]
  incident.updatedAt = new Date().toISOString()
}

export function insertIncident(input: IncidentCreateInput): Incident {
  const incident: Incident = {
    id: nextId('inc'),
    title: input.title,
    description: input.description,
    origin: input.origin,
    status: 'abierto',
    priority: input.priority,
    reportedById: input.reportedById,
    reportedByName: input.reportedByName,
    relatedModule: input.relatedModule,
    relatedLink: input.relatedLink,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [{ id: nextId('ih'), action: 'Incidencia creada', performedByName: input.reportedByName, createdAt: new Date().toISOString() }],
  }
  INCIDENTS = [incident, ...INCIDENTS]
  return incident
}

export function setIncidentStatus(incidentId: string, status: IncidentStatus, performedByName: string, note?: string): Incident | null {
  const incident = INCIDENTS.find((item) => item.id === incidentId)
  if (!incident) return null
  incident.status = status
  pushHistory(incident, `Estado cambiado a "${status}"`, performedByName, note)
  return incident
}

export function assignIncidentResponsible(incidentId: string, responsibleName: string, performedByName: string): Incident | null {
  const incident = INCIDENTS.find((item) => item.id === incidentId)
  if (!incident) return null
  incident.responsibleName = responsibleName
  pushHistory(incident, `Asignada a ${responsibleName}`, performedByName)
  return incident
}

export function setIncidentPriority(incidentId: string, priority: IncidentPriority, performedByName: string): Incident | null {
  const incident = INCIDENTS.find((item) => item.id === incidentId)
  if (!incident) return null
  incident.priority = priority
  pushHistory(incident, `Prioridad cambiada a "${priority}"`, performedByName)
  return incident
}
