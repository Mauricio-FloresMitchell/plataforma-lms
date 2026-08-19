import type {
  Badge,
  Competency,
  CompetencyLevel,
  EvaluationSummary,
  FeedbackStatus,
  StudentEvaluation,
  StudentEvaluationDetail,
  WeeklyReportStatus,
} from '@/types/evaluation'
import { COMPETENCY_LEVELS, RUBRIC_A_CRITERIA, RUBRIC_B_CRITERIA } from '@/types/evaluation'
import type { RubricCriterionScore } from '@/types/rubric'
import { percentageToLevel } from '@/utils/grade'
import { calculateFinalPercentage, percentageToReportLevel } from '@/utils/reportGrade'
import { scoreRubric } from '@/utils/rubric'

/**
 * Almacén simulado de evaluaciones.
 * Estado en memoria: cambios reflejados durante la sesión, se reinician al recargar.
 */

function competency(id: string, name: string, description: string, percentage: number): Competency {
  return { id, name, description, percentage, currentLevel: percentageToLevel(percentage) }
}

/** Semilla de Rúbrica A/B + % final + letra para una evaluación de ejemplo (Sprint 17). */
function buildRubricSeed(rubricAScores: RubricCriterionScore[], rubricBScores: RubricCriterionScore[], bonus: number) {
  const rubricA = scoreRubric(RUBRIC_A_CRITERIA, rubricAScores)
  const rubricB = scoreRubric(RUBRIC_B_CRITERIA, rubricBScores)
  const finalPercentage = calculateFinalPercentage(rubricA.percentage, rubricB.percentage, bonus)
  return { rubricA, rubricB, bonus, finalPercentage, finalLetter: percentageToReportLevel(finalPercentage) }
}

// Competencias por materia
const COMPETENCIES_BY_SUBJECT: Record<string, Competency[]> = {
  'sub-001': [
    competency('comp-001', 'Pensamiento Estratégico', 'Capacidad de analizar y planificar a largo plazo', 92),
    competency('comp-002', 'Análisis de Datos', 'Habilidad para interpretar información cuantitativa', 87),
    competency('comp-003', 'Comunicación Ejecutiva', 'Capacidad de presentar ideas de manera clara y concisa', 98),
  ],
}

/** Empresas de práctica asignadas a los alumnos (mock, ciclo determinístico por índice). */
const COMPANIES = [
  'Grupo Bimbo',
  'CEMEX',
  'FEMSA',
  'Banco Azteca',
  'Soriana',
  'Liverpool',
  'Grupo Salinas',
  'Alsea',
  'Cinépolis',
  'OXXO',
  'Elektra',
  'Bachoco',
  'Grupo México',
  'Interceramic',
  'Vitro',
]

const WEEKLY_REPORT_STATUS_CYCLE: WeeklyReportStatus[] = ['aprobado', 'pendiente', 'correcciones', 'sin_reporte']

/** Carreras de Licenciatura (mismo catálogo de 8 usado en otras features; duplicado a propósito, ver TDD). */
const GAMIFICATION_CAREERS = [
  'Administración',
  'Ingeniería en Sistemas',
  'Negocios Internacionales',
  'Contabilidad',
  'Derecho',
  'Mercadotecnia',
  'Pedagogía',
  'Psicología',
]

/** Roster real de un alumno para generar su evaluación (nombre + ids de alumno/evaluación). */
interface RosterEntry {
  evalId: string
  studentId: string
  studentName: string
}

/**
 * Genera evaluaciones para un lote de alumnos reales del roster de la materia.
 * Determinístico (sin `Math.random`) para que no cambie entre renders/navegaciones
 * dentro de la misma sesión; se reinicia junto con el resto del mock al recargar.
 */
