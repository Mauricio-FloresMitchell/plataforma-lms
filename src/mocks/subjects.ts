import type {
  Activity,
  ActivityInput,
  ActivitySubmission,
  ActivitySubmissionInput,
  AdminSubjectInput,
  AdminSubjectListItem,
  Announcement,
  Material,
  MaterialInput,
  ProfessorSubjectListItem,
  StudentSubjectListItem,
  SubjectDetail,
  SubmissionVersion,
} from '@/types/subject'

/**
 * Almacén simulado de materias.
 * Estado en memoria durante la sesión.
 */

/**
 * Roster canónico de los 15 alumnos del único grupo de la demo (CMM-101),
 * en orden alfabético. Mismo id/nombre que `mocks/evaluations.ts`,
 * `mocks/gamification.ts` y `mocks/userManagement.ts` — sin import cruzado,
 * siguiendo el patrón existente de "datos duplicados por feature".
 */
const SUBJECT_ROSTER = [
  { id: 'usr-alumno-001', name: 'Andrea Guadalupe Mendez Guzman' },
  { id: 'std-002', name: 'Axel Martínez Betanzos' },
  { id: 'std-003', name: 'Edith Hortencia Ramírez Hernández' },
  { id: 'std-004', name: 'Fernando Dominguez Chavez' },
  { id: 'std-005', name: 'Israel David León Guadarrama' },
  { id: 'std-006', name: 'Jessica Flores' },
  { id: 'std-007', name: 'José Ángel García López' },
  { id: 'std-008', name: 'Jose Eduardo Avalos Méndez' },
  { id: 'std-009', name: 'Liliana León Guadarrama' },
  { id: 'std-010', name: 'Magda Contreras' },
  { id: 'std-011', name: 'Mario Alberto Gaona Madera' },
  { id: 'std-012', name: 'Melissa Estela Velasco Alarcón' },
  { id: 'std-013', name: 'Patricia Delgado Garcia' },
  { id: 'std-014', name: 'Pedro Pastor Alarcon' },
  { id: 'std-015', name: 'Wendy Guadalupe Vázquez Guzmán' },
] as const

const COMPETENCY_CYCLE = ['A+', 'A', 'B+', 'B', 'C', 'D'] as const

// Materias disponibles para el alumno
const STUDENT_SUBJECTS: StudentSubjectListItem[] = [
  {
    id: 'sub-001',
    name: 'Clase Modelo 1 y Modelo 2',
    code: 'CMM-101',
    teacher: 'Lic. Yesus Eleazar González',
    progress: 75,
  },
]

// Materias para el profesor
const PROFESSOR_SUBJECTS: ProfessorSubjectListItem[] = [
  {
    id: 'sub-001',
    name: 'Clase Modelo 1 y Modelo 2',
    code: 'CMM-101',
    groupName: 'CMM-101',
    studentsCount: 15,
  },
]

// Materias para el administrador
let ADMIN_SUBJECTS: AdminSubjectListItem[] = [
  {
    id: 'sub-001',
    name: 'Clase Modelo 1 y Modelo 2',
    code: 'CMM-101',
    credits: 4,
    teachers: ['Lic. Yesus Eleazar González'],
    careerId: 'car-001',
    careerName: 'Administración',
    term: 1,
    professorId: 'usr-profesor-001',
    professorName: 'Lic. Yesus Eleazar González',
    isActive: true,
  },
]

