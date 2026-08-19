import type { ReportStatus } from '@/types/report'

/**
 * Semáforo de Empresa (Manual de Mejoras Transversales, Mejora 1/3): 4 estados
 * visibles en el roster del Profesor para saber, de un vistazo, la salud de
 * la relación de cada alumno con la empresa que consulta — antes de decidir
 * la dinámica de la sesión.
 *
 * Semántica (confirmada con Producto, ver docs/DECISIONS.md):
 * - azul: el alumno usa la Empresa de Práctica institucional (fallback,
 *   Nivel 1-B, máx. 4 semanas) en vez de una empresa real — se marca a mano,
 *   no se puede derivar de los reportes.
 * - verde: reporte de esta semana entregado y sin correcciones pendientes.
 * - amarillo: reporte con correcciones, o entre 8 y 14 días sin reportar.
 * - rojo: más de 14 días sin reportar, o nunca ha entregado un reporte.
 */
export type CompanySemaphore = 'verde' | 'amarillo' | 'rojo' | 'azul'

export const COMPANY_SEMAPHORE_LABELS: Record<CompanySemaphore, string> = {
  verde: 'Al corriente',
  amarillo: 'Atención',
  rojo: 'Crítico',
  azul: 'Empresa de Práctica',
}

const DAY_MS = 24 * 60 * 60 * 1000

export interface CompanySemaphoreInput {
  isEmpresaPractica: boolean
  lastReportStatus?: ReportStatus
  /** Fecha ISO 8601 del envío del reporte más reciente del alumno en esta materia. */
  lastReportSubmittedAt?: string
  /** Inyectable para pruebas; por defecto usa la hora actual. */
  now?: Date
}

/** Calcula el semáforo de un alumno a partir de su reporte más reciente (o su falta). */
export function calculateCompanySemaphore({
  isEmpresaPractica,
  lastReportStatus,
  lastReportSubmittedAt,
  now = new Date(),
}: CompanySemaphoreInput): CompanySemaphore {
  if (isEmpresaPractica) return 'azul'
  if (!lastReportSubmittedAt) return 'rojo'

  const daysSinceReport = (now.getTime() - new Date(lastReportSubmittedAt).getTime()) / DAY_MS

  if (lastReportStatus === 'correcciones') return 'amarillo'
  if (daysSinceReport <= 7) return 'verde'
  if (daysSinceReport <= 14) return 'amarillo'
  return 'rojo'
}
