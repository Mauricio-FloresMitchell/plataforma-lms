import { z } from 'zod'

export const announcementSchema = z
  .object({
    subjectId: z.string().min(1, 'Selecciona una materia.'),
    scope: z.enum(['alumno', 'grupo', 'materia'], { message: 'Selecciona un destinatario.' }),
    targetId: z.string(),
    content: z
      .string()
      .trim()
      .min(5, 'Escribe el contenido del aviso (mínimo 5 caracteres).')
      .max(1000, 'El aviso no puede superar los 1000 caracteres.'),
  })
  .refine((data) => data.scope !== 'alumno' || data.targetId.length > 0, {
    message: 'Selecciona un alumno.',
    path: ['targetId'],
  })

export type AnnouncementFormValues = z.infer<typeof announcementSchema>
