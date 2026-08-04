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
  'sub-002': [
    competency('comp-004', 'Marketing Digital', 'Competencia en estrategias digitales', 82),
    competency('comp-005', 'Análisis de Mercado', 'Capacidad de estudiar comportamiento del consumidor', 86),
  ],
  'sub-003': [
    competency('comp-006', 'Gestión Financiera', 'Competencia en administración de recursos económicos', 91),
    competency('comp-007', 'Análisis de Inversiones', 'Habilidad para evaluar viabilidad de proyectos', 98),
  ],
  'sub-006': [
    competency('comp-009', 'Reclutamiento y Selección', 'Capacidad de identificar y atraer talento idóneo', 85),
    competency('comp-010', 'Desarrollo del Talento', 'Habilidad para diseñar planes de capacitación', 88),
    competency('comp-011', 'Evaluación del Desempeño', 'Capacidad de medir y retroalimentar el desempeño del personal', 90),
  ],
  'sub-007': [
    competency('comp-012', 'Análisis de Sistemas', 'Capacidad de modelar procesos y requerimientos de negocio', 89),
    competency('comp-013', 'Gestión de Bases de Datos', 'Habilidad para diseñar y administrar bases de datos', 84),
    competency('comp-014', 'Seguridad de la Información', 'Competencia en protección de datos e infraestructura', 93),
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

/**
 * Genera el roster completo de alumnos de una materia para el Profesor.
 * Determinístico (sin `Math.random`) para que no cambie entre renders/navegaciones
 * dentro de la misma sesión; se reinicia junto con el resto del mock al recargar.
 */
function buildProfessorRoster(
  subjectId: string,
  subjectName: string,
  groupName: string,
  count: number,
  idOffset: number,
  /** Número de "Estudiante N" con el que continúa (para no repetir nombres tras alumnos curados). */
  nameStart = 1,
): StudentEvaluation[] {
  const baseCompetencies = COMPETENCIES_BY_SUBJECT[subjectId] ?? []

  return Array.from({ length: count }, (_, i) => {
    const n = i + 1
    const displayNumber = nameStart + i
    const status: FeedbackStatus = n % 9 === 0 ? 'publicada' : n % 5 === 0 ? 'borrador' : 'pendiente'
    const isEvaluated = status !== 'pendiente'
    const competencies = baseCompetencies.map((c) =>
      isEvaluated ? c : { ...c, percentage: 0, currentLevel: percentageToLevel(0) },
    )

    return {
      id: `eval-${idOffset + n}`,
      studentId: `std-${idOffset + n}`,
      studentName: `Estudiante ${displayNumber}`,
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

// Evaluaciones de estudiantes
let STUDENT_EVALUATIONS: StudentEvaluation[] = [
  {
    id: 'eval-001',
    studentId: 'usr-alumno-001',
    studentName: 'María García López',
    subjectId: 'sub-001',
    subjectName: 'Administración Estratégica',
    groupName: 'ADM-501',
    evaluatedAt: '2026-07-20T14:30:00.000Z',
    competencies: COMPETENCIES_BY_SUBJECT['sub-001'],
    feedback: 'Excelente desempeño en análisis de casos. Requiere mejorar en presentaciones públicas.',
    status: 'publicada',
    badgeIds: ['badge-001', 'badge-002'],
    company: 'Grupo Bimbo',
    weeklyReportStatus: 'aprobado',
    career: 'Administración',
    term: 6,
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
    evaluatedByName: 'Ing. Carlos Mendoza',
  },
  {
    id: 'eval-002',
    studentId: 'usr-alumno-050',
    studentName: 'Jorge Ramírez Peña',
    subjectId: 'sub-004',
    subjectName: 'Comportamiento Organizacional',
    groupName: 'ADM-402',
    evaluatedAt: '2026-07-18T10:15:00.000Z',
    competencies: [competency('comp-008', 'Inteligencia Emocional', 'Capacidad de entender y gestionar emociones', 88)],
    feedback: 'Buen desarrollo en dinámicas de grupo.',
    status: 'publicada',
    badgeIds: ['badge-002'],
  },
  {
    id: 'eval-003',
    studentId: 'usr-alumno-051',
    studentName: 'Lucía Fernández Mora',
    subjectId: 'sub-003',
    subjectName: 'Finanzas Corporativas',
    groupName: 'ADM-303',
    evaluatedAt: '',
    competencies: COMPETENCIES_BY_SUBJECT['sub-003'],
    status: 'pendiente',
  },
]

// Evaluaciones para el profesor.
// Cada materia genera un roster completo (`buildProfessorRoster`) del tamaño
// declarado en `PROFESSOR_SUBJECTS` (mocks/subjects.ts, studentsCount) para que
// el listado "Evaluaciones > materia > alumnos" muestre a todo el grupo, no
// solo a los alumnos evaluados. Ambos mocks se mantienen manualmente
// sincronizados por materia (sin import cruzado, siguiendo el patrón existente
// de datos duplicados por feature).
const PROFESSOR_EVALUATIONS_BY_SUBJECT: Record<string, StudentEvaluation[]> = {
  'sub-001': [
    {
      id: 'eval-101',
      studentId: 'std-001',
      studentName: 'Estudiante 1',
      subjectId: 'sub-001',
      subjectName: 'Administración Estratégica',
      groupName: 'ADM-501',
      evaluatedAt: '2026-07-20T14:30:00.000Z',
      competencies: COMPETENCIES_BY_SUBJECT['sub-001'],
      feedback: 'Excelente desempeño',
      status: 'publicada',
      badgeIds: ['badge-001'],
      company: 'Grupo Bimbo',
      weeklyReportStatus: 'aprobado',
      career: 'Administración',
      term: 5,
      titulacionProgress: 60,
    },
    {
      id: 'eval-102',
      studentId: 'std-002',
      studentName: 'Estudiante 2',
      subjectId: 'sub-001',
      subjectName: 'Administración Estratégica',
      groupName: 'ADM-501',
      evaluatedAt: '2026-07-21T09:00:00.000Z',
      competencies: COMPETENCIES_BY_SUBJECT['sub-001'].map((c) => ({ ...c, percentage: 78, currentLevel: percentageToLevel(78) })),
      feedback: 'Buen avance, falta profundizar en el análisis financiero.',
      status: 'borrador',
      company: 'CEMEX',
      weeklyReportStatus: 'pendiente',
      career: 'Negocios Internacionales',
      term: 3,
      titulacionProgress: 35,
    },
    {
      id: 'eval-103',
      studentId: 'std-003',
      studentName: 'Estudiante 3',
      subjectId: 'sub-001',
      subjectName: 'Administración Estratégica',
      groupName: 'ADM-501',
      evaluatedAt: '',
      competencies: COMPETENCIES_BY_SUBJECT['sub-001'],
      status: 'pendiente',
      company: 'FEMSA',
      weeklyReportStatus: 'correcciones',
      career: 'Administración',
      term: 1,
      titulacionProgress: 10,
    },
    // idOffset 103: continúa después de eval-101/102/103 (los 3 alumnos curados arriba).
    // nameStart 4: continúa la numeración "Estudiante N" después de Estudiante 1/2/3.
    ...buildProfessorRoster('sub-001', 'Administración Estratégica', 'ADM-501', 25, 103, 4),
  ],
  // Cada materia usa un bloque de ids distinto (200s, 300s) para que `eval-*`/`std-*`
  // nunca se repita entre materias: `recordEvaluation` busca por id en las tres
  // materias del profesor y actualizaría por error a alumnos de otra materia si colisionaran.
  'sub-006': buildProfessorRoster('sub-006', 'Gestión del Talento', 'RH-301', 25, 200),
  'sub-007': buildProfessorRoster('sub-007', 'Sistemas de Información', 'SIS-401-A', 30, 300),
}

// Evaluaciones globales del administrador
const ADMIN_EVALUATIONS: StudentEvaluation[] = [
  {
    id: 'eval-1001',
    studentId: 'usr-alumno-001',
    studentName: 'María García López',
    subjectId: 'sub-001',
    subjectName: 'Administración Estratégica',
    groupName: 'ADM-501',
    evaluatedAt: '2026-07-20T14:30:00.000Z',
    competencies: COMPETENCIES_BY_SUBJECT['sub-001'],
    status: 'publicada',
    badgeIds: ['badge-001', 'badge-002'],
  },
  {
    id: 'eval-1002',
    studentId: 'usr-alumno-002',
    studentName: 'Estudiante 2',
    subjectId: 'sub-002',
    subjectName: 'Mercadotecnia Digital',
    groupName: 'MKT-401',
    evaluatedAt: '2026-07-19T09:00:00.000Z',
    competencies: COMPETENCIES_BY_SUBJECT['sub-002'],
    status: 'publicada',
  },
  {
    id: 'eval-1003',
    studentId: 'usr-alumno-003',
    studentName: 'Estudiante 3',
    subjectId: 'sub-003',
    subjectName: 'Finanzas Corporativas',
    groupName: 'FIN-502',
    evaluatedAt: '',
    competencies: COMPETENCIES_BY_SUBJECT['sub-003'],
    status: 'pendiente',
  },
]

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
  const studentEntries = STUDENT_EVALUATIONS.filter((e) => e.subjectId === subjectId)
  return [...studentEntries, ...professorRoster]
}
