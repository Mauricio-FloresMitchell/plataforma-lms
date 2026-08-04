/**
 * Tipos de dominio de Configuración Institucional (Sprint 13, Parte 11).
 *
 * `primaryColor` es un dato administrable (se guarda y se muestra), pero
 * deliberadamente **no** se aplica al tema visual real de la plataforma —
 * la Parte 14 del mismo sprint prohíbe modificar el diseño/tema existente.
 * Cambiar el theming real requeriría tocar las variables CSS globales, fuera
 * de alcance aquí.
 */
export interface InstitutionSettings {
  universityName: string
  logoUrl: string
  primaryColor: string
  activePeriod: string
  schoolCycle: string
  evaluationScaleNote: string
  leaderboardEnabled: boolean
  badgesEnabled: boolean
  pdfTemplateNote: string
  emailTemplateNote: string
  variables: InstitutionVariable[]
  updatedAt: string
  updatedByName?: string
}

export interface InstitutionVariable {
  key: string
  value: string
}
