import { eventBus } from '../EventBus'
import { createNotification } from '@/services/notification.service'
import type { CreateNotificationInput } from '@/types/notification'
import type { NoticeSentPayload } from '../EventTypes'
import type { Unsubscribe } from '../EventEmitter'

/**
 * Traduce eventos del Event Bus a notificaciones (Sprint Event Bus).
 *
 * Es el único lugar del proyecto que crea `Notification`s. Ningún módulo
 * (Evaluaciones, Reportes, Foro, Gamificación…) llama a
 * `notification.service.ts` directamente — solo emiten su evento de dominio
 * y este listener decide si corresponde una notificación, para quién, y con
 * qué texto/enlace.
 *
 * Cuentas demo de esta plataforma (ver `mocks/users.ts`): al ser un MVP con
 * una sola cuenta real por rol, los eventos sin un destinatario explícito en
 * el payload (ej. "el profesor de este reporte") se dirigen a la cuenta demo
 * del rol correspondiente — mismo criterio ya usado en Gamificación/Foro.
 */
const DEMO_ALUMNO_ID = 'usr-alumno-001'
const DEMO_PROFESOR_ID = 'usr-profesor-001'
const DEMO_ADMIN_ID = 'usr-admin-001'

/** Materias en las que está inscrita la cuenta demo de Alumno (`mocks/subjects.ts`, `STUDENT_SUBJECTS`). */
const DEMO_ALUMNO_SUBJECT_IDS = new Set(['sub-001', 'sub-002', 'sub-003', 'sub-004', 'sub-005'])

/**
 * Resuelve destinatarios de un aviso institucional (Sprint 13, Parte 9:
 * difusión del Administrador — "A todos / Por carrera / Por grupo / Por
 * profesor / Por alumno / Por rol"). Con solo 3 cuentas reales, "por
 * carrera"/"por grupo"/"por materia" siguen dirigiéndose a la cuenta demo de
 * Alumno (mismo criterio ya usado antes de este sprint); `recipientId`
 * explícito (alumno/profesor puntual) y `role` (por rol) sí se resuelven.
 */
function resolveNoticeRecipients(payload: NoticeSentPayload): string[] {
  if (payload.scope === 'todos') return [DEMO_ALUMNO_ID, DEMO_PROFESOR_ID, DEMO_ADMIN_ID]
  if (payload.scope === 'rol') {
    if (payload.role === 'profesor') return [DEMO_PROFESOR_ID]
    if (payload.role === 'administrador') return [DEMO_ADMIN_ID]
    return [DEMO_ALUMNO_ID]
  }
  if (payload.scope === 'alumno' && payload.recipientId) return [payload.recipientId]
  if (payload.scope === 'profesor' && payload.recipientId) return [payload.recipientId]
  return [DEMO_ALUMNO_ID]
}

function notify(input: CreateNotificationInput): void {
  createNotification(input).catch((error) => {
    console.error('[NotificationListener] No se pudo crear la notificación:', error)
  })
}

let unsubscribeAll: Unsubscribe | null = null

