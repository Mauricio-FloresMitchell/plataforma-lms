import type { BroadcastInput, BroadcastStatus, NotificationBroadcast } from '@/types/notificationBroadcast'

/**
 * Almacén simulado de difusiones de avisos institucionales (Sprint 13,
 * Parte 9). Estado en memoria durante la sesión. No se relaciona con
 * `mocks/notifications.ts` (las notificaciones que recibe cada usuario): una
 * difusión es el mensaje que compone el Administrador antes de enviarlo —
 * al enviarse, dispara `NOTICE_SENT` (Event Bus) y es `NotificationListener`
 * quien crea las notificaciones individuales.
 */

let BROADCASTS: NotificationBroadcast[] = []
let sequence = 100

export function listBroadcasts(status?: BroadcastStatus): NotificationBroadcast[] {
  return (status ? BROADCASTS.filter((item) => item.status === status) : BROADCASTS).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function findBroadcast(broadcastId: string): NotificationBroadcast | null {
  return BROADCASTS.find((item) => item.id === broadcastId) ?? null
}

export function insertBroadcast(input: BroadcastInput, createdByName: string): NotificationBroadcast {
  sequence += 1
  const broadcast: NotificationBroadcast = {
    id: `bcast-${sequence}`,
    title: input.title,
    content: input.content,
    audienceType: input.audienceType,
    audienceTarget: input.audienceTarget,
    role: input.role,
    status: input.scheduledFor ? 'programada' : 'borrador',
    scheduledFor: input.scheduledFor,
    createdByName,
    createdAt: new Date().toISOString(),
  }
  BROADCASTS = [broadcast, ...BROADCASTS]
  return broadcast
}

export function updateBroadcast(broadcastId: string, input: BroadcastInput): NotificationBroadcast | null {
  const broadcast = BROADCASTS.find((item) => item.id === broadcastId)
  if (!broadcast) return null
  broadcast.title = input.title
  broadcast.content = input.content
  broadcast.audienceType = input.audienceType
  broadcast.audienceTarget = input.audienceTarget
  broadcast.role = input.role
  broadcast.scheduledFor = input.scheduledFor
  broadcast.status = input.scheduledFor ? 'programada' : 'borrador'
  return broadcast
}

export function markBroadcastSent(broadcastId: string): NotificationBroadcast | null {
  const broadcast = BROADCASTS.find((item) => item.id === broadcastId)
  if (!broadcast) return null
  broadcast.status = 'enviada'
  broadcast.sentAt = new Date().toISOString()
  return broadcast
}

export function setBroadcastArchived(broadcastId: string): NotificationBroadcast | null {
  const broadcast = BROADCASTS.find((item) => item.id === broadcastId)
  if (!broadcast) return null
  broadcast.status = 'archivada'
  return broadcast
}

export function deleteBroadcast(broadcastId: string): boolean {
  const next = BROADCASTS.filter((item) => item.id !== broadcastId)
  const removed = next.length !== BROADCASTS.length
  BROADCASTS = next
  return removed
}
