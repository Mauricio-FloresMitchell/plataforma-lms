import { buildEmptyDashboard, findStudentDashboard } from '@/mocks/student'
import type { StudentDashboard } from '@/types/student'

/**
 * Capa de acceso a datos de la experiencia Alumno.
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
 * Obtiene el Dashboard completo de un alumno.
 * Si el alumno no tiene datos registrados devuelve un dashboard vacío,
 * de modo que la interfaz siempre pueda renderizar estados vacíos.
 */
export async function getStudentDashboard(
  studentId: string,
  studentName = '',
): Promise<StudentDashboard> {
  await delay(NETWORK_DELAY_MS)

  const dashboard = findStudentDashboard(studentId)
  return dashboard ?? buildEmptyDashboard(studentName)
}
