import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MessagesSquare } from 'lucide-react'
import { useChat } from '../hooks/useChat'
import { ConversationList } from '../components/ConversationList'
import { ConversationPanel } from '../components/ConversationPanel'
import { FilesPanel } from '../components/FilesPanel'
import { InfoPanel } from '../components/InfoPanel'

type RightPanel = 'files' | 'info' | null

/** Página del Centro de Comunicación (Parte 13): lista + conversación + paneles laterales. */
export function ComunicacionPage() {
  const { conversationId } = useParams<{ conversationId?: string }>()
  const navigate = useNavigate()
  const { conversations } = useChat()
  const [rightPanel, setRightPanel] = useState<RightPanel>(null)

  const activeConversation = conversationId ? conversations.find((item) => item.id === conversationId) ?? null : null

  return (
    <div className="flex h-[75vh] min-h-[520px] overflow-hidden rounded-xl border border-border bg-card">
      <div className="w-80 shrink-0">
        <ConversationList
          activeConversationId={conversationId ?? null}
          onSelect={(id) => navigate(`/comunicacion/${id}`)}
        />
      </div>

      <div className="min-w-0 flex-1">
        {conversationId ? (
          <ConversationPanel
            conversationId={conversationId}
            onOpenFiles={() => setRightPanel('files')}
            onOpenInfo={() => setRightPanel('info')}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <MessagesSquare className="size-10" />
            <p className="text-sm">Selecciona una conversación o inicia una nueva.</p>
          </div>
        )}
      </div>

      {conversationId ? (
        <>
          <FilesPanel conversationId={conversationId} open={rightPanel === 'files'} onOpenChange={(open) => setRightPanel(open ? 'files' : null)} />
          <InfoPanel conversation={activeConversation} open={rightPanel === 'info'} onOpenChange={(open) => setRightPanel(open ? 'info' : null)} />
        </>
      ) : null}
    </div>
  )
}
