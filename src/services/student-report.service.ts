import {
  findReport,
  getSubjectsForStudent,
  insertReport,
  listReportsByStudent,
} from '@/mocks/reports'
import type { SubjectOption } from '@/mocks/reports'
import { getAllReportTemplates } from '@/mocks/reportTemplates'
import { emitAppEvent } from '@/core/events/EventBus'
import type { CreateReportInput, WeeklyReport } from '@/types/report'
import type { ReportTemplate } from '@/types/reportTemplate'

/**
 * Capa de acceso a datos de Reportes para el Alumno.
 *
 * Es el único punto que conoce el origen de los datos.
 * Migrar a una API real implica reemplazar el cuerpo de estas funciones;
 * la firma pública y los componentes no cambian.
 */

const NETWORK_DELAY_MS = 500

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export type { SubjectOption }

/** Reportes del alumno, del más reciente al más antiguo. */
export async function getStudentReports(studentId: string): Promise<WeeklyReport[]> {
  await delay(NETWORK_DELAY_MS)
  return listReportsByStudent(studentId).sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  )
}

/** Detalle de un reporte, validando que pertenezca al alumno. */
export async function getStudentReport(
  studentId: string,
  reportId: string,
): Promise<WeeklyReport | null> {
  await delay(NETWORK_DELAY_MS)
  const report = findReport(reportId)
  if (!report || report.studentId !== studentId) return null
  return report
}

/** Materias disponibles para crear un reporte, con la plantilla académica que le corresponde a cada una. */
export async function getReportSubjects(studentId: string): Promise<SubjectOption[]> {
  await delay(NETWORK_DELAY_MS)
  return getSubjectsForStudent(studentId)
}

/** Las 7 plantillas académicas (motor de plantillas, Sprint 12). */
export async function getReportTemplatesAsync(): Promise<ReportTemplate[]> {
  await delay(NETWORK_DELAY_MS)
  return getAllReportTemplates()
}

/**
 * Crea un reporte. Estado en memoria durante la sesión; sin persistencia real.
 */
export async function createStudentReport(
  studentId: string,
  studentName: string,
  input: CreateReportInput,
): Promise<WeeklyReport> {
  await delay(NETWORK_DELAY_MS)
  const report = insertReport(studentId, studentName, input)
  emitAppEvent('REPORT_SUBMITTED', {
    reportId: report.id,
    studentId: report.studentId,
    studentName: report.studentName,
    subjectId: report.subjectId,
    subjectName: report.subjectName,
    week: report.week,
  })
  return report
}
