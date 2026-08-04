/** Tipos de dominio del módulo de Carreras (Sprint 13, Parte 2). */

export interface Career {
  id: string
  name: string
  code: string
  isActive: boolean
  studentsCount: number
  subjectsCount: number
  professorsCount: number
  createdAt: string
}

export interface CareerInput {
  name: string
  code: string
}
