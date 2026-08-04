import { Building2, Pin, Users, VolumeX } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { formatRelativeToNow } from '@/utils/date'
import type { ConversationSummary } from '@/types/chat'
import { initialsFromName, resolveConversationTitle } from '../utils/conversationDisplay'

interface ConversationListItemProps {
  conversation: ConversationSummary
  currentUserId: string
  isActive: boolean
  onSelect: () => void
}

/** Fila de una conversación en la lista (Parte 5/13). */
export function ConversationListItem({ conversation, currentUserId, isActive, onSelect }: ConversationListItemProps) {
  const title = resolveConversationTitle(conversation, conversation.members, currentUserId)
  const isGroupLike = conversation.type !== 'individual'
  const hasUnread = conversation.unreadCount > 0

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent',
        isActive && 'bg-accent',
      )}
    >
      <Avatar>
        {isGroupLike ? (
          <AvatarFallback className="bg-primary/10 text-primary">
            {conversation.type === 'institucional' ? <Building2 className="size-4" /> : <Users className="size-4" />}
          </AvatarFallback>
        ) : (
          <AvatarFallback>{initialsFromName(title)}</AvatarFallback>
        )}
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn('truncate text-sm', hasUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground')}>
            {title}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            {conversation.isPinned ? <Pin className="size-3 text-muted-foreground" /> : null}
            {conversation.isMuted ? <VolumeX className="size-3 text-muted-foreground" /> : null}
            {conversation.lastMessage ? (
              <span className="text-[11px] text-muted-foreground">{formatRelativeToNow(conversation.lastMessage.createdAt)}</span>
            ) : null}
          </div>
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="truncate text-xs text-muted-foreground">
            {conversation.lastMessage
              ? conversation.lastMessage.deleted
                ? 'Mensaje eliminado'
                : conversation.lastMessage.content
              : 'Sin mensajes todavía'}
          </span>
          {hasUnread ? (
            <span className="flex h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  )
}
