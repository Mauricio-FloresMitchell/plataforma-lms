import { z } from 'zod'

export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'El título debe tener al menos 5 caracteres.')
    .max(140, 'El título no puede superar los 140 caracteres.'),
  categoryId: z.string().min(1, 'Selecciona una categoría.'),
  tags: z
    .string()
    .optional()
    .transform((value) =>
      (value ?? '')
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 6),
    ),
  content: z
    .string()
    .trim()
    .min(20, 'Describe tu publicación (mínimo 20 caracteres).')
    .max(4000, 'El contenido no puede superar los 4000 caracteres.'),
})

/** Valores del formulario antes de transformar (etiquetas como texto). */
export type PostFormInput = z.input<typeof postSchema>

/** Valores ya validados (etiquetas como arreglo). */
export type PostFormValues = z.output<typeof postSchema>
