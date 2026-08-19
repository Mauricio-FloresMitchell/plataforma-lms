import {
  attachCompanyLetter,
  confirmCompany,
  deleteCompany,
  getConfirmedCompany,
  insertCompany,
  listCompaniesForStudent,
  rejectCompany,
} from '@/mocks/companies'
import { emitAppEvent } from '@/core/events/EventBus'
import { recordAudit, type AuditActor } from '@/services/audit.service'
import type { CompanyProspect, CompanyProspectInput } from '@/types/company'

/**
 * Capa de acceso a datos de Empresas / Prospección Estudiantil (Manual de
 * Mejoras Transversales, Mejora 2). Único punto que conoce `mocks/companies.ts`
 * — el Alumno registra y confirma sus empresas candidatas; el Profesor solo
 * consulta el banco de cada alumno, nunca lo edita.
 */

const NETWORK_DELAY_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function listMyCompaniesAsync(subjectId: string, studentId: string): Promise<CompanyProspect[]> {
  await delay(NETWORK_DELAY_MS)
  return listCompaniesForStudent(subjectId, studentId)
}

/** Empresa con la que trabaja actualmente el alumno (Semana 3 en adelante), si ya confirmó una. */
export async function getConfirmedCompanyAsync(subjectId: string, studentId: string): Promise<CompanyProspect | null> {
  await delay(NETWORK_DELAY_MS)
  return getConfirmedCompany(subjectId, studentId)
}

/** Banco de empresas de varios alumnos a la vez, para la vista del Profesor (roster de la materia). */
export async function listCompaniesForRosterAsync(
  subjectId: string,
  studentIds: string[],
): Promise<Record<string, CompanyProspect[]>> {
  await delay(NETWORK_DELAY_MS)
  const result: Record<string, CompanyProspect[]> = {}
  for (const studentId of studentIds) {
    result[studentId] = listCompaniesForStudent(subjectId, studentId)
  }
  return result
}

export async function registerCompanyAsync(
  actor: AuditActor,
  subjectId: string,
  subjectName: string,
  input: CompanyProspectInput,
): Promise<CompanyProspect> {
  await delay(NETWORK_DELAY_MS)
  const company = insertCompany(subjectId, actor.id, actor.name, input)
  emitAppEvent('COMPANY_REGISTERED', {
    companyId: company.id,
    subjectId,
    subjectName,
    studentId: actor.id,
    studentName: actor.name,
    companyName: company.name,
  })
  recordAudit(actor, 'Reportes', `Registró la empresa candidata "${company.name}" en ${subjectName}`)
  return company
}

export async function confirmCompanyAsync(
  actor: AuditActor,
  subjectId: string,
  subjectName: string,
  companyId: string,
  companyName: string,
): Promise<CompanyProspect | null> {
  await delay(NETWORK_DELAY_MS)
  const company = confirmCompany(companyId)
  if (!company) return null
  emitAppEvent('COMPANY_CONFIRMED', {
    companyId: company.id,
    subjectId,
    subjectName,
    studentId: actor.id,
    studentName: actor.name,
    companyName,
  })
  recordAudit(actor, 'Reportes', `Confirmó la empresa "${companyName}" en ${subjectName}`)
  return company
}

export async function rejectCompanyAsync(actor: AuditActor, companyId: string, companyName: string): Promise<CompanyProspect | null> {
  await delay(NETWORK_DELAY_MS)
  const company = rejectCompany(companyId)
  if (company) recordAudit(actor, 'Reportes', `Descartó la empresa candidata "${companyName}"`)
  return company
}

export async function attachCompanyLetterAsync(
  actor: AuditActor,
  companyId: string,
  companyName: string,
  fileName: string,
): Promise<CompanyProspect | null> {
  await delay(NETWORK_DELAY_MS)
  const company = attachCompanyLetter(companyId, fileName)
  if (company) recordAudit(actor, 'Reportes', `Adjuntó la carta firmada de "${companyName}"`)
  return company
}

export async function deleteCompanyAsync(actor: AuditActor, companyId: string, companyName: string): Promise<boolean> {
  await delay(NETWORK_DELAY_MS)
  const removed = deleteCompany(companyId)
  if (removed) recordAudit(actor, 'Reportes', `Eliminó la empresa candidata "${companyName}"`)
  return removed
}
