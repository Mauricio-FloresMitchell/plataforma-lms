import { buildEmptyProfessorDashboard, findProfessorDashboard } from '@/mocks/professor'
import type { ProfessorDashboard } from '@/types/professor'

/**
 * Capa de acceso a datos de la experiencia Profesor.
 *
 * Es el único archivo que conoce el origen de los datos.
 * Migrar a Google Sheets, API REST o PostgreSQL implica reemplazar el cuerpo
 * de estas funciones; la firma pública y los componentes no cambian.
 */

const NETWORK_DELAY_MS = 600

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Obtiene el Dashboard completo de un profesor.
 * Si el profesor no tiene datos registrados devuelve un dashboard vacío,
 * de modo que la interfaz siempre pueda renderizar estados vacíos.
 */
export async function getProfessorDashboard(
  professorId: string,
  professorName = '',
): Promise<ProfessorDashboard> {
  await delay(NETWORK_DELAY_MS)

  const dashboard = findProfessorDashboard(professorId)
  return dashboard ?? buildEmptyProfessorDashboard(professorName)
}
