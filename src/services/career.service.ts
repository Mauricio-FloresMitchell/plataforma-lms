import { deleteCareer, findCareer, insertCareer, listCareers, setCareerActive, updateCareer } from '@/mocks/careers'
import { recordAudit, type AuditActor } from '@/services/audit.service'
import type { Career, CareerInput } from '@/types/career'

/**
 * Capa de acceso a datos del módulo de Carreras (Sprint 13, Parte 2).
 * Único archivo que conoce el origen de los datos.
 */

const NETWORK_DELAY_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getCareersAsync(): Promise<Career[]> {
  await delay(NETWORK_DELAY_MS)
  return listCareers()
}

export async function createCareerAsync(actor: AuditActor, input: CareerInput): Promise<Career> {
  await delay(NETWORK_DELAY_MS)
  const career = insertCareer(input)
  recordAudit(actor, 'Carreras', `Creó la carrera "${career.name}"`, undefined, career)
  return career
}

export async function updateCareerAsync(actor: AuditActor, careerId: string, input: CareerInput): Promise<Career | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findCareer(careerId)
  const career = updateCareer(careerId, input)
  if (career) recordAudit(actor, 'Carreras', `Editó la carrera "${career.name}"`, before, career)
  return career
}

export async function setCareerActiveAsync(actor: AuditActor, careerId: string, isActive: boolean): Promise<Career | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findCareer(careerId)
  const career = setCareerActive(careerId, isActive)
  if (career) {
    recordAudit(actor, 'Carreras', isActive ? `Activó la carrera "${career.name}"` : `Desactivó la carrera "${career.name}"`, before, career)
  }
  return career
}

export async function deleteCareerAsync(actor: AuditActor, careerId: string): Promise<boolean> {
  await delay(NETWORK_DELAY_MS)
  const before = findCareer(careerId)
  const removed = deleteCareer(careerId)
  if (removed && before) recordAudit(actor, 'Carreras', `Eliminó la carrera "${before.name}"`, before, undefined)
  return removed
}