// Actividades por materia
let ACTIVITIES_BY_SUBJECT: Record<string, Activity[]> = {
  'sub-001': [
    {
      id: 'act-101',
      title: 'Análisis de casos empresariales',
      description: 'Análisis de 3 casos de estudios reales aplicando herramientas estratégicas',
      instructions:
        'Selecciona 3 casos de empresas reales y aplica al menos dos herramientas de análisis estratégico vistas en clase (FODA, Cinco Fuerzas de Porter o Cadena de Valor). Entrega un documento por caso con: contexto, herramienta aplicada, hallazgos y recomendaciones.',
      dueDate: '2026-08-10',
      status: 'pendiente',
      weightPercentage: 20,
      rubric: [
        { id: 'rub-101-1', label: 'Selección y contexto de los casos', description: 'Los 3 casos son reales, actuales y relevantes para el sector.', weight: 20 },
        { id: 'rub-101-2', label: 'Aplicación de herramientas', description: 'Se aplica correctamente al menos una herramienta estratégica por caso.', weight: 50 },
        { id: 'rub-101-3', label: 'Recomendaciones', description: 'Las recomendaciones son viables y están justificadas.', weight: 30 },
      ],
      attachments: [
        { id: 'att-101-1', name: 'guia-analisis-casos.pdf', kind: 'archivo' },
        { id: 'att-101-2', name: 'plantilla-foda.pdf', kind: 'archivo' },
      ],
    },
    {
      id: 'act-102',
      title: 'Presentación de matriz FODA',
      description: 'Elaborar y presentar una matriz FODA de una organización real',
      instructions:
        'Elige una organización real (puede ser tu lugar de trabajo actual o una empresa pública) y elabora su matriz FODA. Prepara una presentación de máximo 8 diapositivas con tus conclusiones y una estrategia derivada del cruce FO/DA.',
      dueDate: '2026-08-05',
      status: 'completada',
      weightPercentage: 15,
      rubric: [
        { id: 'rub-102-1', label: 'Contenido de la matriz', description: 'Identifica factores internos y externos relevantes.', weight: 60 },
        { id: 'rub-102-2', label: 'Presentación', description: 'Claridad visual y de exposición.', weight: 40 },
      ],
      attachments: [{ id: 'att-102-1', name: 'plantilla-presentacion.pptx', kind: 'archivo' }],
    },
    {
      id: 'act-103',
      title: 'Examen parcial',
      description: 'Evaluación escrita sobre los temas de la unidad 1 y 2',
      instructions: 'Examen individual a libro cerrado. Duración 90 minutos. Cubre las unidades 1 y 2 del temario.',
      dueDate: '2026-08-18',
      status: 'pendiente',
      weightPercentage: 30,
    },
  ],
}

// Materiales por materia
let MATERIALS_BY_SUBJECT: Record<string, Material[]> = {
  'sub-001': [
    {
      id: 'mat-101',
      title: 'Introducción a la Estrategia Empresarial',
      type: 'pdf',
      url: '/materials/estrategia-intro.pdf',
      uploadedAt: '2026-07-15T09:00:00.000Z',
    },
    {
      id: 'mat-102',
      title: 'Herramientas de Análisis Estratégico',
      type: 'video',
      url: 'https://example.com/video-analisis',
      uploadedAt: '2026-07-18T14:30:00.000Z',
    },
    {
      id: 'mat-103',
      title: 'Recursos de Consultoría',
      type: 'enlace',
      url: 'https://www.bcg.com/perspectives',
      uploadedAt: '2026-07-20T10:15:00.000Z',
    },
  ],
}

// Avisos por materia
let ANNOUNCEMENTS_BY_SUBJECT: Record<string, Announcement[]> = {
  'sub-001': [
    {
      id: 'ann-101',
      content: 'Se adelanta la fecha del examen parcial al 15 de agosto.',
      author: 'Lic. Yesus Eleazar González',
      createdAt: '2026-07-23T10:00:00.000Z',
    },
    {
      id: 'ann-102',
      content: 'Envío de lecturas complementarias por correo electrónico.',
      author: 'Lic. Yesus Eleazar González',
      createdAt: '2026-07-20T14:20:00.000Z',
    },
  ],
}

/**
 * Obtiene el detalle completo de una materia.
 */
