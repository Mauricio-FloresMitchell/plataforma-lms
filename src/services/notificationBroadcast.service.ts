import {
  deleteBroadcast,
  findBroadcast,
  insertBroadcast,
  listBroadcasts,
  markBroadcastSent,
  setBroadcastArchived,
  updateBroadcast,
} from '@/mocks/notificationBroadcasts'
import { emitAppEvent } from '@/core/events/EventBus'
import { recordAudit, type AuditActor } from '@/services/audit.service'
import type { BroadcastInput, BroadcastStatus, NotificationBroadcast } from '@/types/notificationBroadcast'

/**
 * Capa de acceso a datos de difusión de avisos (Sprint 13, Parte 9).
 * "Enviar ahora" es el único punto que emite al Event Bus (`NOTICE_SENT`) —
 * nunca se llama a `notification.service.ts` directamente, tal como pide el
 * sprint ("Reutilizar el Event Bus implementado. No crear otro sistema.").
 */

const NETWORK_DELAY_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getBroadcastsAsync(status?: BroadcastStatus): Promise<NotificationBroadcast[]> {
  await delay(NETWORK_DELAY_MS)
  return listBroadcasts(status)
}

export async function saveBroadcastDraftAsync(
  actor: AuditActor,
  input: BroadcastInput,
  existingId?: string,
): Promise<NotificationBroadcast> {
  await delay(NETWORK_DELAY_MS)
  const broadcast = existingId ? (updateBroadcast(existingId, input) ?? insertBroadcast(input, actor.name)) : insertBroadcast(input, actor.name)
  recordAudit(actor, 'Notificaciones', `Guardó el aviso "${broadcast.title}" (${broadcast.status})`, undefined, broadcast)
  return broadcast
}

export async function sendBroadcastNowAsync(actor: AuditActor, broadcastId: string): Promise<NotificationBroadcast | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findBroadcast(broadcastId)
  const broadcast = markBroadcastSent(broadcastId)
  if (!broadcast) return null

  emitAppEvent('NOTICE_SENT', {
    announcementId: broadcast.id,
    scope: broadcast.audienceType,
    targetName: broadcast.audienceTarget,
    role: broadcast.role,
    authorName: actor.name,
    content: broadcast.content,
  })

  recordAudit(actor, 'Notificaciones', `Envió el aviso "${broadcast.title}"`, before, broadcast)
  return broadcast
}

export async function archiveBroadcastAsync(actor: AuditActor, broadcastId: string): Promise<NotificationBroadcast | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findBroadcast(broadcastId)
  const broadcast = setBroadcastArchived(broadcastId)
  if (broadcast) recordAudit(actor, 'Notificaciones', `Archivó el aviso "${broadcast.title}"`, before, broadcast)
  return broadcast
}

export async function deleteBroadcastAsync(actor: AuditActor, broadcastId: string): Promise<boolean> {
  await delay(NETWORK_DELAY_MS)
  const before = findBroadcast(broadcastId)
  const removed = deleteBroadcast(broadcastId)
  if (removed && before) recordAudit(actor, 'Notificaciones', `Eliminó el aviso "${before.title}"`, before, undefined)
  return removed
}
