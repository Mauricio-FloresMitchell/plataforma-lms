import { listCareers } from '@/mocks/careers'
import { getAdminSubjects } from '@/mocks/subjects'
import { listGroups } from '@/mocks/groups'
import { listManagedUsers } from '@/mocks/userManagement'
import { listDocuments } from '@/mocks/library'
import { getInstitutionSettings } from '@/mocks/institution'
import { downloadCsv, downloadJson } from '@/utils/export'
import { recordAudit, type AuditActor } from '@/services/audit.service'

/**
 * Respaldos (Sprint 13, Parte 13). Exporta un snapshot de los módulos
 * administrados por este sprint — no hay servidor ni base de datos real:
 * "Exportar Base de Datos" es el mismo snapshot JSON con otro nombre de
 * archivo, e "Importar/Restaurar" se simulan (se valida el archivo y se dejan
 * registrados en Auditoría, sin sobrescribir el estado en memoria de los
 * demás módulos — evita el riesgo de una restauración parcial/inconsistente
 * entre stores independientes).
 */

function buildSnapshot() {
  return {
    generatedAt: new Date().toISOString(),
    careers: listCareers(),
    subjects: getAdminSubjects(),
    groups: listGroups(),
    users: listManagedUsers(),
    libraryDocuments: listDocuments(),
    institutionSettings: getInstitutionSettings(),
  }
}

export async function exportBackupJsonAsync(actor: AuditActor): Promise<void> {
  const snapshot = buildSnapshot()
  downloadJson(`respaldo-imperalianz-${Date.now()}.json`, snapshot)
  recordAudit(actor, 'Backups', 'Exportó respaldo en JSON')
}

export async function exportBackupExcelAsync(actor: AuditActor): Promise<void> {
  const snapshot = buildSnapshot()
  downloadCsv('respaldo-resumen.csv', [
    { modulo: 'Carreras', registros: snapshot.careers.length },
    { modulo: 'Materias', registros: snapshot.subjects.length },
    { modulo: 'Grupos', registros: snapshot.groups.length },
    { modulo: 'Usuarios', registros: snapshot.users.length },
    { modulo: 'Biblioteca', registros: snapshot.libraryDocuments.length },
  ])
  recordAudit(actor, 'Backups', 'Exportó respaldo en Excel (resumen por módulo)')
}

export async function exportBackupDatabaseAsync(actor: AuditActor): Promise<void> {
  const snapshot = buildSnapshot()
  downloadJson(`respaldo-base-datos-${Date.now()}.json`, snapshot)
  recordAudit(actor, 'Backups', 'Exportó respaldo completo de la base de datos')
}

export interface ImportResult {
  isValid: boolean
  message: string
}

/** Valida el archivo importado (debe ser JSON legible) y lo deja registrado — no sobrescribe datos en memoria. */
export async function importBackupAsync(actor: AuditActor, file: File): Promise<ImportResult> {
  try {
    const text = await file.text()
    const parsed = JSON.parse(text)
    const moduleCount = typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 0
    recordAudit(actor, 'Backups', `Importó el respaldo "${file.name}" (${moduleCount} módulos detectados)`)
    return { isValid: true, message: `Archivo "${file.name}" validado correctamente (${moduleCount} módulos detectados).` }
  } catch {
    recordAudit(actor, 'Backups', `Intentó importar "${file.name}" pero el archivo no es un JSON válido`)
    return { isValid: false, message: 'El archivo no es un JSON válido.' }
  }
}

export async function simulateRestoreAsync(actor: AuditActor): Promise<void> {
  recordAudit(actor, 'Backups', 'Simuló la restauración de un respaldo')
}
