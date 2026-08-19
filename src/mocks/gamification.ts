import type {
  AutomaticBadgeId,
  PointActionId,
  PointCatalogEntry,
  PointMovement,
  StudentGamificationStatus,
} from '@/types/gamification'

/**
 * Almacén simulado de Gamificación (Sprint Leaderboard).
 * Estado en memoria: los movimientos de puntos se reflejan durante la sesión
 * y se reinician al recargar, igual que el resto de los mocks del proyecto.
 *
 * La gamificación no es un módulo independiente: los puntos se registran
 * sobre alumnos que ya existen en el roster de Evaluaciones
 * (`@/mocks/evaluations`, `getSubjectRosterForGamification`). Este archivo
 * solo conoce movimientos de puntos, no evalúa ni otorga badges manuales
 * (eso sigue viviendo en el flujo de Evaluaciones, sin cambios).
 */

/** Catálogo cerrado de acciones (PRD del sprint). El profesor solo selecciona una fila; nunca escribe un número. */
export const POINT_CATALOG: PointCatalogEntry[] = [
  { id: 'reporte_entregado', label: 'Reporte entregado', points: 10 },
  { id: 'experto', label: 'Experto', points: 20 },
  { id: 'pitch', label: 'Pitch', points: 25 },
  { id: 'empresa_nueva', label: 'Convenio', points: 50 },
  { id: 'pregunta_foro', label: 'Pregunta foro', points: 5 },
  { id: 'respuesta_foro', label: 'Respuesta foro', points: 15 },
  { id: 'consulta_foro', label: 'Consulta foro', points: 10 },
  { id: 'tardanza', label: 'Tardanza', points: -5 },
  { id: 'ausencia', label: 'Ausencia', points: -10 },
]

function movement(
  id: string,
  studentId: string,
  subjectId: string,
  actionId: PointActionId,
  daysAgo: number,
): PointMovement {
  const entry = POINT_CATALOG.find((item) => item.id === actionId)
  if (!entry) throw new Error(`Acción de puntos desconocida: ${actionId}`)
  const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
  return {
    id,
    studentId,
    subjectId,
    actionId,
    label: entry.label,
    points: entry.points,
    registeredBy: 'Lic. Yesus Eleazar González',
    createdAt,
  }
}

/** Movimientos sembrados para que el Leaderboard no arranque vacío. */
let POINT_MOVEMENTS: PointMovement[] = [
  movement('pm-001', 'usr-alumno-001', 'sub-001', 'reporte_entregado', 12),
  movement('pm-002', 'usr-alumno-001', 'sub-001', 'reporte_entregado', 5),
  movement('pm-003', 'usr-alumno-001', 'sub-001', 'experto', 5),
  movement('pm-004', 'usr-alumno-001', 'sub-001', 'consulta_foro', 4),
  movement('pm-005', 'usr-alumno-001', 'sub-001', 'consulta_foro', 3),
  movement('pm-006', 'usr-alumno-001', 'sub-001', 'respuesta_foro', 2),

  movement('pm-007', 'std-002', 'sub-001', 'reporte_entregado', 14),
  movement('pm-008', 'std-002', 'sub-001', 'reporte_entregado', 7),
  movement('pm-009', 'std-002', 'sub-001', 'pitch', 6),
  movement('pm-010', 'std-002', 'sub-001', 'empresa_nueva', 3),
  movement('pm-011', 'std-002', 'sub-001', 'respuesta_foro', 2),
  movement('pm-012', 'std-002', 'sub-001', 'respuesta_foro', 1),

  movement('pm-013', 'std-003', 'sub-001', 'reporte_entregado', 10),
  movement('pm-014', 'std-003', 'sub-001', 'tardanza', 6),

  movement('pm-015', 'std-004', 'sub-001', 'reporte_entregado', 9),
  movement('pm-016', 'std-004', 'sub-001', 'consulta_foro', 8),
  movement('pm-017', 'std-004', 'sub-001', 'respuesta_foro', 4),
  movement('pm-018', 'std-004', 'sub-001', 'respuesta_foro', 2),
  movement('pm-019', 'std-004', 'sub-001', 'empresa_nueva', 1),

  movement('pm-020', 'std-005', 'sub-001', 'reporte_entregado', 9),
  movement('pm-021', 'std-005', 'sub-001', 'pregunta_foro', 5),
  movement('pm-022', 'std-006', 'sub-001', 'ausencia', 4),
]

