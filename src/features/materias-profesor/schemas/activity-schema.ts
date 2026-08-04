import { z } from 'zod'

export const activitySchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'El título debe tener al menos 3 caracteres.')
    .max(120, 'El título no puede superar los 120 caracteres.'),
  description: z
    .string()
    .trim()
    .min(10, 'Describe la actividad (mínimo 10 caracteres).')
    .max(1000, 'La descripción no puede superar los 1000 caracteres.'),
  instructions: z.string().trim().max(2000, 'Las instrucciones no pueden superar los 2000 caracteres.').optional(),
  openDate: z.string().optional(),
  dueDate: z.string().min(1, 'Selecciona una fecha límite.'),
  status: z.enum(['pendiente', 'completada', 'atrasada'], {
    message: 'Selecciona un estado.',
  }),
  weightPercentage: z.coerce.number().min(0).max(100).optional(),
  isHidden: z.boolean().optional(),
})

export type ActivityFormInput = z.input<typeof activitySchema>
export type ActivityFormValues = z.output<typeof activitySchema>