export function getSubjectDetail(subjectId: string, role: 'alumno' | 'profesor' | 'administrador'): SubjectDetail | null {
  let subject: StudentSubjectListItem | ProfessorSubjectListItem | AdminSubjectListItem | undefined

  if (role === 'alumno') {
    subject = STUDENT_SUBJECTS.find((s) => s.id === subjectId)
    if (!subject) return null

    return {
      summary: {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        credits: 4,
        description: `Materia de especialización en el área de negocio. Código: ${subject.code}`,
      },
      teacher: (subject as StudentSubjectListItem).teacher,
      progress: (subject as StudentSubjectListItem).progress,
      // Oculta actividades marcadas isHidden y las que aún no abren (Sprint 17, Parte 2).
      activities: (ACTIVITIES_BY_SUBJECT[subjectId] || []).filter(
        (activity) => !activity.isHidden && (!activity.openDate || new Date(activity.openDate) <= new Date()),
      ),
      materials: (MATERIALS_BY_SUBJECT[subjectId] || []).filter(
        (material) => !material.isHidden && (!material.scheduledAt || new Date(material.scheduledAt) <= new Date()),
      ),
      announcements: ANNOUNCEMENTS_BY_SUBJECT[subjectId] || [],
    }
  }

  if (role === 'profesor') {
    subject = PROFESSOR_SUBJECTS.find((s) => s.id === subjectId)
    if (!subject) return null

    const profSubject = subject as ProfessorSubjectListItem

    // Roster real de la materia (determinístico, sin Math.random).
    const mockStudents = SUBJECT_ROSTER.map((student, i) => ({
      id: student.id,
      name: student.name,
      progress: ((i + 1) * 7) % 101,
      competencyLevel: COMPETENCY_CYCLE[i % COMPETENCY_CYCLE.length],
    }))

    return {
      summary: {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        credits: 4,
        description: `Materia impartida al grupo ${profSubject.groupName}`,
      },
      students: mockStudents,
      activities: ACTIVITIES_BY_SUBJECT[subjectId] || [],
      materials: MATERIALS_BY_SUBJECT[subjectId] || [],
      announcements: ANNOUNCEMENTS_BY_SUBJECT[subjectId] || [],
    }
  }

  if (role === 'administrador') {
    subject = ADMIN_SUBJECTS.find((s) => s.id === subjectId)
    if (!subject) return null

    const adminSubject = subject as AdminSubjectListItem

    return {
      summary: {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        credits: adminSubject.credits,
        description: `Materia del plan de estudios. Código: ${subject.code}`,
      },
      activities: ACTIVITIES_BY_SUBJECT[subjectId] || [],
      materials: MATERIALS_BY_SUBJECT[subjectId] || [],
      announcements: ANNOUNCEMENTS_BY_SUBJECT[subjectId] || [],
    }
  }

  return null
}

export function getStudentSubjects(): StudentSubjectListItem[] {
  return STUDENT_SUBJECTS
}

export function getProfessorSubjects(): ProfessorSubjectListItem[] {
  return PROFESSOR_SUBJECTS
}

export function getAdminSubjects(): AdminSubjectListItem[] {
  return ADMIN_SUBJECTS
}

export function findAdminSubject(subjectId: string): AdminSubjectListItem | null {
  return ADMIN_SUBJECTS.find((item) => item.id === subjectId) ?? null
}

// ── Materias (CRUD del administrador, Sprint 13) ─────────────────────

let adminSubjectSequence = 700

export function createAdminSubject(input: AdminSubjectInput, careerName: string): AdminSubjectListItem {
  adminSubjectSequence += 1
  const subject: AdminSubjectListItem = {
    id: `sub-${adminSubjectSequence}`,
    name: input.name,
    code: input.code,
    credits: input.credits,
    teachers: [],
    careerId: input.careerId,
    careerName,
    term: input.term,
    isActive: true,
  }
  ADMIN_SUBJECTS = [...ADMIN_SUBJECTS, subject]
  return subject
}

export function updateAdminSubject(subjectId: string, input: AdminSubjectInput, careerName: string): AdminSubjectListItem | null {
  const subject = ADMIN_SUBJECTS.find((item) => item.id === subjectId)
  if (!subject) return null
  subject.name = input.name
  subject.code = input.code
  subject.credits = input.credits
  subject.careerId = input.careerId
  subject.careerName = careerName
  subject.term = input.term
  return subject
}