let sequence = 100

function clone(item: PointMovement): PointMovement {
  return structuredClone(item)
}

export function getPointCatalog(): PointCatalogEntry[] {
  return POINT_CATALOG
}

/** Movimientos de un alumno (o de toda una materia si se omite `studentId`), del más reciente al más antiguo. */
export function listPointMovements(subjectId: string, studentId?: string): PointMovement[] {
  return POINT_MOVEMENTS.filter(
    (item) => item.subjectId === subjectId && (!studentId || item.studentId === studentId),
  )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(clone)
}

/** Historial completo, todas las materias (Sprint 13, Parte 8: Administración del Leaderboard). */
export function listAllPointMovements(): PointMovement[] {
  return [...POINT_MOVEMENTS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(clone)
}

/** "Reiniciar temporada" (Sprint 13, Parte 8): limpia todos los movimientos de puntos. No toca el algoritmo de cálculo. */
export function resetSeason(): void {
  POINT_MOVEMENTS = []
}

/**
 * Registra un movimiento de puntos (mock, en memoria). `actionId` debe venir
 * del catálogo cerrado — nunca se acepta un número escrito a mano.
 */
export function recordPointMovement(
  studentId: string,
  subjectId: string,
  actionId: PointActionId,
  registeredBy: string,
): PointMovement {
  const entry = POINT_CATALOG.find((item) => item.id === actionId)
  if (!entry) throw new Error(`Acción de puntos desconocida: ${actionId}`)

  sequence += 1
  const created: PointMovement = {
    id: `pm-${sequence}`,
    studentId,
    subjectId,
    actionId,
    label: entry.label,
    points: entry.points,
    registeredBy,
    createdAt: new Date().toISOString(),
  }
  POINT_MOVEMENTS = [created, ...POINT_MOVEMENTS]
  return clone(created)
}

export function calculateTotalPoints(movements: PointMovement[]): number {
  return movements.reduce((sum, item) => sum + item.points, 0)
}

/**
 * Bonificación académica (Sprint Leaderboard): 1 punto porcentual por cada 20
 * puntos de gamificación acumulados, tope 10. Fórmula simple de MVP —
 * documentada en TDD — no una regla institucional formal.
 */
export function calculateBonus(totalPoints: number): number {
  return Math.max(0, Math.min(10, Math.floor(totalPoints / 20)))
}

/**
 * Estado del alumno (Sprint Leaderboard): umbrales simples de MVP sobre el
 * puntaje total — documentados en TDD.
 */
export function calculateStatus(totalPoints: number): StudentGamificationStatus {
  if (totalPoints < 0) return 'en_riesgo'
  if (totalPoints >= 100) return 'destacado'
  return 'activo'
}

/**
 * Insignias automáticas (Sprint Leaderboard): reglas simples de MVP
 * calculadas a partir de los movimientos de un alumno. El profesor nunca las
 * asigna; el sistema las deriva. Documentadas en TDD.
 */
export function calculateAutomaticBadgeIds(
  movements: PointMovement[],
  totalPoints: number,
  isTopOfSubject: boolean,
): AutomaticBadgeId[] {
  const ids: AutomaticBadgeId[] = []
  const count = (actionId: PointActionId) => movements.filter((item) => item.actionId === actionId).length

  if (movements.length > 0) ids.push('badge-auto-iniciador')
  if (count('consulta_foro') >= 3) ids.push('badge-auto-consultor')
  if (isTopOfSubject) ids.push('badge-auto-campeon')
  if (count('reporte_entregado') >= 3 && count('tardanza') === 0 && count('ausencia') === 0) {
    ids.push('badge-auto-racha-oro')
  }
  if (count('respuesta_foro') >= 3) ids.push('badge-auto-colaborador')
  if (totalPoints >= 150) ids.push('badge-auto-nivel-elite')

  return ids
}
