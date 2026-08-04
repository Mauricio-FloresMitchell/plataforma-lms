import type { InstitutionSettings } from '@/types/institution'

/** Almacén simulado de Configuración Institucional (Sprint 13, Parte 11). Un solo registro, en memoria. */

let SETTINGS: InstitutionSettings = {
  universityName: 'Universidad Imperalianz',
  logoUrl: '',
  primaryColor: '#1D4ED8',
  activePeriod: 'Ciclo 2026-1',
  schoolCycle: '2026-1',
  evaluationScaleNote: 'Escala institucional A+ a F, ver PRD RN-005 / ADR-007/008.',
  leaderboardEnabled: true,
  badgesEnabled: true,
  pdfTemplateNote: 'Plantilla estándar institucional (encabezado, logo, pie de página).',
  emailTemplateNote: 'Plantilla estándar de correo institucional.',
  variables: [
    { key: 'nombre_corto', value: 'Imperalianz' },
    { key: 'correo_soporte', value: 'soporte@imperalianz.edu' },
  ],
  updatedAt: '2026-01-01T09:00:00.000Z',
}

export function getInstitutionSettings(): InstitutionSettings {
  return SETTINGS
}

export function updateInstitutionSettings(next: InstitutionSettings, updatedByName: string): InstitutionSettings {
  SETTINGS = { ...next, updatedAt: new Date().toISOString(), updatedByName }
  return SETTINGS
}
