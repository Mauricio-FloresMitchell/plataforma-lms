import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { chatSignal } from '@/core/events/chatSignal'
import {
  archiveConversationAsync,
  closeConversationAsync,
  createConversationAsync,
  getAvailableContactsAsync,
  getConversationsAsync,
  muteConversationAsync,
  pinConversationAsync,
  removeConversationAsync,
} from '@/services/chat.service'
import type { ChatContact, ConversationFilter, ConversationSummary, CreateConversationInput } from '@/types/chat'
import { ChatContext, type ChatContextValue } from './chat-context'

/**
 * Estado global del Centro de Comunicación (Sprint 12, Parte 13).
 *
 * No sondea: se actualiza cuando cambia el usuario en sesión y cuando
 * `chat.service.ts` emite por `chatSignal` (conversación creada/actualizada,
 * mensaje enviado/editado/eliminado) — igual que `NotificationProvider` hace
 * con `notificationSignal`, sin que este Provider conozca ningún evento de
 * negocio del Event Bus.
 */
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [contacts, setContacts] = useState<ChatContact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<ConversationFilter>('todas')
  const [search, setSearch] = useState('')

  const reload = useCallback(() => {
    if (!user) {
      setConversations([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    getConversationsAsync({ id: user.id, name: user.name, role: user.role })
      .then(setConversations)
      .finally(() => setIsLoading(false))
  }, [user])

  useEffect(reload, [reload])

  useEffect(() => {
    if (!user) {
      setContacts([])
      return
    }
    getAvailableContactsAsync({ id: user.id, name: user.name, role: user.role }).then(setContacts)
  }, [user])

  useEffect(() => {
    const unsubscribers = [
      chatSignal.subscribe('conversation-created', reload),
      chatSignal.subscribe('conversation-updated', reload),
      chatSignal.subscribe('message-sent', reload),
      chatSignal.subscribe('message-updated', reload),
    ]
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
  }, [reload])

  const createConversation = useCallback(
    async (input: CreateConversationInput) => {
      if (!user) throw new Error('Debes iniciar sesión para escribir un mensaje.')
      const conversation = await createConversationAsync({ id: user.id, name: user.name, role: user.role }, input)
      reload()
      return conversation
    },
    [user, reload],
  )

  const archiveConversation = useCallback(
    async (conversationId: string, isArchived: boolean) => {
      if (!user) return
      await archiveConversationAsync({ id: user.id, name: user.name, role: user.role }, conversationId, isArchived)
      reload()
    },
    [user, reload],
  )

  const pinConversation = useCallback(
    async (conversationId: string, isPinned: boolean) => {
      if (!user) return
      await pinConversationAsync({ id: user.id, name: user.name, role: user.role }, conversationId, isPinned)
      reload()
    },
    [user, reload],
  )

  const muteConversation = useCallback(
    async (conversationId: string, isMuted: boolean) => {
      if (!user) return
      await muteConversationAsync({ id: user.id, name: user.name, role: user.role }, conversationId, isMuted)
      reload()
    },
    [user, reload],
  )

  const closeConversation = useCallback(
    async (conversationId: string, isClosed: boolean) => {
      if (!user) return
      await closeConversationAsync({ id: user.id, name: user.name, role: user.role }, conversationId, isClosed)
      reload()
    },
    [user, reload],
  )

  const removeConversation = useCallback(
    async (conversationId: string) => {
      if (!user) return
      await removeConversationAsync({ id: user.id, name: user.name, role: user.role }, conversationId)
      reload()
    },
    [user, reload],
  )

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase()
    const base = conversations.filter((conversation) => (filter === 'archivadas' ? conversation.isArchived : !conversation.isArchived))
    return base.filter((conversation) => {
      const matchesFilter =
        filter === 'todas' || filter === 'archivadas'
          ? true
          : filter === 'no_leidas'
            ? conversation.unreadCount > 0
            : conversation.isPinned
      const matchesSearch =
        term === '' ||
        conversation.title.toLowerCase().includes(term) ||
        (conversation.lastMessage?.content.toLowerCase().includes(term) ?? false)
      return matchesFilter && matchesSearch
    })
  }, [conversations, filter, search])

  const totalUnreadCount = useMemo(
    () => conversations.filter((conversation) => !conversation.isArchived).reduce((sum, item) => sum + item.unreadCount, 0),
    [conversations],
  )

  const value = useMemo<ChatContextValue>(
    () => ({
      conversations,
      filteredConversations,
      isLoading,
      filter,
      setFilter,
      search,
      setSearch,
      totalUnreadCount,
      contacts,
      reloadConversations: reload,
      createConversation,
      archiveConversation,
      pinConversation,
      muteConversation,
      closeConversation,
      removeConversation,
    }),
    [
      conversations,
      filteredConversations,
      isLoading,
      filter,
      search,
      totalUnreadCount,
      contacts,
      reload,
      createConversation,
      archiveConversation,
      pinConversation,
      muteConversation,
      closeConversation,
      removeConversation,
    ],
  )

  return <ChatContext value={value}>{children}</ChatContext>
}
