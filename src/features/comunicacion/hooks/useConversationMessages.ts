import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { chatSignal } from '@/core/events/chatSignal'
import {
  addReactionAsync,
  editMessageAsync,
  getMessagesAsync,
  markConversationReadAsync,
  removeMessageAsync,
  removeReactionAsync,
  sendMessageAsync,
  shareAttachmentAsync,
  type ShareAttachmentInput,
} from '@/services/chat.service'
import { clearDraft, getDraft, setDraft as persistDraft } from '../utils/drafts'
import type { MessageWithDetails, ReactionEmoji } from '@/types/chat'

/**
 * Mensajes de una conversación en vivo (Sprint 12).
 *
 * Se actualiza cuando `chat.service.ts` emite por `chatSignal` para esta
 * misma conversación (mensaje nuevo/editado/eliminado, reacción). Al abrir
 * una conversación, la marca como leída (`markConversationReadAsync`) y
 * restaura el borrador guardado (mejora "borradores"), si existe.
 */
export function useConversationMessages(conversationId: string | null) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<MessageWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [draft, setDraftState] = useState('')

  const reload = useCallback(() => {
    if (!user || !conversationId) {
      setMessages([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    getMessagesAsync({ id: user.id, name: user.name, role: user.role }, conversationId)
      .then(setMessages)
      .finally(() => setIsLoading(false))
  }, [user, conversationId])

  useEffect(reload, [reload])

  useEffect(() => {
    if (!user || !conversationId) return
    markConversationReadAsync({ id: user.id, name: user.name, role: user.role }, conversationId).catch(() => {})
    setDraftState(getDraft(user.id, conversationId))
  }, [user, conversationId])

  useEffect(() => {
    if (!conversationId) return
    const unsubscribers = [
      chatSignal.subscribe('message-sent', (message) => {
        if (message.conversationId === conversationId) reload()
      }),
      chatSignal.subscribe('message-updated', (message) => {
        if (message.conversationId === conversationId) reload()
      }),
      chatSignal.subscribe('reaction-changed', (payload) => {
        if (payload.conversationId === conversationId) reload()
      }),
    ]
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
  }, [conversationId, reload])

  const setDraft = useCallback(
    (text: string) => {
      setDraftState(text)
      if (user && conversationId) persistDraft(user.id, conversationId, text)
    },
    [user, conversationId],
  )

  const sendMessage = useCallback(
    async (content: string, replyToId?: string) => {
      if (!user || !conversationId || !content.trim()) return
      await sendMessageAsync({ id: user.id, name: user.name, role: user.role }, { conversationId, content: content.trim(), replyToId })
      clearDraft(user.id, conversationId)
      setDraftState('')
    },
    [user, conversationId],
  )

  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      if (!user) return
      await editMessageAsync({ id: user.id, name: user.name, role: user.role }, messageId, content)
    },
    [user],
  )

  const removeMessage = useCallback(
    async (messageId: string) => {
      if (!user) return
      await removeMessageAsync({ id: user.id, name: user.name, role: user.role }, messageId)
    },
    [user],
  )

  const addReaction = useCallback(
    async (messageId: string, emoji: ReactionEmoji) => {
      if (!user) return
      await addReactionAsync({ id: user.id, name: user.name, role: user.role }, messageId, emoji)
    },
    [user],
  )

  const removeReaction = useCallback(
    async (messageId: string, emoji: ReactionEmoji) => {
      if (!user) return
      await removeReactionAsync({ id: user.id, name: user.name, role: user.role }, messageId, emoji)
    },
    [user],
  )

  const shareAttachment = useCallback(
    async (input: Omit<ShareAttachmentInput, 'conversationId'>) => {
      if (!user || !conversationId) return
      await shareAttachmentAsync({ id: user.id, name: user.name, role: user.role }, { ...input, conversationId })
    },
    [user, conversationId],
  )

  return {
    messages,
    isLoading,
    draft,
    setDraft,
    sendMessage,
    editMessage,
    removeMessage,
    addReaction,
    removeReaction,
    shareAttachment,
  }
}
