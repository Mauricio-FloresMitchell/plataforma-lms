import { applyEvaluation, findReport, listPendingReports } from '@/mocks/reports'
import { getAllReportTemplates } from '@/mocks/reportTemplates'
import { emitAppEvent } from '@/core/events/EventBus'
import type { EvaluateReportInput, WeeklyReport } from '@/types/report'
import type { ReportTemplate } from '@/types/reportTemplate'

/**
 * Capa de acceso a datos de Reportes para el Profesor.
 *
 * Es el único punto que conoce el origen de los datos.
 * Migrar a una API real implica reemplazar el cuerpo de estas funciones;
 * la firma pública y los componentes no cambian.
 */

const NETWORK_DELAY_MS = 500

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Reportes pendientes de revisión, del más reciente al más antiguo. */
export async function getPendingReports(_teacherId: string): Promise<WeeklyReport[]> {
  await delay(NETWORK_DELAY_MS)
  return listPendingReports().sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  )
}

/** Detalle de un reporte para revisión. */
export async function getReportForReview(
  _teacherId: string,
  reportId: string,
): Promise<WeeklyReport | null> {
  await delay(NETWORK_DELAY_MS)
  return findReport(reportId)
}

/**
 * Registra la evaluación por competencias y la decisión de revisión.
 * Estado en memoria durante la sesión; sin persistencia real.
 */
export async function evaluateReport(
  _teacherId: string,
  reportId: string,
  input: EvaluateReportInput,
): Promise<WeeklyReport | null> {
  await delay(NETWORK_DELAY_MS)
  const updated = applyEvaluation(reportId, input)
  if (updated) {
    emitAppEvent(input.decision === 'aprobado' ? 'REPORT_APPROVED' : 'REPORT_REJECTED', {
      reportId: updated.id,
      studentId: updated.studentId,
      subjectName: updated.subjectName,
      week: updated.week,
      observations: input.observations,
    })
  }
  return updated
}

/** Las 7 plantillas académicas (motor de plantillas, Sprint 12), para mostrar el reporte en modo lectura. */
export async function getReportTemplatesAsync(): Promise<ReportTemplate[]> {
  await delay(NETWORK_DELAY_MS)
  return getAllReportTemplates()
}
