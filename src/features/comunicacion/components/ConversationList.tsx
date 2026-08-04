import { useEffect, useState } from 'react'
import { MessageSquarePlus, UsersRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/SearchInput'
import { FilterChips, type FilterChipOption } from '@/components/FilterChips'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getGroupRequestsForProfessorAsync } from '@/services/chat.service'
import type { ConversationFilter } from '@/types/chat'
import { useChat } from '../hooks/useChat'
import { ConversationListItem } from './ConversationListItem'
import { NewConversationPanel } from './NewConversationPanel'
import { RequestGroupSheet } from './RequestGroupSheet'
import { GroupRequestsSheet } from './GroupRequestsSheet'

const FILTER_OPTIONS: FilterChipOption[] = [
  { value: 'no_leidas', label: 'No leídas' },
  { value: 'favoritas', label: 'Favoritas' },
  { value: 'archivadas', label: 'Archivadas' },
]

interface ConversationListProps {
  activeConversationId: string | null
  onSelect: (conversationId: string) => void
}

/** Panel izquierdo del Centro de Comunicación (Parte 13): lista, buscador, filtros. */
export function ConversationList({ activeConversationId, onSelect }: ConversationListProps) {
  const { user } = useAuth()
  const { filteredConversations, isLoading, filter, setFilter, search, setSearch } = useChat()
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)
  const [isRequestGroupOpen, setIsRequestGroupOpen] = useState(false)
  const [isGroupRequestsOpen, setIsGroupRequestsOpen] = useState(false)
  const [pendingGroupRequests, setPendingGroupRequests] = useState(0)

  useEffect(() => {
    if (!user || user.role !== 'profesor') return
    getGroupRequestsForProfessorAsync(user.id).then((requests) =>
      setPendingGroupRequests(requests.filter((request) => request.status === 'pendiente').length),
    )
  }, [user, isGroupRequestsOpen])

  if (!user) return null

  return (
    <div className="flex h-full flex-col border-r border-border">
      <div className="flex items-center justify-between gap-2 border-b border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Comunicación</h2>
        <div className="flex items-center gap-2">
          {user.role === 'alumno' ? (
            <Button size="sm" variant="outline" onClick={() => setIsRequestGroupOpen(true)}>
              <UsersRound className="size-4" />
              Solicitar grupo
            </Button>
          ) : null}
          {user.role === 'profesor' ? (
            <Button size="sm" variant="outline" onClick={() => setIsGroupRequestsOpen(true)}>
              <UsersRound className="size-4" />
              Solicitudes
              {pendingGroupRequests > 0 ? <Badge className="ml-1">{pendingGroupRequests}</Badge> : null}
            </Button>
          ) : null}
          <Button size="sm" onClick={() => setIsNewConversationOpen(true)}>
            <MessageSquarePlus className="size-4" />
            Nuevo mensaje
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-border p-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar conversaciones…" />
        <FilterChips
          options={FILTER_OPTIONS}
          value={filter === 'todas' ? null : filter}
          onChange={(value) => setFilter((value as ConversationFilter | null) ?? 'todas')}
          allLabel="Todas"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <p className="p-3 text-sm text-muted-foreground">Cargando conversaciones…</p>
        ) : filteredConversations.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">No tienes conversaciones aquí todavía.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {filteredConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                currentUserId={user.id}
                isActive={conversation.id === activeConversationId}
                onSelect={() => onSelect(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>

      <NewConversationPanel open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen} />
      <RequestGroupSheet open={isRequestGroupOpen} onOpenChange={setIsRequestGroupOpen} />
      <GroupRequestsSheet open={isGroupRequestsOpen} onOpenChange={setIsGroupRequestsOpen} />
    </div>
  )
}
