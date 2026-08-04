import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getMessageableSubjectsAsync } from '@/services/chat.service'
import { useChat } from '../hooks/useChat'

interface NewConversationPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type CreationMode = 'individual' | 'materia' | 'grupo_privado' | 'institucional'

/** "Nuevo mensaje" (Parte 2/14): resuelve destinatarios válidos por rol antes de crear la conversación. */
export function NewConversationPanel({ open, onOpenChange }: NewConversationPanelProps) {
  const { user } = useAuth()
  const { contacts, createConversation } = useChat()
  const navigate = useNavigate()

  const [mode, setMode] = useState<CreationMode>('individual')
  const [contactId, setContactId] = useState('')
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([])
  const [subjectId, setSubjectId] = useState('')
  const [groupTitle, setGroupTitle] = useState('')
  const [groupMemberIds, setGroupMemberIds] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setMode('individual')
    setContactId('')
    setSubjectId('')
    setGroupTitle('')
    setGroupMemberIds([])
    setMessage('')
    setError(null)
  }, [open])

  useEffect(() => {
    if (!open || !user || user.role !== 'profesor') return
    getMessageableSubjectsAsync({ id: user.id, name: user.name, role: user.role }).then((list) =>
      setSubjects(list.map((subject) => ({ id: subject.id, name: subject.name }))),
    )
  }, [open, user])

  if (!user) return null

  async function handleSubmit() {
    if (!user) return
    setError(null)
    if (!message.trim()) {
      setError('Escribe un mensaje para iniciar la conversación.')
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'materia') {
        const subject = subjects.find((item) => item.id === subjectId)
        if (!subject) {
          setError('Selecciona una materia.')
          return
        }
        const participantIds = contacts.filter((contact) => contact.subtitle === subject.name).map((contact) => contact.id)
        const conversation = await createConversation({
          type: 'materia',
          title: subject.name,
          participantIds,
          firstMessage: message,
        })
        onOpenChange(false)
        navigate(`/comunicacion/${conversation.id}`)
        return
      }

      if (mode === 'grupo_privado') {
        if (!groupTitle.trim()) {
          setError('Escribe un nombre para el grupo.')
          return
        }
        if (groupMemberIds.length === 0) {
          setError('Selecciona al menos un alumno para el grupo.')
          return
        }
        const conversation = await createConversation({
          type: 'grupal',
          title: groupTitle.trim(),
          participantIds: groupMemberIds,
          firstMessage: message,
        })
        onOpenChange(false)
        navigate(`/comunicacion/${conversation.id}`)
        return
      }

      if (mode === 'institucional') {
        const conversation = await createConversation({
          type: 'institucional',
          title: 'Comunicado institucional',
          participantIds: contacts.map((contact) => contact.id),
          firstMessage: message,
        })
        onOpenChange(false)
        navigate(`/comunicacion/${conversation.id}`)
        return
      }

      const contact = contacts.find((item) => item.id === contactId)
      if (!contact) {
        setError('Selecciona un destinatario.')
        return
      }
      const conversation = await createConversation({
        type: 'individual',
        title: contact.name,
        participantIds: [contact.id],
        firstMessage: message,
      })
      onOpenChange(false)
      navigate(`/comunicacion/${conversation.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos iniciar la conversación.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const individualContacts = mode === 'individual' ? contacts : []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Nuevo mensaje</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          {user.role !== 'alumno' ? (
            <div className="flex flex-col gap-1.5">
              <Label>Tipo de conversación</Label>
              <Select value={mode} onValueChange={(value) => setMode(value as CreationMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  {user.role === 'profesor' ? <SelectItem value="materia">Materia completa</SelectItem> : null}
                  {user.role === 'profesor' ? <SelectItem value="grupo_privado">Grupo privado</SelectItem> : null}
                  {user.role === 'administrador' ? <SelectItem value="institucional">Institucional (todos)</SelectItem> : null}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {mode === 'individual' ? (
            <div className="flex flex-col gap-1.5">
              <Label>Destinatario</Label>
              <Select value={contactId} onValueChange={setContactId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona a quién escribir" />
                </SelectTrigger>
                <SelectContent>
                  {individualContacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                      {contact.subtitle ? ` — ${contact.subtitle}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {mode === 'materia' ? (
            <div className="flex flex-col gap-1.5">
              <Label>Materia</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una materia" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {mode === 'grupo_privado' ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="group-title">Nombre del grupo</Label>
                <Input id="group-title" value={groupTitle} onChange={(event) => setGroupTitle(event.target.value)} placeholder="Ej: Equipo proyecto final" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Alumnos (permaneces como moderador)</Label>
                <div className="flex max-h-48 flex-col gap-2 overflow-y-auto rounded-md border border-border p-2">
                  {contacts.filter((contact) => contact.role === 'alumno').length === 0 ? (
                    <p className="text-xs text-muted-foreground">No tienes alumnos en tu directorio todavía.</p>
                  ) : (
                    contacts
                      .filter((contact) => contact.role === 'alumno')
                      .map((contact) => (
                        <label key={contact.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={groupMemberIds.includes(contact.id)}
                            onCheckedChange={(checked) =>
                              setGroupMemberIds((prev) => (checked ? [...prev, contact.id] : prev.filter((id) => id !== contact.id)))
                            }
                          />
                          {contact.name}
                          {contact.subtitle ? ` — ${contact.subtitle}` : ''}
                        </label>
                      ))
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label>Mensaje</Label>
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Escribe tu mensaje…"
              rows={4}
            />
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Enviando…' : 'Iniciar conversación'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