function buildProfessorRoster(
  subjectId: string,
  subjectName: string,
  groupName: string,
  roster: RosterEntry[],
): StudentEvaluation[] {
  const baseCompetencies = COMPETENCIES_BY_SUBJECT[subjectId] ?? []

  return roster.map((entry, i) => {
    const n = i + 1
    const status: FeedbackStatus = n % 9 === 0 ? 'publicada' : n % 5 === 0 ? 'borrador' : 'pendiente'
    const isEvaluated = status !== 'pendiente'
    const competencies = baseCompetencies.map((c) =>
      isEvaluated ? c : { ...c, percentage: 0, currentLevel: percentageToLevel(0) },
    )

    return {
      id: entry.evalId,
      studentId: entry.studentId,
      studentName: entry.studentName,
      subjectId,
      subjectName,
      groupName,
      evaluatedAt: isEvaluated ? '2026-07-20T14:30:00.000Z' : '',
      competencies,
      feedback: isEvaluated ? 'Buen desempeño general, continúa así.' : undefined,
      status,
      badgeIds: status === 'publicada' ? ['badge-001'] : undefined,
      company: COMPANIES[(n - 1) % COMPANIES.length],
      weeklyReportStatus: WEEKLY_REPORT_STATUS_CYCLE[(n - 1) % WEEKLY_REPORT_STATUS_CYCLE.length],
      career: GAMIFICATION_CAREERS[(n - 1) % GAMIFICATION_CAREERS.length],
      term: ((n - 1) % 9) + 1,
      titulacionProgress: (n * 13) % 101,
    }
  })
}

// Badges disponibles
const ALL_BADGES: Badge[] = [
  {
    id: 'badge-001',
    name: 'Excelencia Académica',
    description: 'Demostrado sobresaliente desempeño académico',
    icon: '🏆',
  },
  {
    id: 'badge-002',
    name: 'Colaboración Destacada',
    description: 'Contribución notable al trabajo en equipo',
    icon: '👥',
  },
  {
    id: 'badge-003',
    name: 'Innovador',
    description: 'Propuestas creativas y soluciones novedosas',
    icon: '💡',
  },
  {
    id: 'badge-004',
    name: 'Participación Activa',
    description: 'Participación consistente en actividades',
    icon: '⭐',
  },
  // Insignias manuales de Gamificación (Sprint Leaderboard): el profesor las
  // otorga igual que las anteriores, desde el mismo `BadgeList` en Evaluar Alumno.
  {
    id: 'badge-005',
    name: 'Experto',
    description: 'Dominio sobresaliente del tema o producto de titulación',
    icon: '🎓',
    awardType: 'manual',
  },
  {
    id: 'badge-006',
    name: 'Pensador',
    description: 'Análisis crítico y propuestas bien fundamentadas',
    icon: '🧠',
    awardType: 'manual',
  },
  // Insignias automáticas de Gamificación: el sistema las calcula a partir de
  // los movimientos de puntos (`@/mocks/gamification`), nunca las asigna el
  // profesor manualmente. Reglas exactas documentadas en `gamification.ts` y TDD.
  {
    id: 'badge-auto-iniciador',
    name: 'Iniciador',
    description: 'Registró su primer movimiento de puntos',
    icon: '🚀',
    awardType: 'automatic',
  },
  {
    id: 'badge-auto-consultor',
    name: 'Consultor',
    description: '3 o más consultas en el foro',
    icon: '🔎',
    awardType: 'automatic',
  },
  {
    id: 'badge-auto-campeon',
    name: 'Campeón',
    description: 'Primer lugar del ranking de su materia',
    icon: '🥇',
    awardType: 'automatic',
  },
  {
    id: 'badge-auto-racha-oro',
    name: 'Racha Oro',
    description: '3 o más reportes entregados sin faltas ni tardanzas',
    icon: '🔥',
    awardType: 'automatic',
  },
  {
    id: 'badge-auto-colaborador',
    name: 'Colaborador',
    description: '3 o más respuestas en el foro',
    icon: '🤝',
    awardType: 'automatic',
  },
  {
    id: 'badge-auto-nivel-elite',
    name: 'Nivel Élite',
    description: '150 puntos o más acumulados',
    icon: '💎',
    awardType: 'automatic',
  },
]

