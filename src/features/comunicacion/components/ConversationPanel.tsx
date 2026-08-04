import { useEffect, useRef, useState } from 'react'
import { Archive, ArchiveRestore, Building2, Info, Lock, MoreVertical, Paperclip, Pin, PinOff, Trash2, Unlock, Users, Volume2, VolumeX } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { MessageWithDetails } from '@/types/chat'
import { useChat } from '../hooks/useChat'
import { useConversationMessages } from '../hooks/useConversationMessages'
import { initialsFromName, resolveConversationTitle } from '../utils/conversationDisplay'
import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'

interface ConversationPanelProps {
  conversationId: string
  onOpenFiles: () => void
  onOpenInfo: () => void
}

/** Panel central del Centro de Comunicación (Parte 13): encabezado, mensajes, compositor. */
export function ConversationPanel({ conversationId, onOpenFiles, onOpenInfo }: ConversationPanelProps) {
  const { user } = useAuth()
  const { conversations, archiveConversation, pinConversation, muteConversation, closeConversation, removeConversation } = useChat()
  const { messages, draft, setDraft, sendMessage, editMessage, removeMessage, addReaction, removeReaction, shareAttachment } =
    useConversationMessages(conversationId)
  const [replyTo, setReplyTo] = useState<MessageWithDetails | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const conversation = conversations.find((item) => item.id === conversationId)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  useEffect(() => {
    setReplyTo(null)
  }, [conversationId])

  if (!user || !conversation) {
    return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Conversación no encontrada.</div>
  }

  const isAdmin = user.role === 'administrador'
  const title = resolveConversationTitle(conversation, conversation.members, user.id)
  const isGroupLike = conversation.type !== 'individual'

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border p-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar>
            {isGroupLike ? (
              <AvatarFallback className="bg-primary/10 text-primary">
                {conversation.type === 'institucional' ? <Building2 className="size-4" /> : <Users className="size-4" />}
              </AvatarFallback>
            ) : (
              <AvatarFallback>{initialsFromName(title)}</AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{title}</p>
            {conversation.contextLabel ? <p className="truncate text-xs text-muted-foreground">{conversation.contextLabel}</p> : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onOpenFiles} aria-label="Archivos compartidos">
            <Paperclip className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onOpenInfo} aria-label="Información de la conversación">
            <Info className="size-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Más opciones">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => void muteConversation(conversation.id, !conversation.isMuted)}>
                {conversation.isMuted ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                {conversation.isMuted ? 'Activar sonido' : 'Silenciar'}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void archiveConversation(conversation.id, !conversation.isArchived)}>
                {conversation.isArchived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
                {conversation.isArchived ? 'Desarchivar' : 'Archivar'}
              </DropdownMenuItem>
              {isAdmin ? (
                <>
                  <DropdownMenuItem onSelect={() => void pinConversation(conversation.id, !conversation.isPinned)}>
                    {conversation.isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                    {conversation.isPinned ? 'Quitar de favoritas' : 'Fijar como favorita'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => void closeConversation(conversation.id, !conversation.isClosed)}>
                    {conversation.isClosed ? <Unlock className="size-4" /> : <Lock className="size-4" />}
                    {conversation.isClosed ? 'Reabrir conversación' : 'Cerrar conversación'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={() => void removeConversation(conversation.id)}>
                    <Trash2 className="size-4" />
                    Eliminar conversación
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-3">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUserId={user.id}
              showSenderName={isGroupLike && messages[index - 1]?.senderId !== message.senderId}
              onReply={setReplyTo}
              onEdit={editMessage}
              onDelete={removeMessage}
              onToggleReaction={(messageId, emoji, alreadyReacted) =>
                void (alreadyReacted ? removeReaction(messageId, emoji) : addReaction(messageId, emoji))
              }
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <MessageComposer
        draft={draft}
        onDraftChange={setDraft}
        onSend={async (content, replyToId) => {
          await sendMessage(content, replyToId)
          setReplyTo(null)
        }}
        onShareAttachment={shareAttachment}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        disabled={conversation.isClosed}
      />
    </div>
  )
}
