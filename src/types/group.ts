/** Tipos de dominio del módulo de Grupos (Sprint 13, Parte 4). */

export interface Group {
  id: string
  name: string
  subjectId: string
  subjectName: string
  professorName: string
  capacity: number
  enrolledCount: number
  isActive: boolean
  createdAt: string
}

export interface GroupInput {
  name: string
  subjectId: string
  professorName: string
  capacity: number
}
