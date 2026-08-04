import { findReport, listAllReports, setReportStatus } from '@/mocks/reports'
import { getAdminSubjects } from '@/mocks/subjects'
import { recordAudit, type AuditActor } from '@/services/audit.service'
import type { AdminReportFilters, AdminReportView, WeeklyReport } from '@/types/report'

/**
 * Capa de acceso a datos del Centro de Reportes del Administrador (Sprint
 * 13, Parte 6). Compone `mocks/reports.ts` con `mocks/subjects.ts` para
 * resolver carrera/profesor por materia — mismo patrón de "componer mocks en
 * el servicio" ya usado por `gamification.service.ts`.
 */

const NETWORK_DELAY_MS = 400

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function enrich(report: WeeklyReport): AdminReportView {
  const subject = getAdminSubjects().find((item) => item.id === report.subjectId)
  return { ...report, careerName: subject?.careerName, professorName: subject?.professorName }
}

export async function getAllReportsAsync(filters?: AdminReportFilters): Promise<AdminReportView[]> {
  await delay(NETWORK_DELAY_MS)
  const enriched = listAllReports().map(enrich)
  if (!filters) return enriched
  return enriched.filter((report) => {
    if (filters.careerName && report.careerName !== filters.careerName) return false
    if (filters.subjectId && report.subjectId !== filters.subjectId) return false
    if (filters.professorName && report.professorName !== filters.professorName) return false
    if (filters.studentId && report.studentId !== filters.studentId) return false
    if (filters.week !== undefined && report.week !== filters.week) return false
    if (filters.status && report.status !== filters.status) return false
    return true
  })
}

export async function getReportByIdAsync(reportId: string): Promise<AdminReportView | null> {
  await delay(NETWORK_DELAY_MS)
  const report = findReport(reportId)
  return report ? enrich(report) : null
}

export async function setReportStatusAsync(
  actor: AuditActor,
  reportId: string,
  status: WeeklyReport['status'],
  actionLabel: string,
): Promise<WeeklyReport | null> {
  await delay(NETWORK_DELAY_MS)
  const report = setReportStatus(reportId, status)
  if (report) recordAudit(actor, 'Reportes', `${actionLabel} el reporte "${report.title}" de ${report.studentName}`, undefined, report)
  return report
}
