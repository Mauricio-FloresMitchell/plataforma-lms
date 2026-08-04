import { eventBus } from '../EventBus'
import type { Unsubscribe } from '../EventEmitter'

/**
 * Escucha exclusivamente eventos de Chat (Sprint 12). Hoy solo lleva una
 * bitácora en memoria (`getMessagesSentThisSession`); es el punto de
 * extensión natural para reacciones futuras propias del módulo (sonido al
 * llegar un mensaje, actualizar el título de la pestaña, un futuro
 * WebSocket/Server-Sent Events para tiempo real — Parte 16) sin tocar quien
 * emite los eventos (`chat.service.ts`). Desacoplado de `NotificationListener`
 * y `AnalyticsListener`: los tres reaccionan al mismo `MESSAGE_SENT` sin
 * conocerse entre sí.
 */
let messagesSentThisSession = 0
let unsubscribeAll: Unsubscribe | null = null

export function registerChatListener(): Unsubscribe {
  if (unsubscribeAll) return unsubscribeAll

  const subscriptions: Unsubscribe[] = [
    eventBus.subscribe('MESSAGE_SENT', () => {
      messagesSentThisSession += 1
    }),
  ]

  unsubscribeAll = () => {
    subscriptions.forEach((unsubscribe) => unsubscribe())
    unsubscribeAll = null
  }
  return unsubscribeAll
}

export function getMessagesSentThisSession(): number {
  return messagesSentThisSession
}