/** Asigna o cambia el profesor titular. Mantiene `teachers` (histórico) sincronizado. */
export function assignAdminSubjectProfessor(subjectId: string, professorId: string, professorName: string): AdminSubjectListItem | null {
  const subject = ADMIN_SUBJECTS.find((item) => item.id === subjectId)
  if (!subject) return null
  subject.professorId = professorId
  subject.professorName = professorName
  if (!subject.teachers.includes(professorName)) subject.teachers = [...subject.teachers, professorName]
  return subject
}

export function setAdminSubjectActive(subjectId: string, isActive: boolean): AdminSubjectListItem | null {
  const subject = ADMIN_SUBJECTS.find((item) => item.id === subjectId)
  if (!subject) return null
  subject.isActive = isActive
  return subject
}

export function deleteAdminSubject(subjectId: string): boolean {
  const next = ADMIN_SUBJECTS.filter((item) => item.id !== subjectId)
  const removed = next.length !== ADMIN_SUBJECTS.length
  ADMIN_SUBJECTS = next
  return removed
}

// ── Actividades (CRUD del profesor) ─────────────────────────────────

export function getActivity(subjectId: string, activityId: string): Activity | null {
  return (ACTIVITIES_BY_SUBJECT[subjectId] || []).find((a) => a.id === activityId) ?? null
}

export function createActivity(subjectId: string, input: ActivityInput): Activity {
  const activity: Activity = { id: `act-${Date.now()}`, ...input }
  ACTIVITIES_BY_SUBJECT[subjectId] = [...(ACTIVITIES_BY_SUBJECT[subjectId] || []), activity]
  return activity
}

export function updateActivity(subjectId: string, activityId: string, input: ActivityInput): Activity | null {
  const list = ACTIVITIES_BY_SUBJECT[subjectId] || []
  const index = list.findIndex((a) => a.id === activityId)
  if (index === -1) return null

  const updated: Activity = { id: activityId, ...input }
  ACTIVITIES_BY_SUBJECT[subjectId] = [...list.slice(0, index), updated, ...list.slice(index + 1)]
  return updated
}

export function deleteActivity(subjectId: string, activityId: string): boolean {
  const list = ACTIVITIES_BY_SUBJECT[subjectId] || []
  const next = list.filter((a) => a.id !== activityId)
  ACTIVITIES_BY_SUBJECT[subjectId] = next
  return next.length !== list.length
}

/** Duplica una actividad como borrador oculto (Sprint 17, Parte 2): mismo contenido, nueva fecha límite pendiente de ajustar. */
export function duplicateActivity(subjectId: string, activityId: string): Activity | null {
  const source = getActivity(subjectId, activityId)
  if (!source) return null
  const copy: Activity = {
    ...structuredClone(source),
    id: `act-${Date.now()}`,
    title: `${source.title} (copia)`,
    status: 'pendiente',
    isHidden: true,
  }
  ACTIVITIES_BY_SUBJECT[subjectId] = [...(ACTIVITIES_BY_SUBJECT[subjectId] || []), copy]
  return copy
}

/** Oculta/muestra una actividad para el alumno sin eliminarla (Sprint 17, Parte 2). */
export function setActivityHidden(subjectId: string, activityId: string, isHidden: boolean): Activity | null {
  const activity = getActivity(subjectId, activityId)
  if (!activity) return null
  activity.isHidden = isHidden
  return activity
}

// ── Materiales (alta/baja del profesor) ─────────────────────────────

export function createMaterial(subjectId: string, input: MaterialInput): Material {
  const material: Material = {
    id: `mat-${Date.now()}`,
    title: input.title,
    type: input.type,
    url: input.url,
    uploadedAt: new Date().toISOString(),
    description: input.description,
    category: input.category,
    tags: input.tags,
    isHidden: input.isHidden,
    scheduledAt: input.scheduledAt,
  }
  MATERIALS_BY_SUBJECT[subjectId] = [...(MATERIALS_BY_SUBJECT[subjectId] || []), material]
  return material
}

