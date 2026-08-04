import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getStudentSubjectsAsync } from '@/services/subject.service'
import { requestGroupConversationAsync } from '@/services/chat.service'

interface RequestGroupSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * "Solicitar grupo de conversación" (Sprint 16, Parte 2): el alumno no puede
 * crear grupos directamente — pide uno al profesor de la materia, quien lo
 * acepta o lo rechaza desde `GroupRequestsSheet`.
 */
export function RequestGroupSheet({ open, onOpenChange }: RequestGroupSheetProps) {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([])
  const [subjectId, setSubjectId] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setSubjectId('')
    setReason('')
    setError(null)
    setConfirmation(null)
    getStudentSubjectsAsync().then((list) => setSubjects(list.map((subject) => ({ id: subject.id, name: subject.name }))))
  }, [open])

  async function handleSubmit() {
    if (!user) return
    const subject = subjects.find((item) => item.id === subjectId)
    if (!subject) {
      setError('Selecciona la materia para tu grupo.')
      return
    }
    if (!reason.trim()) {
      setError('Cuéntale a tu profesor con quién quieres formar el grupo y para qué.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await requestGroupConversationAsync(
        { id: user.id, name: user.name, role: user.role },
        { subjectId: subject.id, subjectName: subject.name, reason: reason.trim() },
      )
      setConfirmation('Tu solicitud fue enviada. Tu profesor podrá aceptarla y crear el grupo.')
      setReason('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos enviar tu solicitud.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Solicitar grupo de conversación</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          <p className="text-sm text-muted-foreground">
            ¿Necesitas hablar con tus compañeros? Solicita un grupo a tu profesor: él decide a quién incluir y siempre
            permanece como moderador.
          </p>

          <div className="flex flex-col gap-1.5">
            <Label>Materia</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="w-full">
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="group-reason">Motivo</Label>
            <Textarea
              id="group-reason"
              rows={4}
              placeholder="Ej: Nos gustaría un grupo con el equipo del proyecto final para coordinar entregas."
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>

          {confirmation ? (
            <Alert>
              <AlertDescription>{confirmation}</AlertDescription>
            </Alert>
          ) : null}
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Enviando…' : 'Enviar solicitud'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