// Evaluación curada de Andrea (usr-alumno-001, la única cuenta real de
// Alumno): se comparte la MISMA referencia entre `STUDENT_EVALUATIONS` y
// `PROFESSOR_EVALUATIONS_BY_SUBJECT` para que ambas vistas queden siempre
// sincronizadas, sin depender de que coincidan los ids al guardar.
const andreaEvaluation: StudentEvaluation = {
  id: 'eval-001',
  studentId: 'usr-alumno-001',
  studentName: 'Andrea Guadalupe Mendez Guzman',
  subjectId: 'sub-001',
  subjectName: 'Clase Modelo 1 y Modelo 2',
  groupName: 'CMM-101',
  evaluatedAt: '2026-07-20T14:30:00.000Z',
  competencies: COMPETENCIES_BY_SUBJECT['sub-001'],
  feedback: 'Excelente desempeño en análisis de casos. Requiere mejorar en presentaciones públicas.',
  status: 'publicada',
  badgeIds: ['badge-001', 'badge-002'],
  company: 'Grupo Bimbo',
  weeklyReportStatus: 'aprobado',
  career: 'Administración',
  term: 1,
  titulacionProgress: 72,
  ...buildRubricSeed(
    [
      { criterionId: 'rubrica-a-dominio', level: 'excelente' },
      { criterionId: 'rubrica-a-aplicacion', level: 'bueno' },
      { criterionId: 'rubrica-a-comunicacion', level: 'bueno' },
    ],
    [
      { criterionId: 'rubrica-b-puntualidad', level: 'excelente' },
      { criterionId: 'rubrica-b-participacion', level: 'excelente' },
    ],
    2,
  ),
  observations: 'Alumna con alto potencial. Se sugiere invitarla al taller de oratoria del próximo cuatrimestre.',
  attempts: 1,
  evaluatedByName: 'Lic. Yesus Eleazar González',
}

// Evaluaciones de estudiantes (vista Alumno): solo hay una cuenta real de alumno.
let STUDENT_EVALUATIONS: StudentEvaluation[] = [andreaEvaluation]

const axelEvaluation: StudentEvaluation = {
  id: 'eval-002',
  studentId: 'std-002',
  studentName: 'Axel Martínez Betanzos',
  subjectId: 'sub-001',
  subjectName: 'Clase Modelo 1 y Modelo 2',
  groupName: 'CMM-101',
  evaluatedAt: '2026-07-21T09:00:00.000Z',
  competencies: COMPETENCIES_BY_SUBJECT['sub-001'].map((c) => ({ ...c, percentage: 78, currentLevel: percentageToLevel(78) })),
  feedback: 'Buen avance, falta profundizar en el análisis.',
  status: 'borrador',
  company: 'CEMEX',
  weeklyReportStatus: 'pendiente',
  career: 'Administración',
  term: 1,
  titulacionProgress: 35,
}

const edithEvaluation: StudentEvaluation = {
  id: 'eval-003',
  studentId: 'std-003',
  studentName: 'Edith Hortencia Ramírez Hernández',
  subjectId: 'sub-001',
  subjectName: 'Clase Modelo 1 y Modelo 2',
  groupName: 'CMM-101',
  evaluatedAt: '',
  competencies: COMPETENCIES_BY_SUBJECT['sub-001'],
  status: 'pendiente',
  company: 'FEMSA',
  weeklyReportStatus: 'correcciones',
  career: 'Administración',
  term: 1,
  titulacionProgress: 10,
}

