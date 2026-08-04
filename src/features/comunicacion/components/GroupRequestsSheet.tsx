import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { acceptGroupRequestAsync, getGroupRequestsForProfessorAsync, rejectGroupRequestAsync } from '@/services/chat.service'
import type { GroupConversationRequest } from '@/types/chat'
import { useChat } from '../hooks/useChat'

interface GroupRequestsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_LABEL: Record<GroupConversationRequest['status'], string> = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
}

/**
 * Solicitudes de grupo de conversación recibidas de los alumnos (Sprint 16,
 * Parte 2). Aceptar abre la selección de compañeros del roster de la materia
 * (`contacts`, ya resuelto por `chat.service.ts`) y crea el grupo con el
 * profesor como moderador; Rechazar solo cierra la solicitud.
 */
export function GroupRequestsSheet({ open, onOpenChange }: GroupRequestsSheetProps) {
  const { user } = useAuth()
  const { contacts, reloadConversations } = useChat()
  const navigate = useNavigate()

  const [requests, setRequests] = useState<GroupConversationRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  function reload() {
    if (!user) return
    setIsLoading(true)
    getGroupRequestsForProfessorAsync(user.id)
      .then(setRequests)
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    if (!open) return
    setAcceptingId(null)
    setSelectedIds([])
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user])

  const pending = requests.filter((request) => request.status === 'pendiente')
  const resolved = requests.filter((request) => request.status !== 'pendiente')

  async function handleReject(request: GroupConversationRequest) {
    if (!user) return
    await rejectGroupRequestAsync({ id: user.id, name: user.name, role: user.role }, request.id)
    reload()
  }

  function startAccept(request: GroupConversationRequest) {
    setAcceptingId(request.id)
    setSelectedIds([request.studentId])
  }

  async function confirmAccept(request: GroupConversationRequest) {
    if (!user) return
    setIsSaving(true)
    try {
      const resolvedRequest = await acceptGroupRequestAsync(
        { id: user.id, name: user.name, role: user.role },
        request.id,
        selectedIds.filter((id) => id !== request.studentId),
      )
      reloadConversations()
      reload()
      setAcceptingId(null)
      if (resolvedRequest?.conversationId) {
        onOpenChange(false)
        navigate(`/comunicacion/${resolvedRequest.conversationId}`)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const rosterForAccepting = acceptingId
    ? contacts.filter((contact) => contact.role === 'alumno' && contact.subtitle === requests.find((r) => r.id === acceptingId)?.subjectName)
    : []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Solicitudes de grupo</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando solicitudes…</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tienes solicitudes de grupo todavía.</p>
          ) : (
            <>
              {pending.length === 0 ? <p className="text-sm text-muted-foreground">No hay solicitudes pendientes.</p> : null}
              {pending.map((request) => (
                <div key={request.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{request.studentName}</p>
                      <p className="text-xs text-muted-foreground">{request.subjectName}</p>
                    </div>
                    <Badge variant="secondary">{STATUS_LABEL[request.status]}</Badge>
                  </div>
                  <p className="mt-2 text-sm">{request.reason}</p>

                  {acceptingId === request.id ? (
                    <div className="mt-3 flex flex-col gap-2 rounded-md bg-muted/40 p-3">
                      <p className="text-xs font-medium text-muted-foreground">Elige a los compañeros que formarán el grupo:</p>
                      {rosterForAccepting.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No hay más alumnos de esta materia en tu directorio.</p>
                      ) : (
                        rosterForAccepting.map((contact) => (
                          <label key={contact.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={selectedIds.includes(contact.id)}
                              onCheckedChange={(checked) =>
                                setSelectedIds((prev) => (checked ? [...prev, contact.id] : prev.filter((id) => id !== contact.id)))
                              }
                            />
                            {contact.name}
                          </label>
                        ))
                      )}
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={() => void confirmAccept(request)} disabled={isSaving}>
                          {isSaving ? 'Creando…' : 'Crear grupo'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setAcceptingId(null)} disabled={isSaving}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" onClick={() => startAccept(request)}>
                        <Check className="size-3.5" />
                        Aceptar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => void handleReject(request)}>
                        <X className="size-3.5" />
                        Rechazar
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {resolved.length > 0 ? (
                <div className="flex flex-col gap-2 pt-2">
                  <p className="text-xs font-semibold text-muted-foreground">Resueltas</p>
                  {resolved.map((request) => (
                    <div key={request.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                      <span>
                        {request.studentName} · {request.subjectName}
                      </span>
                      <Badge variant={request.status === 'aceptada' ? 'default' : 'secondary'}>{STATUS_LABEL[request.status]}</Badge>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
