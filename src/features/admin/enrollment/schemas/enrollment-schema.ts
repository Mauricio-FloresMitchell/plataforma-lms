import { z } from 'zod'
import {
  CARRERAS_LICENCIATURA,
  MODALIDADES_PREPA,
  PERIODOS_CURSO,
  PERIODOS_LICENCIATURA,
  PROGRAMA_GROUPS,
} from '../types/enrollment'

const TELEFONO_REGEX = /^\d{10}$/
const PERIODO_LICENCIATURA_VALUES = PERIODOS_LICENCIATURA.map((p) => p.value)

/**
 * Captura los datos del formulario en la estructura de UI (agrupada por
 * Prepa/Licenciatura). La transformación al payload exacto que espera
 * Apps Script (EnrollmentRequest) ocurre en EnrollmentForm, sin calcular
 * ni interpretar reglas de negocio: solo reordena los mismos valores.
 */
export const enrollmentSchema = z
  .object({
    nombreCompleto: z
      .string()
      .trim()
      .min(3, 'Ingresa el nombre completo.')
      .max(120, 'El nombre no puede superar los 120 caracteres.'),
    correo: z.string().trim().min(1, 'Ingresa un correo.').email('Ingresa un correo válido.'),
    telefono: z
      .string()
      .trim()
      .regex(TELEFONO_REGEX, 'Ingresa un teléfono a 10 dígitos.'),
    programaGrupo: z.enum([...PROGRAMA_GROUPS] as [string, ...string[]], {
      message: 'Selecciona un programa.',
    }),
    modalidadPrepa: z.string(),
    carrera: z.string(),
    periodoCurso: z.string(),
    periodoLicenciatura: z.string(),
  })
  .refine(
    (data) => data.programaGrupo !== 'Prepa' || MODALIDADES_PREPA.includes(data.modalidadPrepa as never),
    { message: 'Selecciona una modalidad.', path: ['modalidadPrepa'] },
  )
  .refine(
    (data) =>
      data.programaGrupo !== 'Prepa' ||
      data.modalidadPrepa !== 'Curso' ||
      PERIODOS_CURSO.includes(data.periodoCurso as never),
    { message: 'Selecciona un periodo.', path: ['periodoCurso'] },
  )
  .refine(
    (data) =>
      data.programaGrupo !== 'Licenciatura' || CARRERAS_LICENCIATURA.includes(data.carrera as never),
    { message: 'Selecciona una carrera.', path: ['carrera'] },
  )
  .refine(
    (data) =>
      data.programaGrupo !== 'Licenciatura' ||
      PERIODO_LICENCIATURA_VALUES.includes(data.periodoLicenciatura as never),
    { message: 'Selecciona un periodo.', path: ['periodoLicenciatura'] },
  )

export type EnrollmentFormValues = z.infer<typeof enrollmentSchema>
