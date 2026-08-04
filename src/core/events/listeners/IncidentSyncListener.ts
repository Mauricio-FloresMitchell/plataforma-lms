import { eventBus } from '../EventBus'
import { createIncidentAsync } from '@/services/incident.service'
import { FORUM_REPORT_REASON_LABELS, type ForumReportReason } from '@/types/forum'
import type { Unsubscribe } from '../EventEmitter'

/**
 * Sincronización automática del Centro de Incidencias (Sprint 19, Parte 8):
 * todo reporte del Foro se convierte automáticamente en una incidencia con
 * origen `foro`, sin que `forum.service.ts` conozca este módulo — mismo
 * principio de acoplamiento en un solo sentido que `TitulacionSyncListener`
 * (Sprint 18).
 */
let unsubscribeAll: Unsubscribe | null = null

export function registerIncidentSyncListener(): Unsubscribe {
  if (unsubscribeAll) return unsubscribeAll

  const subscriptions: Unsubscribe[] = [
    eventBus.subscribe('FORUM_POST_REPORTED', (payload) => {
      void createIncidentAsync({
        title: `Reporte de publicación: "${payload.postTitle}"`,
        description: `Motivo: ${FORUM_REPORT_REASON_LABELS[payload.reason as ForumReportReason] ?? payload.reason}`,
        origin: 'foro',
        priority: 'media',
        reportedById: 'system',
        reportedByName: 'Sincronización automática',
        relatedModule: 'Foro',
        relatedLink: `/foro/${payload.postId}`,
      })
    }),
    eventBus.subscribe('FORUM_COMMENT_REPORTED', (payload) => {
      void createIncidentAsync({
        title: `Reporte de comentario en: "${payload.postTitle}"`,
        description: `Motivo: ${FORUM_REPORT_REASON_LABELS[payload.reason as ForumReportReason] ?? payload.reason}`,
        origin: 'foro',
        priority: 'media',
        reportedById: 'system',
        reportedByName: 'Sincronización automática',
        relatedModule: 'Foro',
        relatedLink: `/foro/${payload.postId}`,
      })
    }),
  ]

  unsubscribeAll = () => {
    subscriptions.forEach((unsubscribe) => unsubscribe())
    unsubscribeAll = null
  }
  return unsubscribeAll
}
