/**
 * Tipos de dominio para el módulo Generador de Matrículas.
 *
 * Estos valores NO son configurables: son exactamente los que espera el
 * Apps Script institucional (fuente de verdad de la lógica de negocio).
 * React únicamente captura estos datos y los envía; no calcula matrículas,
 * grupos, consecutivos ni abreviaturas.
 *
 * El contrato de EnrollmentRequest/EnrollmentResponse coincide con el
 * payload y la respuesta reales de Apps Script (ver services/api/appsScriptApi.ts).
 */

/** Programa, nivel superior. Exactamente estas dos opciones. */
export const PROGRAMA_GROUPS = ['Prepa', 'Licenciatura'] as const
export type ProgramaGroup = (typeof PROGRAMA_GROUPS)[number]

/** Modalidades cuando el programa es Prepa. Exactamente estas tres. */
export const MODALIDADES_PREPA = ['Examen', 'Curso', 'Escolarizada'] as const
export type ModalidadPrepa = (typeof MODALIDADES_PREPA)[number]

/** Carreras cuando el programa es Licenciatura. Exactamente estas ocho. */
export const CARRERAS_LICENCIATURA = [
  'Administración',
  'Ingeniería en Sistemas',
  'Negocios Internacionales',
  'Contabilidad',
  'Derecho',
  'Mercadotecnia',
  'Pedagogía',
  'Psicología',
] as const
export type CarreraLicenciatura = (typeof CARRERAS_LICENCIATURA)[number]

/** Periodo cuando Prepa + Curso. Exactamente estas dos opciones (valor = etiqueta). */
export const PERIODOS_CURSO = ['3 meses', '6 meses'] as const
export type PeriodoCurso = (typeof PERIODOS_CURSO)[number]

/** Periodo cuando Licenciatura. Valor enviado a Apps Script vs. etiqueta mostrada. */
export const PERIODOS_LICENCIATURA = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Mayo' },
  { value: '3', label: 'Septiembre' },
] as const

/** Datos capturados en el formulario. Coincide exactamente con el payload que espera Apps Script. */
export interface EnrollmentRequest {
  nombreCompleto: string
  correo: string
  telefono: string
  programa: string
  modalidad: string
  periodo: string
}

/** Respuesta del registro. Coincide con el campo "data" del Apps Script. */
export interface EnrollmentResponse {
  matricula: string
  grupo: string
  numeroAlumno: string
  pdfUrl?: string
  /** Usuario para iniciar sesión (coincide con la matrícula). */
  usuario?: string
  /** Contraseña temporal asignada al alumno. */
  contrasenaTemporal?: string
}

/**
 * Envoltura JSON uniforme que devuelve el Web App de Apps Script,
 * tanto en éxito (`data` presente) como en error (`error` presente).
 */
export interface AppsScriptEnvelope<T> {
  success: boolean
  message: string
  data?: T
  error?: string
}