/** Oculta/muestra un material para el alumno sin eliminarlo (Sprint 17, Parte 3). */
export function setMaterialHidden(subjectId: string, materialId: string, isHidden: boolean): Material | null {
  const material = (MATERIALS_BY_SUBJECT[subjectId] || []).find((item) => item.id === materialId)
  if (!material) return null
  material.isHidden = isHidden
  return material
}

export function deleteMaterial(subjectId: string, materialId: string): boolean {
  const list = MATERIALS_BY_SUBJECT[subjectId] || []
  const next = list.filter((m) => m.id !== materialId)
  MATERIALS_BY_SUBJECT[subjectId] = next
  return next.length !== list.length
}

// ── Entregas de actividades del alumno (Sprint 16, Parte 1) ─────────
//
// Compuesta por actividad + alumno (`${activityId}:${studentId}`). El MVP
// solo tiene una cuenta real de alumno (`usr-alumno-001`, Andrea Guadalupe
// Mendez Guzman), pero se guarda por `studentId` para no acoplar el store a esa
// cuenta específica.

const SUBMISSIONS: Record<string, ActivitySubmission> = {
  'act-102:usr-alumno-001': {
    id: 'sub-act-102-usr-alumno-001',
    activityId: 'act-102',
    subjectId: 'sub-001',
    studentId: 'usr-alumno-001',
    files: [{ id: 'sf-102-1', name: 'foda-grupo-constructor.pptx', kind: 'archivo' }],
    comment: 'Adjunto la presentación con la matriz FODA de Grupo Constructor SA.',
    submittedAt: '2026-08-03T18:20:00.000Z',
    isLate: false,
    status: 'evaluado',
    history: [],
    feedback:
      'Buen trabajo identificando las fortalezas y oportunidades. La estrategia FO podría profundizar más en cómo capitalizar la expansión regional.',
    percentage: 92,
    observations: 'Cuida el orden de las diapositivas: el cruce FO/DA debe ir antes que las conclusiones.',
    badges: [{ id: 'badge-foda-92', name: 'Análisis Sobresaliente', description: 'Entrega con calificación superior a 90%.', icon: '🏆', earnedAt: '2026-08-04T09:00:00.000Z', awardType: 'manual' }],
    evaluatedAt: '2026-08-04T09:00:00.000Z',
    evaluatedByName: 'Lic. Yesus Eleazar González',
  },
}

function submissionKey(activityId: string, studentId: string): string {
  return `${activityId}:${studentId}`
}

export function getActivitySubmission(activityId: string, studentId: string): ActivitySubmission | null {
  return SUBMISSIONS[submissionKey(activityId, studentId)] ?? null
}

/** Crea o reemplaza la entrega vigente. Antes de sobrescribir, mueve la versión anterior al historial. */
export function upsertActivitySubmission(
  activityId: string,
  subjectId: string,
  studentId: string,
  input: ActivitySubmissionInput,
  isLate: boolean,
): ActivitySubmission {
  const key = submissionKey(activityId, studentId)
  const existing = SUBMISSIONS[key]
  const history: SubmissionVersion[] = existing
    ? [{ files: existing.files, comment: existing.comment, submittedAt: existing.submittedAt }, ...existing.history]
    : []

  const submission: ActivitySubmission = {
    id: existing?.id ?? `subm-${Date.now()}`,
    activityId,
    subjectId,
    studentId,
    files: input.files,
    comment: input.comment,
    submittedAt: new Date().toISOString(),
    isLate,
    status: 'entregado',
    history,
  }
  SUBMISSIONS[key] = submission
  return submission
}

// ── Avisos de materia (alta desde el módulo de Avisos del profesor) ─

export function createSubjectAnnouncement(subjectId: string, content: string, author: string): Announcement {
  const announcement: Announcement = {
    id: `ann-${Date.now()}`,
    content,
    author,
    createdAt: new Date().toISOString(),
  }
  ANNOUNCEMENTS_BY_SUBJECT[subjectId] = [announcement, ...(ANNOUNCEMENTS_BY_SUBJECT[subjectId] || [])]
  return announcement
}
