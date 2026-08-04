import { EventEmitter } from './EventEmitter'
import type { Conversation, Message } from '@/types/chat'

/**
 * Canal de refresco de UI del Chat (Sprint 12) — mismo criterio que
 * `notificationSignal` del Sprint Event Bus: separado de `AppEventMap` a
 * propósito. `chat.service.ts` emite aquí después de cada mutación exitosa
 * únicamente para que `ChatProvider`/`useConversationMessages` sepan que
 * deben releer datos, sin que conozcan ningún evento de negocio ni viceversa.
 */
interface ChatSignalMap {
  'conversation-created': Conversation
  'conversation-updated': Conversation
  'message-sent': Message
  'message-updated': Message
  'reaction-changed': { messageId: string; conversationId: string }
}

export const chatSignal = new EventEmitter<ChatSignalMap>()
