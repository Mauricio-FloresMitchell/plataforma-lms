import {
  deleteAcademicTerm,
  deleteStudyPlan,
  insertAcademicTerm,
  insertStudyPlan,
  listAcademicTerms,
  listStudyPlans,
} from '@/mocks/academicPlans'
import { recordAudit, type AuditActor } from '@/services/audit.service'
import type { AcademicTerm, AcademicTermInput, StudyPlan, StudyPlanInput } from '@/types/academicPlan'

/**
 * Capa de acceso a datos de Planes de Estudio y Cuatrimestres (Sprint 19,
 * Parte 4). Vive dentro del hub de Gestión Académica, pero es un módulo de
 * datos independiente — mismo criterio que Carreras/Materias/Grupos.
 */

const NETWORK_DELAY_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getStudyPlansAsync(): Promise<StudyPlan[]> {
  await delay(NETWORK_DELAY_MS)
  return listStudyPlans()
}

export async function createStudyPlanAsync(actor: AuditActor, input: StudyPlanInput): Promise<StudyPlan> {
  await delay(NETWORK_DELAY_MS)
  const plan = insertStudyPlan(input)
  recordAudit(actor, 'Gestión Académica', `Creó el plan de estudios "${plan.name}"`, undefined, plan)
  return plan
}

export async function deleteStudyPlanAsync(actor: AuditActor, planId: string, planName: string): Promise<boolean> {
  await delay(NETWORK_DELAY_MS)
  const removed = deleteStudyPlan(planId)
  if (removed) recordAudit(actor, 'Gestión Académica', `Eliminó el plan de estudios "${planName}"`)
  return removed
}

export async function getAcademicTermsAsync(planId?: string): Promise<AcademicTerm[]> {
  await delay(NETWORK_DELAY_MS)
  return listAcademicTerms(planId)
}

export async function createAcademicTermAsync(actor: AuditActor, input: AcademicTermInput): Promise<AcademicTerm | null> {
  await delay(NETWORK_DELAY_MS)
  const term = insertAcademicTerm(input)
  if (term) recordAudit(actor, 'Gestión Académica', `Agregó el cuatrimestre ${term.number} a "${term.planName}"`, undefined, term)
  return term
}

export async function deleteAcademicTermAsync(actor: AuditActor, termId: string, planName: string, number: number): Promise<boolean> {
  await delay(NETWORK_DELAY_MS)
  const removed = deleteAcademicTerm(termId)
  if (removed) recordAudit(actor, 'Gestión Académica', `Eliminó el cuatrimestre ${number} de "${planName}"`)
  return removed
}
