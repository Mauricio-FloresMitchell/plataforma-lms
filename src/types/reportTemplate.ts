/**
 * Motor de plantillas académicas de Reportes Semanales (Sprint 12).
 * Cada carrera de Licenciatura usa exactamente una plantilla (R01-R07);
 * el formulario del Alumno y la vista de lectura del Profesor se renderizan
 * automáticamente a partir de esta definición, sin lógica condicional por carrera.
 *
 * Las 8 carreras coinciden con `CARRERAS_LICENCIATURA` del Generador de
 * Matrículas (`@/features/admin/enrollment`), pero se listan aquí de forma
 * independiente (ADR-006: esa feature aísla su propio contrato) en lugar de
 * importarlas, siguiendo el patrón de datos duplicados entre features.
 */
export type TemplateId = 'R01' | 'R02' | 'R03' | 'R04' | 'R05' | 'R06' | 'R07'

export const REPORT_CAREERS = [
  'Administración',
  'Ingeniería en Sistemas',
  'Negocios Internacionales',
  'Contabilidad',
  'Derecho',
  'Mercadotecnia',
  'Pedagogía',
  'Psicología',
] as const

export type ReportCareer = (typeof REPORT_CAREERS)[number]

export type WeekNumber = 1 | 2 | 3 | 4

export const WEEK_NUMBERS: WeekNumber[] = [1, 2, 3, 4]

/** Campo específico de la plantilla (sección "Datos generales" ampliada). */
export interface TemplateField {
  id: string
  label: string
  type: 'text' | 'textarea'
  placeholder?: string
  required: boolean
}

/** Pregunta dinámica de una semana específica. */
export interface TemplateQuestion {
  id: string
  label: string
  placeholder?: string
  minLength: number
}

export interface ReportTemplate {
  id: TemplateId
  careers: ReportCareer[]
  name: string
  /** Producto de titulación al que este reporte debe integrarse (sección 4, obligatoria). */
  titulacionProduct: string
  titulacionHelpText: string
  specificFields: TemplateField[]
  weeklyQuestions: Record<WeekNumber, TemplateQuestion[]>
  /** Regla especial: exige anonimizar datos de clientes/pacientes (Derecho, Psicología). */
  requiresAnonymization: boolean
  /** Validación: al menos un archivo o enlace adjunto por envío. */
  filesRequired: boolean
}
