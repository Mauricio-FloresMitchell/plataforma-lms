import type {
  CreateReportInput,
  EvaluateReportInput,
  WeeklyReport,
} from '@/types/report'
import type { ReportCareer, TemplateId } from '@/types/reportTemplate'
import { getReportTemplate } from '@/mocks/reportTemplates'
import { calculateFinalPercentage, percentageToReportLevel } from '@/utils/reportGrade'

/**
 * Almacén simulado de reportes semanales.
 *
 * Estado en memoria: las altas y evaluaciones se reflejan durante la sesión
 * y se reinician al recargar. No hay persistencia real (LocalStorage, API, etc.).
 * Los ids pendientes coinciden con los del dashboard del profesor para que la
 * acción "Revisar" abra el reporte correcto.
 */

export interface SubjectOption {
  id: string
  name: string
  templateId: TemplateId
  career: ReportCareer
}

/**
 * Materias disponibles para el alumno al crear un reporte, con la plantilla
 * académica (Sprint 12) que le corresponde según su carrera. Se agregaron 4
 * materias de muestra (sub-201..sub-204) exclusivas de este módulo para que
 * las 7 plantillas puedan probarse de punta a punta con la única cuenta demo
 * de alumno; no afectan el listado real de Materias (`mocks/subjects.ts`).
 */
const SUBJECTS_BY_STUDENT: Record<string, SubjectOption[]> = {
  'usr-alumno-001': [
    { id: 'sub-001', name: 'Administración Estratégica', templateId: 'R01', career: 'Administración' },
    { id: 'sub-002', name: 'Mercadotecnia Digital', templateId: 'R07', career: 'Mercadotecnia' },
    { id: 'sub-003', name: 'Finanzas Corporativas', templateId: 'R06', career: 'Contabilidad' },
    { id: 'sub-004', name: 'Comportamiento Organizacional', templateId: 'R01', career: 'Negocios Internacionales' },
    { id: 'sub-005', name: 'Innovación y Emprendimiento', templateId: 'R01', career: 'Administración' },
    { id: 'sub-201', name: 'Desarrollo de Software', templateId: 'R02', career: 'Ingeniería en Sistemas' },
    { id: 'sub-202', name: 'Derecho Corporativo', templateId: 'R03', career: 'Derecho' },
    { id: 'sub-203', name: 'Diseño Curricular', templateId: 'R04', career: 'Pedagogía' },
    { id: 'sub-204', name: 'Psicología Organizacional', templateId: 'R05', career: 'Psicología' },
  ],
}

let REPORTS: WeeklyReport[] = [
  {
    id: 'rep-101',
    studentId: 'usr-alumno-001',
    studentName: 'María García López',
    subjectId: 'sub-001',
    subjectName: 'Administración Estratégica',
    groupName: 'ADM-501',
    week: 11,
    title: 'Análisis de la cadena de valor',
    content:
      'Durante esta semana analicé la cadena de valor de la empresa asignada, identificando actividades primarias y de apoyo. Detecté oportunidades de mejora en logística interna y proponer indicadores de seguimiento.',
    status: 'pendiente',
    submittedAt: '2026-07-22T18:10:00.000Z',
    evidences: [{ id: 'ev-1', name: 'cadena-valor.pdf' }],
    evaluation: null,
  },
  {
    id: 'rep-102',
    studentId: 'usr-alumno-050',
    studentName: 'Jorge Ramírez Peña',
    subjectId: 'sub-004',
    subjectName: 'Comportamiento Organizacional',
    groupName: 'ADM-402',
    week: 11,
    title: 'Clima organizacional del equipo',
    content:
      'Apliqué una encuesta de clima organizacional a un equipo de trabajo y resumí los principales hallazgos sobre motivación y comunicación interna.',
    status: 'pendiente',
    submittedAt: '2026-07-22T09:35:00.000Z',
    evidences: [],
    evaluation: null,
  },
  {
    id: 'rep-103',
    studentId: 'usr-alumno-051',
    studentName: 'Lucía Fernández Mora',
    subjectId: 'sub-007',
    subjectName: 'Gestión del Talento',
    groupName: 'ADM-303',
    week: 10,
    title: 'Plan de capacitación',
    content:
      'Diseñé un plan de capacitación para un área operativa, definiendo objetivos de aprendizaje y un cronograma tentativo por competencias.',
    status: 'pendiente',
    submittedAt: '2026-07-21T20:05:00.000Z',
    evidences: [{ id: 'ev-2', name: 'plan-capacitacion.pdf' }],
    evaluation: null,
  },
  {
    id: 'rep-104',
    studentId: 'usr-alumno-052',
    studentName: 'Andrés Solís Vega',
    subjectId: 'sub-001',
    subjectName: 'Administración Estratégica',
    groupName: 'ADM-501',
    week: 11,
    title: 'Matriz FODA aplicada',
    content:
      'Elaboré una matriz FODA de la organización asignada y propuse estrategias derivadas del cruce de factores internos y externos.',
    status: 'pendiente',
    submittedAt: '2026-07-21T14:50:00.000Z',
    evidences: [],
    evaluation: null,
  },
  {
    id: 'rep-090',
    studentId: 'usr-alumno-001',
    studentName: 'María García López',
    subjectId: 'sub-003',
    subjectName: 'Finanzas Corporativas',
    groupName: 'ADM-501',
    week: 10,
    title: 'Análisis de razones financieras',
    content:
      'Calculé e interpreté las principales razones financieras de la empresa, comparándolas con el promedio del sector.',
    status: 'aprobado',
    submittedAt: '2026-07-14T17:00:00.000Z',
    evidences: [{ id: 'ev-3', name: 'razones-financieras.xlsx' }],
    evaluation: {
      level: 'A',
      observations: 'Buen análisis. Profundiza en la interpretación de la liquidez.',
      evaluatedAt: '2026-07-16T12:00:00.000Z',
    },
  },
  {
    id: 'rep-085',
    studentId: 'usr-alumno-001',
    studentName: 'María García López',
    subjectId: 'sub-002',
    subjectName: 'Mercadotecnia Digital',
    groupName: 'ADM-501',
    week: 9,
    title: 'Propuesta de campaña digital',
    content:
      'Propuse una campaña digital para el producto asignado, con objetivos, canales y métricas de seguimiento.',
    status: 'correcciones',
    submittedAt: '2026-07-07T15:30:00.000Z',
    evidences: [],
    // Nivel remapeado de 'B+' (escala de 8 niveles, RN-005) a 'B' (escala de
    // Reportes, Sprint 12/ADR-008): son escalas distintas desde este sprint.
    evaluation: {
      level: 'B',
      observations: 'Ajusta las métricas propuestas y define el presupuesto por canal.',
      evaluatedAt: '2026-07-09T10:30:00.000Z',
    },
  },
]

