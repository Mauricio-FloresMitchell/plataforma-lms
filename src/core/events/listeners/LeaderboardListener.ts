import { eventBus, emitAppEvent } from '../EventBus'
import { getSubjectLeaderboardAsync } from '@/services/gamification.service'
import type { Unsubscribe } from '../EventEmitter'

/**
 * Reacciona a movimientos de puntos y recalcula la posición del alumno en su
 * materia (Sprint Event Bus). No modifica cómo se calcula el Leaderboard
 * (sigue siendo derivado en vivo por `gamification.service.ts`, Sprint
 * Leaderboard) — solo detecta el cambio y emite `LEADERBOARD_UPDATED`, que a
 * su vez escucha `NotificationListener`. Así, "Gamificación" y "Leaderboard"
 * y "Notificaciones" quedan desacoplados entre sí: ninguno conoce al otro
 * directamente, solo el Event Bus.
 */
let unsubscribeAll: Unsubscribe | null = null

async function recalculateAndEmit(studentId: string, subjectId: string): Promise<void> {
  try {
    const entries = await getSubjectLeaderboardAsync(subjectId)
    const entry = entries.find((item) => item.studentId === studentId)
    if (!entry) return

    emitAppEvent('LEADERBOARD_UPDATED', {
      studentId,
      studentName: entry.studentName,
      subjectId,
      rank: entry.rank,
      enteredTop3: entry.rank <= 3,
    })
  } catch (error) {
    console.error('[LeaderboardListener] No se pudo recalcular el ranking:', error)
  }
}

export function registerLeaderboardListener(): Unsubscribe {
  if (unsubscribeAll) return unsubscribeAll

  const subscriptions: Unsubscribe[] = [
    eventBus.subscribe('POINTS_GRANTED', (payload) => {
      void recalculateAndEmit(payload.studentId, payload.subjectId)
    }),
    eventBus.subscribe('POINTS_REMOVED', (payload) => {
      void recalculateAndEmit(payload.studentId, payload.subjectId)
    }),
    // Sprint 17, Parte 9: el Leaderboard también se recalcula al entregar un
    // reporte o publicar una evaluación — no solo al registrar puntos. Como
    // el ranking siempre se deriva en vivo, "recalcular" aquí es solo emitir
    // `LEADERBOARD_UPDATED` para que Notificaciones reaccione igual que con
    // los puntos.
    eventBus.subscribe('REPORT_SUBMITTED', (payload) => {
      void recalculateAndEmit(payload.studentId, payload.subjectId)
    }),
    eventBus.subscribe('GRADE_UPDATED', (payload) => {
      if (payload.status !== 'publicada') return
      void recalculateAndEmit(payload.studentId, payload.subjectId)
    }),
  ]

  unsubscribeAll = () => {
    subscriptions.forEach((unsubscribe) => unsubscribe())
    unsubscribeAll = null
  }
  return unsubscribeAll
}
