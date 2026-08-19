import type { AcademicTerm, AcademicTermInput, StudyPlan, StudyPlanInput } from '@/types/academicPlan'

/** Almacén simulado de Planes de Estudio y Cuatrimestres (Sprint 19, Parte 4). */

let sequence = 0
function nextId(prefix: string): string {
  sequence += 1
  return `${prefix}-${sequence}`
}

let PLANS: StudyPlan[] = [
  { id: nextId('plan'), careerId: 'car-001', careerName: 'Administración', name: 'Plan Administración 2024', totalTerms: 9, createdAt: '2024-01-15T09:00:00.000Z' },
  { id: nextId('plan'), careerId: 'car-002', careerName: 'Mercadotecnia', name: 'Plan Mercadotecnia 2024', totalTerms: 9, createdAt: '2024-01-15T09:00:00.000Z' },
]

let TERMS: AcademicTerm[] = [
  { id: nextId('term'), planId: PLANS[0].id, planName: PLANS[0].name, number: 1, subjectNames: ['Clase Modelo 1 y Modelo 2'] },
]

export function listStudyPlans(): StudyPlan[] {
  return PLANS
}

export function insertStudyPlan(input: StudyPlanInput): StudyPlan {
  const plan: StudyPlan = { id: nextId('plan'), ...input, createdAt: new Date().toISOString() }
  PLANS = [...PLANS, plan]
  return plan
}

export function deleteStudyPlan(planId: string): boolean {
  const before = PLANS.length
  PLANS = PLANS.filter((plan) => plan.id !== planId)
  TERMS = TERMS.filter((term) => term.planId !== planId)
  return PLANS.length < before
}

export function listAcademicTerms(planId?: string): AcademicTerm[] {
  return planId ? TERMS.filter((term) => term.planId === planId) : TERMS
}

export function insertAcademicTerm(input: AcademicTermInput): AcademicTerm | null {
  const plan = PLANS.find((item) => item.id === input.planId)
  if (!plan) return null
  const term: AcademicTerm = { id: nextId('term'), planId: input.planId, planName: plan.name, number: input.number, subjectNames: input.subjectNames }
  TERMS = [...TERMS, term]
  return term
}

export function deleteAcademicTerm(termId: string): boolean {
  const before = TERMS.length
  TERMS = TERMS.filter((term) => term.id !== termId)
  return TERMS.length < before
}