let sequence = 200

function clone(report: WeeklyReport): WeeklyReport {
  return structuredClone(report)
}

export function listReportsByStudent(studentId: string): WeeklyReport[] {
  return REPORTS.filter((report) => report.studentId === studentId).map(clone)
}

export function listPendingReports(): WeeklyReport[] {
  return REPORTS.filter((report) => report.status === 'pendiente').map(clone)
}

/** Todos los reportes del sistema (Sprint 13, Parte 6: Centro de Reportes del Administrador). */
export function listAllReports(): WeeklyReport[] {
  return REPORTS.map(clone)
}

/**
 * Cambia el estado de un reporte sin tocar su evaluación (Sprint 13, Parte 6):
 * "Aprobar"/"Rechazar" del Centro de Reportes del Administrador son un
 * cambio de estado directo, distinto de la evaluación completa por rúbrica
 * que ya hace `applyEvaluation` (Profesor); "Devolver" es el mismo mecanismo
 * regresando el reporte a `pendiente`.
 */
export function setReportStatus(reportId: string, status: WeeklyReport['status']): WeeklyReport | null {
  const report = REPORTS.find((item) => item.id === reportId)
  if (!report) return null
  report.status = status
  return clone(report)
}

export function findReport(reportId: string): WeeklyReport | null {
  const report = REPORTS.find((item) => item.id === reportId)
  return report ? clone(report) : null
}

export function getSubjectsForStudent(studentId: string): SubjectOption[] {
  return SUBJECTS_BY_STUDENT[studentId] ?? []
}

/** Resume las respuestas dinámicas en un párrafo, solo para compatibilidad con vistas que aún leen `report.content`. */
function summarizeAnswers(input: CreateReportInput): string {
  return input.answers.map((answer) => answer.value).join(' ')
}

export function insertReport(
  studentId: string,
  studentName: string,
  input: CreateReportInput,
): WeeklyReport {
  const subject = getSubjectsForStudent(studentId).find((item) => item.id === input.subjectId)
  const template = getReportTemplate(input.templateId)
  sequence += 1
  const report: WeeklyReport = {
    id: `rep-${sequence}`,
    studentId,
    studentName,
    subjectId: input.subjectId,
    subjectName: subject?.name ?? 'Materia',
    groupName: 'ADM-501',
    week: input.week,
    title: `Semana ${input.week} · ${template.name}`,
    content: summarizeAnswers(input),
    status: 'pendiente',
    submittedAt: new Date().toISOString(),
    evidences: input.evidences,
    evaluation: null,
    templateId: input.templateId,
    fieldValues: input.fieldValues,
    answers: input.answers,
    titulacionIntegration: input.titulacionIntegration,
    anonymizationConfirmed: input.anonymizationConfirmed,
    links: input.links,
  }
  REPORTS = [report, ...REPORTS]
  return clone(report)
}

export function applyEvaluation(reportId: string, input: EvaluateReportInput): WeeklyReport | null {
  const report = REPORTS.find((item) => item.id === reportId)
  if (!report) return null

  const finalPercentage = calculateFinalPercentage(input.rubricA, input.rubricB, input.bonus)

  report.status = input.decision
  report.evaluation = {
    level: percentageToReportLevel(finalPercentage),
    observations: input.observations,
    evaluatedAt: new Date().toISOString(),
    rubricA: input.rubricA,
    rubricB: input.rubricB,
    bonus: input.bonus,
    finalPercentage,
    badgeIds: input.badgeIds,
  }
  return clone(report)
}
