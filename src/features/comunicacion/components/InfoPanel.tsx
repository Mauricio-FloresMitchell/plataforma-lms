import { ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { formatDateTime } from '@/utils/date'
import { CHAT_CONTEXT_LABELS, CONVERSATION_TYPE_LABELS } from '@/types/chat'
import type { ConversationSummary } from '@/types/chat'
import { ROLE_LABELS } from '@/mocks/users'
import { initialsFromName } from '../utils/conversationDisplay'
import { resolveContextRoute } from '../utils/contextRoute'

interface InfoPanelProps {
  conversation: ConversationSummary | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Panel "Información" (Parte 13): tipo, participantes y el contexto de origen si lo tiene. */
export function InfoPanel({ conversation, open, onOpenChange }: InfoPanelProps) {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!conversation || !user) return null

  const contextRoute = conversation.contextType
    ? resolveContextRoute(conversation.contextType, conversation.contextId ?? '', user.role)
    : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Información</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Tipo</p>
            <p className="text-sm text-foreground">{CONVERSATION_TYPE_LABELS[conversation.type]}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground">Creada</p>
            <p className="text-sm text-foreground">{formatDateTime(conversation.createdAt)}</p>
          </div>

          {conversation.contextType ? (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Origen</p>
              <div className="mt-1 flex items-center justify-between gap-2 rounded-lg border border-border p-3">
                <div>
                  <Badge variant="secondary">{CHAT_CONTEXT_LABELS[conversation.contextType]}</Badge>
                  <p className="mt-1 text-sm text-foreground">{conversation.contextLabel}</p>
                </div>
                {contextRoute ? (
                  <Button variant="outline" size="sm" onClick={() => navigate(contextRoute)}>
                    <ExternalLink className="size-3.5" />
                    Ver
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}

          <div>
            <p className="text-xs font-medium text-muted-foreground">Participantes ({conversation.members.length})</p>
            <div className="mt-2 flex flex-col gap-2">
              {conversation.members.map((member) => (
                <div key={member.userId} className="flex items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>{initialsFromName(member.userName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{member.userName}</p>
                    <p className="text-xs text-muted-foreground">{ROLE_LABELS[member.userRole]}</p>
                  </div>
                  {member.role === 'admin' ? (
                    <Badge variant="outline" className="text-[10px]">
                      Creador
                    </Badge>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
