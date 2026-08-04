import type { Role } from '@/types/auth'
import type { ChatContextType } from '@/types/chat'

/**
 * Ruta de "Ver origen" para una conversación con contexto (Parte 12, mejora
 * "conversaciones con contexto"). Best-effort: algunas combinaciones
 * contexto/rol no tienen una ruta de un solo id resoluble desde aquí (ej. la
 * vista del profesor de una evaluación necesita también `subjectId` y
 * `studentId`, no solo el id de la evaluación) — en esos casos no hay enlace,
 * pero la etiqueta del contexto se sigue mostrando en `InfoPanel`.
 */
export function resolveContextRoute(contextType: ChatContextType, contextId: string, role: Role): string | null {
  if (contextType === 'reporte') {
    return role === 'alumno' ? `/alumno/reportes/${contextId}` : role === 'profesor' ? `/profesor/reportes/${contextId}` : null
  }
  if (contextType === 'evaluacion') {
    return role === 'alumno' ? `/alumno/evaluaciones/${contextId}` : null
  }
  if (contextType === 'actividad') {
    return role === 'alumno' ? `/alumno/materias/${contextId}` : role === 'profesor' ? `/profesor/materias/${contextId}` : null
  }
  if (contextType === 'foro') {
    return `/foro/${contextId}`
  }
  return null
}
