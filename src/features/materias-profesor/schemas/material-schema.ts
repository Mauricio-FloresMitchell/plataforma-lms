import { z } from 'zod'

const LINK_TYPES = ['enlace', 'video'] as const

export const materialSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'El título debe tener al menos 3 caracteres.')
      .max(120, 'El título no puede superar los 120 caracteres.'),
    type: z.enum(['pdf', 'word', 'excel', 'powerpoint', 'imagen', 'video', 'enlace'], {
      message: 'Selecciona un tipo de material.',
    }),
    url: z.string().trim(),
    fileName: z.string().trim(),
    description: z.string().trim().max(500, 'La descripción no puede superar los 500 caracteres.').optional(),
    category: z.enum(['Lectura', 'Video', 'Plantilla', 'Guía', 'Evaluación', 'Otro']).optional(),
    tags: z
      .string()
      .optional()
      .transform((value) =>
        (value ?? '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      ),
    isHidden: z.boolean().optional(),
    scheduledAt: z.string().optional(),
  })
  .refine(
    (data) => !(LINK_TYPES as readonly string[]).includes(data.type) || data.url.length > 0,
    { message: 'Ingresa la URL del enlace o video.', path: ['url'] },
  )
  .refine(
    (data) => (LINK_TYPES as readonly string[]).includes(data.type) || data.fileName.length > 0,
    { message: 'Adjunta un archivo.', path: ['fileName'] },
  )

/** Valores del formulario antes de transformar (etiquetas como texto). */
export type MaterialFormInput = z.input<typeof materialSchema>
/** Valores ya validados (etiquetas como arreglo). */
export type MaterialFormValues = z.output<typeof materialSchema>
