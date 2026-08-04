import { createContext } from 'react'
import type { ChatContact, Conversation, ConversationFilter, ConversationSummary, CreateConversationInput } from '@/types/chat'

export interface ChatContextValue {
  conversations: ConversationSummary[]
  filteredConversations: ConversationSummary[]
  isLoading: boolean
  filter: ConversationFilter
  setFilter: (filter: ConversationFilter) => void
  search: string
  setSearch: (search: string) => void
  totalUnreadCount: number
  contacts: ChatContact[]
  reloadConversations: () => void
  createConversation: (input: CreateConversationInput) => Promise<Conversation>
  archiveConversation: (conversationId: string, isArchived: boolean) => Promise<void>
  pinConversation: (conversationId: string, isPinned: boolean) => Promise<void>
  muteConversation: (conversationId: string, isMuted: boolean) => Promise<void>
  closeConversation: (conversationId: string, isClosed: boolean) => Promise<void>
  removeConversation: (conversationId: string) => Promise<void>
}

export const ChatContext = createContext<ChatContextValue | null>(null)
