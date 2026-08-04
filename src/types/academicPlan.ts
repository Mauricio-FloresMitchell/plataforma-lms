/**
 * Planes de Estudio y Cuatrimestres (Sprint 19, Parte 4: "Gestión Académica").
 * Conceptos nuevos de este sprint — antes solo existían Carreras y Materias
 * sueltas, sin una entidad que agrupe cuántos cuatrimestres tiene un plan ni
 * qué materias corresponden a cada uno.
 */

export interface StudyPlan {
  id: string
  careerId: string
  careerName: string
  name: string
  totalTerms: number
  createdAt: string
}

export interface StudyPlanInput {
  careerId: string
  careerName: string
  name: string
  totalTerms: number
}

export interface AcademicTerm {
  id: string
  planId: string
  planName: string
  number: number
  subjectNames: string[]
}

export interface AcademicTermInput {
  planId: string
  number: number
  subjectNames: string[]
}
