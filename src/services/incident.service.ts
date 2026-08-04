import {
  assignIncidentResponsible,
  findIncident,
  insertIncident,
  listIncidents,
  setIncidentPriority,
  setIncidentStatus,
} from '@/mocks/incidents'
import { recordAudit, type AuditActor } from '@/services/audit.service'
import type { Incident, IncidentCreateInput, IncidentFilters, IncidentPriority, IncidentStatus } from '@/types/incident'

/**
 * Capa de acceso a datos del Centro de Incidencias (Sprint 19, Parte 8).
 * Único punto que combina el almacén en memoria con Auditoría — recibe
 * automáticamente reportes del Foro vía `IncidentSyncListener`
 * (`core/events/listeners`), que llama a `createIncidentAsync` igual que
 * cualquier otro llamador.
 */

const NETWORK_DELAY_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getIncidentsAsync(filters?: IncidentFilters): Promise<Incident[]> {
  await delay(NETWORK_DELAY_MS)
  return listIncidents(filters).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getIncidentAsync(incidentId: string): Promise<Incident | null> {
  await delay(NETWORK_DELAY_MS)
  return findIncident(incidentId)
}

export async function createIncidentAsync(input: IncidentCreateInput): Promise<Incident> {
  const incident = insertIncident(input)
  recordAudit(
    { id: input.reportedById, name: input.reportedByName, role: 'administrador' },
    'Incidencias',
    `Se registró la incidencia "${incident.title}" (${incident.origin})`,
    undefined,
    incident,
  )
  return incident
}

export async function setIncidentStatusAsync(actor: AuditActor, incidentId: string, status: IncidentStatus, note?: string): Promise<Incident | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findIncident(incidentId)
  const incident = setIncidentStatus(incidentId, status, actor.name, note)
  if (incident) recordAudit(actor, 'Incidencias', `Cambió el estado de "${incident.title}" a "${status}"`, before, incident)
  return incident
}

export async function assignIncidentResponsibleAsync(actor: AuditActor, incidentId: string, responsibleName: string): Promise<Incident | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findIncident(incidentId)
  const incident = assignIncidentResponsible(incidentId, responsibleName, actor.name)
  if (incident) recordAudit(actor, 'Incidencias', `Asignó "${incident.title}" a ${responsibleName}`, before, incident)
  return incident
}

export async function setIncidentPriorityAsync(actor: AuditActor, incidentId: string, priority: IncidentPriority): Promise<Incident | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findIncident(incidentId)
  const incident = setIncidentPriority(incidentId, priority, actor.name)
  if (incident) recordAudit(actor, 'Incidencias', `Cambió la prioridad de "${incident.title}" a "${priority}"`, before, incident)
  return incident
}
