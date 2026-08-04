import { getInstitutionSettings, updateInstitutionSettings } from '@/mocks/institution'
import { recordAudit, type AuditActor } from '@/services/audit.service'
import type { InstitutionSettings } from '@/types/institution'

/** Capa de acceso a datos de Configuración Institucional (Sprint 13, Parte 11). */

const NETWORK_DELAY_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getInstitutionSettingsAsync(): Promise<InstitutionSettings> {
  await delay(NETWORK_DELAY_MS)
  return getInstitutionSettings()
}

export async function updateInstitutionSettingsAsync(actor: AuditActor, next: InstitutionSettings): Promise<InstitutionSettings> {
  await delay(NETWORK_DELAY_MS)
  const before = getInstitutionSettings()
  const updated = updateInstitutionSettings(next, actor.name)
  recordAudit(actor, 'Configuración', 'Actualizó la configuración institucional', before, updated)
  return updated
}