/** Suscribe el listener a todos los eventos que generan notificaciones. Idempotente. */
export function registerNotificationListener(): Unsubscribe {
  if (unsubscribeAll) return unsubscribeAll

  const subscriptions: Unsubscribe[] = [
    eventBus.subscribe('REPORT_SUBMITTED', (payload) => {
      notify({
        userId: DEMO_PROFESOR_ID,
        title: 'Nuevo reporte recibido',
        description: `${payload.studentName} entregó su reporte de la semana ${payload.week} — ${payload.subjectName}.`,
        type: 'nuevo_reporte',
        priority: 'media',
        link: `/profesor/reportes/${payload.reportId}`,
        createdBy: payload.studentName,
        metadata: { reportId: payload.reportId },
      })
    }),

    eventBus.subscribe('REPORT_APPROVED', (payload) => {
      notify({
        userId: payload.studentId,
        title: 'Reporte aprobado',
        description: `Tu reporte de ${payload.subjectName} (semana ${payload.week}) fue aprobado.`,
        type: 'reporte_aprobado',
        priority: 'media',
        link: `/alumno/reportes/${payload.reportId}`,
        metadata: { reportId: payload.reportId },
      })
    }),

    eventBus.subscribe('REPORT_REJECTED', (payload) => {
      notify({
        userId: payload.studentId,
        title: 'Se solicitaron correcciones',
        description: `Tu reporte de ${payload.subjectName} (semana ${payload.week}) necesita correcciones.`,
        type: 'reporte_rechazado',
        priority: 'alta',
        link: `/alumno/reportes/${payload.reportId}`,
        metadata: { reportId: payload.reportId },
      })
    }),

    eventBus.subscribe('GRADE_UPDATED', (payload) => {
      if (payload.status !== 'publicada') return
      notify({
        userId: payload.studentId,
        title: 'Nueva calificación disponible',
        description: `Tu evaluación de ${payload.subjectName} ya está publicada.`,
        type: 'nueva_calificacion',
        priority: 'alta',
        link: `/alumno/evaluaciones/${payload.evaluationId}`,
        metadata: { evaluationId: payload.evaluationId },
      })
    }),

    eventBus.subscribe('FORUM_COMMENT_CREATED', (payload) => {
      if (payload.recipientId === payload.actorId) return
      notify({
        userId: payload.recipientId,
        title: 'Nuevo comentario',
        description: `${payload.actorName} comentó en "${payload.postTitle}".`,
        type: 'foro_nuevo_comentario',
        priority: 'baja',
        link: `/foro/${payload.postId}`,
        createdBy: payload.actorName,
        metadata: { postId: payload.postId, commentId: payload.commentId },
      })
    }),

    eventBus.subscribe('FORUM_REPLY_CREATED', (payload) => {
      if (payload.recipientId === payload.actorId) return
      notify({
        userId: payload.recipientId,
        title: 'Respuesta recibida',
        description: `${payload.actorName} respondió tu comentario en "${payload.postTitle}".`,
        type: 'foro_respuesta_recibida',
        priority: 'baja',
        link: `/foro/${payload.postId}`,
        createdBy: payload.actorName,
        metadata: { postId: payload.postId, replyId: payload.commentId },
      })
    }),

    eventBus.subscribe('FORUM_POST_REPORTED', (payload) => {
      notify({
        userId: DEMO_ADMIN_ID,
        title: 'Publicación reportada',
        description: `"${payload.postTitle}" fue reportada (${payload.reason}).`,
        type: 'foro_publicacion_reportada',
        priority: 'alta',
        link: '/admin/moderacion',
        metadata: { reportId: payload.reportId, postId: payload.postId },
      })
    }),

    eventBus.subscribe('FORUM_COMMENT_REPORTED', (payload) => {
      notify({
        userId: DEMO_ADMIN_ID,
        title: 'Comentario reportado',
        description: `Un comentario en "${payload.postTitle}" fue reportado (${payload.reason}).`,
        type: 'foro_comentario_reportado',
        priority: 'alta',
        link: '/admin/moderacion',
        metadata: { reportId: payload.reportId, postId: payload.postId },
      })
    }),

    eventBus.subscribe('BADGE_GRANTED', (payload) => {
      notify({
        userId: payload.studentId,
        title: 'Nueva insignia',
        description: `Obtuviste la insignia "${payload.badgeName}".`,
        type: 'nueva_insignia',
        priority: 'media',
        link: '/alumno/evaluaciones',
        metadata: { badgeId: payload.badgeId },
      })
    }),

    eventBus.subscribe('POINTS_GRANTED', (payload) => {
      notify({
        userId: payload.studentId,
        title: 'Ganaste puntos',
        description: `+${payload.points} pts · ${payload.actionLabel}.`,
        type: 'puntos_ganados',
        priority: 'baja',
        link: '/alumno/leaderboard',
        metadata: { subjectId: payload.subjectId, points: payload.points },
      })
    }),

    eventBus.subscribe('POINTS_REMOVED', (payload) => {
      notify({
        userId: payload.studentId,
        title: 'Perdiste puntos',
        description: `${payload.points} pts · ${payload.actionLabel}.`,
        type: 'puntos_perdidos',
        priority: 'media',
        link: '/alumno/leaderboard',
        metadata: { subjectId: payload.subjectId, points: payload.points },
      })
    }),

    eventBus.subscribe('LEADERBOARD_UPDATED', (payload) => {
      notify({
        userId: payload.studentId,
        title: payload.enteredTop3 ? 'Entraste al Top 3' : 'Subiste posiciones',
        description: `Ahora ocupas el lugar #${payload.rank} del ranking.`,
        type: payload.enteredTop3 ? 'entraste_top3' : 'subiste_posiciones',
        priority: payload.enteredTop3 ? 'alta' : 'baja',
        link: '/alumno/leaderboard',
        metadata: { subjectId: payload.subjectId, rank: payload.rank },
      })
    }),

    eventBus.subscribe('ACTIVITY_CREATED', (payload) => {
      if (!DEMO_ALUMNO_SUBJECT_IDS.has(payload.subjectId)) return
      notify({
        userId: DEMO_ALUMNO_ID,
        title: 'Nueva actividad',
        description: `${payload.createdByName} publicó "${payload.itemTitle}" en ${payload.subjectName}.`,
        type: 'nueva_actividad',
        priority: 'media',
        link: `/alumno/materias/${payload.subjectId}`,
        createdBy: payload.createdByName,
        metadata: { subjectId: payload.subjectId, activityId: payload.itemId },
      })
    }),

    eventBus.subscribe('MATERIAL_CREATED', (payload) => {
      if (!DEMO_ALUMNO_SUBJECT_IDS.has(payload.subjectId)) return
      notify({
        userId: DEMO_ALUMNO_ID,
        title: 'Nuevo material',
        description: `${payload.createdByName} agregó "${payload.itemTitle}" en ${payload.subjectName}.`,
        type: 'nuevo_material',
        priority: 'baja',
        link: `/alumno/materias/${payload.subjectId}`,
        createdBy: payload.createdByName,
        metadata: { subjectId: payload.subjectId, materialId: payload.itemId },
      })
    }),

    eventBus.subscribe('NOTICE_SENT', (payload) => {
      const recipientIds = resolveNoticeRecipients(payload)
      for (const userId of recipientIds) {
        notify({
          userId,
          title: 'Aviso institucional',
          description: payload.content,
          type: 'aviso_institucional',
          priority: 'media',
          link: userId === DEMO_PROFESOR_ID ? '/profesor' : userId === DEMO_ADMIN_ID ? '/admin' : '/alumno/materias',
          createdBy: payload.authorName,
          metadata: { scope: payload.scope },
        })
      }
    }),

    eventBus.subscribe('ADMIN_WARNING_SENT', (payload) => {
      notify({
        userId: payload.userId,
        title: 'Recibiste una advertencia',
        description: payload.message,
        type: 'advertencia',
        priority: 'alta',
        link: '/foro',
        createdBy: payload.issuedByName,
      })
    }),

    eventBus.subscribe('USER_LOGIN', (payload) => {
      notify({
        userId: payload.userId,
        title: 'Inicio de sesión',
        description: `Iniciaste sesión el ${new Date(payload.occurredAt).toLocaleString('es-ES')}.`,
        type: 'inicio_sesion',
        priority: 'baja',
      })
    }),

    eventBus.subscribe('MESSAGE_SENT', (payload) => {
      const knownRecipients = payload.recipientIds.filter((id) =>
        [DEMO_ALUMNO_ID, DEMO_PROFESOR_ID, DEMO_ADMIN_ID].includes(id),
      )
      for (const recipientId of knownRecipients) {
        notify({
          userId: recipientId,
          title: `Nuevo mensaje de ${payload.senderName}`,
          description: payload.content.length > 140 ? `${payload.content.slice(0, 140)}…` : payload.content,
          type: 'nuevo_mensaje',
          priority: 'media',
          link: `/comunicacion/${payload.conversationId}`,
          createdBy: payload.senderName,
          metadata: { conversationId: payload.conversationId, messageId: payload.messageId },
        })
      }
    }),
    eventBus.subscribe('ACTIVITY_SUBMITTED', (payload) => {
      notify({
        userId: DEMO_PROFESOR_ID,
        title: 'Nueva entrega recibida',
        description: `${payload.studentName} entregó "${payload.activityTitle}" — ${payload.subjectName}${payload.isLate ? ' (fuera de tiempo)' : ''}.`,
        type: 'entrega_recibida',
        priority: payload.isLate ? 'alta' : 'media',
        link: `/profesor/materias/${payload.subjectId}`,
        createdBy: payload.studentName,
        metadata: { subjectId: payload.subjectId, activityId: payload.activityId },
      })
    }),

    eventBus.subscribe('ACTIVITY_EVALUATED', (payload) => {
      notify({
        userId: payload.studentId,
        title: 'Entrega evaluada',
        description: `Tu entrega de "${payload.activityTitle}" (${payload.subjectName}) obtuvo ${payload.percentage}%.`,
        type: 'entrega_evaluada',
        priority: 'alta',
        link: `/alumno/materias/${payload.subjectId}/actividades/${payload.activityId}`,
        metadata: { subjectId: payload.subjectId, activityId: payload.activityId },
      })
    }),

    eventBus.subscribe('GROUP_REQUEST_CREATED', (payload) => {
      notify({
        userId: payload.professorId,
        title: 'Solicitud de grupo de conversación',
        description: `${payload.studentName} solicitó un grupo de conversación para ${payload.subjectName}.`,
        type: 'solicitud_grupo',
        priority: 'media',
        link: '/comunicacion',
        createdBy: payload.studentName,
        metadata: { requestId: payload.requestId },
      })
    }),

    eventBus.subscribe('GROUP_REQUEST_RESOLVED', (payload) => {
      notify({
        userId: payload.studentId,
        title: payload.status === 'aceptada' ? 'Grupo de conversación creado' : 'Solicitud de grupo rechazada',
        description:
          payload.status === 'aceptada'
            ? `Tu profesor creó el grupo de conversación para ${payload.subjectName}.`
            : `Tu profesor rechazó la solicitud de grupo para ${payload.subjectName}.`,
        type: 'solicitud_grupo_resuelta',
        priority: 'media',
        link: payload.conversationId ? `/comunicacion/${payload.conversationId}` : '/comunicacion',
        metadata: { requestId: payload.requestId },
      })
    }),
    eventBus.subscribe('TITULACION_PHASE_SUBMITTED', (payload) => {
      notify({
        userId: DEMO_PROFESOR_ID,
        title: 'Fase de titulación enviada',
        description: `${payload.studentName} envió "${payload.phaseName}" a revisión.`,
        type: 'titulacion_fase_enviada',
        priority: 'media',
        link: '/profesor/titulacion',
        createdBy: payload.studentName,
        metadata: { studentId: payload.studentId, phaseId: payload.phaseId },
      })
    }),

    eventBus.subscribe('TITULACION_PHASE_REVIEWED', (payload) => {
      notify({
        userId: payload.studentId,
        title: payload.action === 'aprobada' ? 'Fase de titulación aprobada' : 'Fase de titulación rechazada',
        description: `"${payload.phaseName}" fue ${payload.action} por ${payload.reviewedByName}.`,
        type: 'titulacion_fase_revisada',
        priority: payload.action === 'aprobada' ? 'media' : 'alta',
        link: '/alumno/titulacion',
        metadata: { phaseId: payload.phaseId, action: payload.action },
      })
    }),
  ]

  unsubscribeAll = () => {
    subscriptions.forEach((unsubscribe) => unsubscribe())
    unsubscribeAll = null
  }
  return unsubscribeAll
}