/** Resto del roster (12 alumnos), generado a partir de `buildProfessorRoster`. */
const REMAINING_ROSTER: RosterEntry[] = [
  { evalId: 'eval-004', studentId: 'std-004', studentName: 'Fernando Dominguez Chavez' },
  { evalId: 'eval-005', studentId: 'std-005', studentName: 'Israel David León Guadarrama' },
  { evalId: 'eval-006', studentId: 'std-006', studentName: 'Jessica Flores' },
  { evalId: 'eval-007', studentId: 'std-007', studentName: 'José Ángel García López' },
  { evalId: 'eval-008', studentId: 'std-008', studentName: 'Jose Eduardo Avalos Méndez' },
  { evalId: 'eval-009', studentId: 'std-009', studentName: 'Liliana León Guadarrama' },
  { evalId: 'eval-010', studentId: 'std-010', studentName: 'Magda Contreras' },
  { evalId: 'eval-011', studentId: 'std-011', studentName: 'Mario Alberto Gaona Madera' },
  { evalId: 'eval-012', studentId: 'std-012', studentName: 'Melissa Estela Velasco Alarcón' },
  { evalId: 'eval-013', studentId: 'std-013', studentName: 'Patricia Delgado Garcia' },
  { evalId: 'eval-014', studentId: 'std-014', studentName: 'Pedro Pastor Alarcon' },
  { evalId: 'eval-015', studentId: 'std-015', studentName: 'Wendy Guadalupe Vázquez Guzmán' },
]

// Evaluaciones para el profesor: los 15 alumnos del único grupo (CMM-101).
const PROFESSOR_EVALUATIONS_BY_SUBJECT: Record<string, StudentEvaluation[]> = {
  'sub-001': [
    andreaEvaluation,
    axelEvaluation,
    edithEvaluation,
    ...buildProfessorRoster('sub-001', 'Clase Modelo 1 y Modelo 2', 'CMM-101', REMAINING_ROSTER),
  ],
}

// Evaluaciones globales del administrador: mismas 15 evaluaciones (mismas
// referencias) que `PROFESSOR_EVALUATIONS_BY_SUBJECT['sub-001']`, para que
// las tres vistas (Alumno/Profesor/Administrador) queden siempre sincronizadas.
const ADMIN_EVALUATIONS: StudentEvaluation[] = [...PROFESSOR_EVALUATIONS_BY_SUBJECT['sub-001']]

/**
 * Obtiene las evaluaciones de un alumno.
 */
export function getStudentEvaluations(studentId: string): StudentEvaluation[] {
  return STUDENT_EVALUATIONS.filter((e) => e.studentId === studentId)
}

/**
 * Obtiene el detalle de una evaluación de alumno.
 */
export function getStudentEvaluationDetail(evaluationId: string): StudentEvaluationDetail | null {
  const evaluation = STUDENT_EVALUATIONS.find((e) => e.id === evaluationId)
  if (!evaluation) return null

  const earnedBadges = (evaluation.badgeIds ?? [])
    .map((badgeId) => ALL_BADGES.find((b) => b.id === badgeId))
    .filter((b): b is Badge => Boolean(b))
    .map((b) => ({ ...b, earnedAt: evaluation.evaluatedAt || undefined }))

  return {
    id: evaluation.id,
    studentId: evaluation.studentId,
    studentName: evaluation.studentName,
    email: `${evaluation.studentName.toLowerCase().replace(/\s+/g, '.')}@university.edu`,
    subjectId: evaluation.subjectId,
    subjectName: evaluation.subjectName,
    groupName: evaluation.groupName,
    competencies: evaluation.competencies,
    feedback: evaluation.feedback,
    status: evaluation.status,
    badges: earnedBadges,
    rubricA: evaluation.rubricA,
    rubricB: evaluation.rubricB,
    observations: evaluation.observations,
    attempts: evaluation.attempts,
    evaluatedByName: evaluation.evaluatedByName,
    bonus: evaluation.bonus,
    finalPercentage: evaluation.finalPercentage,
    finalLetter: evaluation.finalLetter,
  }
}

/**
 * Obtiene estudiantes por evaluar de un profesor en una materia.
 */
export function getProfessorStudentEvaluations(
  subjectId: string,
): StudentEvaluation[] {
  return PROFESSOR_EVALUATIONS_BY_SUBJECT[subjectId] || []
}

/**
 * Registra/actualiza una evaluación (mock - solo en memoria).
 * `status` es el estado final deseado tras guardar (borrador o publicada);
 * una evaluación publicada solo puede volver a guardarse mediante este
 * mismo flujo (la UI es responsable de exigir la solicitud al Administrador).
 */
