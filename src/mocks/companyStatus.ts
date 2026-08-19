/**
 * Almacén simulado del Semáforo de Empresa (Manual de Mejoras Transversales).
 * Solo guarda el dato que no se puede derivar de los reportes: si un alumno
 * usa la Empresa de Práctica institucional en vez de una empresa real. El
 * resto del semáforo (verde/amarillo/rojo) se calcula en vivo a partir de
 * `mocks/reports.ts` — ver `@/utils/companyStatus`.
 */

function flagKey(subjectId: string, studentId: string): string {
  return `${subjectId}:${studentId}`
}

/**
 * Alumnos sembrados con Empresa de Práctica: Wendy aún no confirma empresa
 * real (semana 1-2 de prospección), así que arranca en azul en vez de rojo.
 */
let PRACTICE_COMPANY_FLAGS = new Set<string>(['sub-001:std-015'])

export function isEmpresaPractica(subjectId: string, studentId: string): boolean {
  return PRACTICE_COMPANY_FLAGS.has(flagKey(subjectId, studentId))
}

export function setEmpresaPractica(subjectId: string, studentId: string, value: boolean): void {
  const key = flagKey(subjectId, studentId)
  const next = new Set(PRACTICE_COMPANY_FLAGS)
  if (value) next.add(key)
  else next.delete(key)
  PRACTICE_COMPANY_FLAGS = next
}
