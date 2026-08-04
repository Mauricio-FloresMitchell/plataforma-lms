import { eventBus } from '../EventBus'
import { attachTitulacionEvidenceAsync } from '@/services/titulacion.service'
import type { Unsubscribe } from '../EventEmitter'

/**
 * Sincronización automática del Producto de Titulación (Sprint 18, Parte 7):
 * escucha lo que ya emiten Reportes, Evaluaciones, Actividades, Gamificación,
 * Leaderboard y Cursos, y adjunta evidencia vía el único punto de entrada del
 * repositorio (`attachTitulacionEvidenceAsync`). Ningún otro módulo conoce ni
 * importa Titulación — el acoplamiento va en un solo sentido, a través de
 * este listener.
 */
let unsubscribeAll: Unsubscribe | null = null

export function registerTitulacionSyncListener(): Unsubscribe {
  if (unsubscribeAll) return unsubscribeAll

  const subscriptions: Unsubscribe[] = [
    eventBus.subscribe('REPORT_SUBMITTED', (payload) => {
      void attachTitulacionEvidenceAsync(
        payload.studentId,
        { kind: 'reporte', label: `Reporte semanal ${payload.week} — ${payload.subjectName}`, link: `/alumno/reportes/${payload.reportId}` },
        `Se sincronizó el reporte semanal ${payload.week} de ${payload.subjectName}`,
        'Reportes Semanales',
      )
    }),
    eventBus.subscribe('GRADE_UPDATED', (payload) => {
      if (payload.status !== 'publicada') return
      void attachTitulacionEvidenceAsync(
        payload.studentId,
        { kind: 'evaluacion', label: `Evaluación publicada — ${payload.subjectName}` },
        `Se sincronizó la evaluación publicada de ${payload.subjectName}`,
        'Evaluaciones',
      )
    }),
    eventBus.subscribe('ACTIVITY_SUBMITTED', (payload) => {
      void attachTitulacionEvidenceAsync(
        payload.studentId,
        { kind: 'actividad', label: `Actividad: ${payload.activityTitle}` },
        `Se sincronizó la entrega de "${payload.activityTitle}" (${payload.subjectName})`,
        'Actividades',
      )
    }),
    eventBus.subscribe('BADGE_GRANTED', (payload) => {
      void attachTitulacionEvidenceAsync(
        payload.studentId,
        { kind: 'badge', label: payload.badgeName },
        `Se sincronizó la insignia "${payload.badgeName}"`,
        'Gamificación',
      )
    }),
    eventBus.subscribe('LEADERBOARD_UPDATED', (payload) => {
      if (!payload.enteredTop3) return
      void attachTitulacionEvidenceAsync(
        payload.studentId,
        { kind: 'leaderboard', label: `Top 3 del Leaderboard (posición ${payload.rank})` },
        'Se sincronizó el ingreso al Top 3 del Leaderboard',
        'Leaderboard',
      )
    }),
    eventBus.subscribe('COURSE_COMPLETED', (payload) => {
      void attachTitulacionEvidenceAsync(
        payload.studentId,
        { kind: 'curso', label: `Curso completado: ${payload.courseTitle}` },
        `Se sincronizó la finalización del curso "${payload.courseTitle}"`,
        'Cursos y Certificaciones',
      )
    }),
  ]

  unsubscribeAll = () => {
    subscriptions.forEach((unsubscribe) => unsubscribe())
    unsubscribeAll = null
  }
  return unsubscribeAll
}
