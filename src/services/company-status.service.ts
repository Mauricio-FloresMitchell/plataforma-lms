import { listAllReports } from '@/mocks/reports'
import { isEmpresaPractica, setEmpresaPractica } from '@/mocks/companyStatus'
import { calculateCompanySemaphore, type CompanySemaphore } from '@/utils/companyStatus'
import { recordAudit, type AuditActor } from '@/services/audit.service'
import type { WeeklyReport } from '@/types/report'

/**
 * Capa de acceso a datos del Semáforo de Empresa (Manual de Mejoras
 * Transversales). Compone `mocks/reports.ts` (reporte más reciente por
 * alumno) con `mocks/companyStatus.ts` (bandera de Empresa de Práctica),
 * mismo patrón ya usado por `gamification.service.ts` para combinar más de
 * un mock sin que ninguno de los dos importe al otro.
 */

const NETWORK_DELAY_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface CompanyStatusEntry {
  semaphore: CompanySemaphore
  isEmpresaPractica: boolean
  lastReportSubmittedAt?: string
}

function latestReportByStudent(reports: WeeklyReport[]): Map<string, WeeklyReport> {
  const latest = new Map<string, WeeklyReport>()
  for (const report of reports) {
    const current = latest.get(report.studentId)
    if (!current || new Date(report.submittedAt) > new Date(current.submittedAt)) {
      latest.set(report.studentId, report)
    }
  }
  return latest
}

/** Semáforo de cada alumno de `studentIds` en `subjectId` — incluye a quienes nunca han reportado (quedan en rojo). */
export async function getCompanyStatusMapAsync(
  subjectId: string,
  studentIds: string[],
): Promise<Record<string, CompanyStatusEntry>> {
  await delay(NETWORK_DELAY_MS)

  const subjectReports = listAllReports().filter((report) => report.subjectId === subjectId)
  const latestByStudent = latestReportByStudent(subjectReports)

  const result: Record<string, CompanyStatusEntry> = {}
  for (const studentId of studentIds) {
    const practice = isEmpresaPractica(subjectId, studentId)
    const lastReport = latestByStudent.get(studentId)
    result[studentId] = {
      semaphore: calculateCompanySemaphore({
        isEmpresaPractica: practice,
        lastReportStatus: lastReport?.status,
        lastReportSubmittedAt: lastReport?.submittedAt,
      }),
      isEmpresaPractica: practice,
      lastReportSubmittedAt: lastReport?.submittedAt,
    }
  }
  return result
}

/** Marca/desmarca a un alumno como usuario de la Empresa de Práctica institucional (queda en azul mientras dure). */
export async function setEmpresaPracticaAsync(
  actor: AuditActor,
  subjectId: string,
  studentId: string,
  studentName: string,
  value: boolean,
): Promise<void> {
  await delay(NETWORK_DELAY_MS)
  setEmpresaPractica(subjectId, studentId, value)
  recordAudit(
    actor,
    'Reportes',
    value
      ? `Marcó a ${studentName} con Empresa de Práctica institucional`
      : `Quitó a ${studentName} de Empresa de Práctica institucional`,
  )
}
