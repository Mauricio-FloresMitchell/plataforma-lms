import type { Conversation, ConversationMember } from '@/types/chat'

/** Título visible: para individuales, el nombre de la otra persona (no el `title` genérico guardado). */
export function resolveConversationTitle(conversation: Conversation, members: ConversationMember[], currentUserId: string): string {
  if (conversation.type !== 'individual') return conversation.title
  const other = members.find((member) => member.userId !== currentUserId)
  return other?.userName ?? conversation.title
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}