export interface RecordEvaluationInput {
  competencies: Competency[]
  feedback: string | undefined
  status: FeedbackStatus
  badgeIds: string[]
  /** Rúbrica A/B (Sprint 17, Parte 4) — omitidas conserva lo ya guardado. */
  rubricAScores?: RubricCriterionScore[]
  rubricBScores?: RubricCriterionScore[]
  bonus?: number
  observations?: string
  evaluatedByName?: string
}

export function recordEvaluation(
  evaluationId: string,
  competencies: Competency[],
  feedback: string | undefined,
  status: FeedbackStatus,
  badgeIds: string[],
  extra?: Pick<RecordEvaluationInput, 'rubricAScores' | 'rubricBScores' | 'bonus' | 'observations' | 'evaluatedByName'>,
): StudentEvaluation | null {
  const apply = (evaluation: StudentEvaluation) => {
    evaluation.status = status
    evaluation.evaluatedAt = new Date().toISOString()
    evaluation.competencies = competencies
    evaluation.feedback = feedback
    evaluation.badgeIds = badgeIds
    evaluation.attempts = (evaluation.attempts ?? 0) + 1
    if (extra?.evaluatedByName) evaluation.evaluatedByName = extra.evaluatedByName
    if (extra?.observations !== undefined) evaluation.observations = extra.observations

    const rubricA = extra?.rubricAScores
      ? scoreRubric(RUBRIC_A_CRITERIA, extra.rubricAScores)
      : evaluation.rubricA
    const rubricB = extra?.rubricBScores
      ? scoreRubric(RUBRIC_B_CRITERIA, extra.rubricBScores)
      : evaluation.rubricB
    evaluation.rubricA = rubricA
    evaluation.rubricB = rubricB

    if (extra?.bonus !== undefined) evaluation.bonus = extra.bonus

    if (rubricA && rubricB) {
      const finalPercentage = calculateFinalPercentage(rubricA.percentage, rubricB.percentage, evaluation.bonus ?? 0)
      evaluation.finalPercentage = finalPercentage
      evaluation.finalLetter = percentageToReportLevel(finalPercentage)
    }
  }

  let updated: StudentEvaluation | null = null

  const studentEval = STUDENT_EVALUATIONS.find((e) => e.id === evaluationId)
  if (studentEval) {
    apply(studentEval)
    updated = studentEval
  }

  for (const subjectEvals of Object.values(PROFESSOR_EVALUATIONS_BY_SUBJECT)) {
    const profEval = subjectEvals.find((e) => e.id === evaluationId)
    if (profEval) {
      apply(profEval)
      updated = profEval
    }
  }

  const adminEval = ADMIN_EVALUATIONS.find((e) => e.id === evaluationId)
  if (adminEval) {
    apply(adminEval)
    updated = adminEval
  }

  return updated
}

/**
 * Obtiene resumen de evaluaciones para el administrador.
 */
export function getEvaluationSummary(): EvaluationSummary {
  const completed = ADMIN_EVALUATIONS.filter((e) => e.status === 'publicada').length
  const draft = ADMIN_EVALUATIONS.filter((e) => e.status === 'borrador').length
  const pending = ADMIN_EVALUATIONS.filter((e) => e.status === 'pendiente').length

  const allLevels: CompetencyLevel[] = []
  ADMIN_EVALUATIONS.forEach((evaluation) => {
    evaluation.competencies.forEach((comp) => {
      allLevels.push(comp.currentLevel)
    })
  })

  const levelIndex = Math.round(
    allLevels.reduce((acc, level) => acc + COMPETENCY_LEVELS.indexOf(level), 0) /
      allLevels.length,
  )

  return {
    totalEvaluations: ADMIN_EVALUATIONS.length,
    pendingEvaluations: pending,
    draftEvaluations: draft,
    completedEvaluations: completed,
    averageCompetencyLevel:
      COMPETENCY_LEVELS[Math.max(0, Math.min(levelIndex, COMPETENCY_LEVELS.length - 1))] || 'C',
  }
}

/**
 * Obtiene todas las evaluaciones para consulta del administrador.
 */
export function getAdminEvaluations(): StudentEvaluation[] {
  return ADMIN_EVALUATIONS
}

/**
 * Obtiene los badges disponibles.
 */
export function getAvailableBadges(): Badge[] {
  return ALL_BADGES
}

/**
 * Ids de insignias ya asignadas a una evaluación, antes de un nuevo guardado.
 * Permite al servicio detectar qué insignias son nuevas y emitir `BADGE_GRANTED`
 * solo por esas (Sprint Event Bus) sin cambiar cómo `recordEvaluation` guarda.
 */
export function getEvaluationBadgeIds(evaluationId: string): string[] {
  return findEvaluationById(evaluationId)?.badgeIds ?? []
}

/** Busca una evaluación por id en las tres colecciones (Sprint 13, Parte 7: edición por el Administrador). */
export function findEvaluationById(evaluationId: string): StudentEvaluation | null {
  const all = [
    ...STUDENT_EVALUATIONS,
    ...Object.values(PROFESSOR_EVALUATIONS_BY_SUBJECT).flat(),
    ...ADMIN_EVALUATIONS,
  ]
  return all.find((e) => e.id === evaluationId) ?? null
}

function findRosterEntry(studentId: string, subjectId: string): StudentEvaluation | undefined {
  const all = [
    ...STUDENT_EVALUATIONS,
    ...Object.values(PROFESSOR_EVALUATIONS_BY_SUBJECT).flat(),
    ...ADMIN_EVALUATIONS,
  ]
  return all.find((e) => e.studentId === studentId && e.subjectId === subjectId)
}

/** Otorga una insignia manualmente desde la Administración del Leaderboard (Sprint 13, Parte 8). */
export function addBadgeToStudent(studentId: string, subjectId: string, badgeId: string): StudentEvaluation | null {
  const entry = findRosterEntry(studentId, subjectId)
  if (!entry) return null
  if (!entry.badgeIds) entry.badgeIds = []
  if (!entry.badgeIds.includes(badgeId)) entry.badgeIds = [...entry.badgeIds, badgeId]
  return entry
}

/** Quita una insignia otorgada manualmente (Sprint 13, Parte 8). */
export function removeBadgeFromStudent(studentId: string, subjectId: string, badgeId: string): StudentEvaluation | null {
  const entry = findRosterEntry(studentId, subjectId)
  if (!entry) return null
  entry.badgeIds = (entry.badgeIds ?? []).filter((id) => id !== badgeId)
  return entry
}

/** Ids de las materias con roster de Profesor (para construir leaderboards por materia o global). */
export function getGamificationSubjectIds(): string[] {
  return Object.keys(PROFESSOR_EVALUATIONS_BY_SUBJECT)
}

/**
 * Roster de una materia para Gamificación (Sprint Leaderboard): combina el
 * roster del Profesor (`std-*`) con las evaluaciones ya sembradas del Alumno
 * (`usr-alumno-*`) que correspondan a esa materia, para que la cuenta demo de
 * Alumno tenga una fila real en el leaderboard junto al resto del grupo.
 */
export function getSubjectRosterForGamification(subjectId: string): StudentEvaluation[] {
  const professorRoster = PROFESSOR_EVALUATIONS_BY_SUBJECT[subjectId] ?? []
  const rosterIds = new Set(professorRoster.map((e) => e.id))
  // El alumno con cuenta real (Andrea) ya vive dentro de `professorRoster` (misma
  // referencia que `STUDENT_EVALUATIONS`): filtrar por id evita duplicarla en el
  // Leaderboard cuando ambas colecciones comparten la misma evaluación.
  const studentEntries = STUDENT_EVALUATIONS.filter((e) => e.subjectId === subjectId && !rosterIds.has(e.id))
  return [...studentEntries, ...professorRoster]
}
