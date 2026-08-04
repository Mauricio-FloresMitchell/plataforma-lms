import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROLE_LABELS } from '@/mocks/users'
import { AUDIENCE_LABELS } from '@/types/notificationBroadcast'
import type { BroadcastAudienceType, BroadcastInput, NotificationBroadcast } from '@/types/notificationBroadcast'
import type { Role } from '@/types/auth'

interface BroadcastComposerSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  broadcast: NotificationBroadcast | null
  onSubmit: (input: BroadcastInput) => Promise<void>
}

const AUDIENCE_TYPES: BroadcastAudienceType[] = ['todos', 'carrera', 'grupo', 'profesor', 'alumno', 'rol']
const ROLES: Role[] = ['alumno', 'profesor', 'administrador']

/** Composer de difusión de avisos (Sprint 13, Parte 9): audiencia, borrador o programado. */
export function BroadcastComposerSheet({ open, onOpenChange, broadcast, onSubmit }: BroadcastComposerSheetProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [audienceType, setAudienceType] = useState<BroadcastAudienceType>('todos')
  const [audienceTarget, setAudienceTarget] = useState('')
  const [role, setRole] = useState<Role>('alumno')
  const [scheduledFor, setScheduledFor] = useState('')
  const [isSubmitting, setIsSubmitting] = useState<'draft' | 'schedule' | null>(null)

  useEffect(() => {
    if (!open) return
    setTitle(broadcast?.title ?? '')
    setContent(broadcast?.content ?? '')
    setAudienceType(broadcast?.audienceType ?? 'todos')
    setAudienceTarget(broadcast?.audienceTarget ?? '')
    setRole(broadcast?.role ?? 'alumno')
    setScheduledFor(broadcast?.scheduledFor?.slice(0, 16) ?? '')
  }, [open, broadcast])

  const isValid = title.trim() && content.trim() && (audienceType === 'todos' || audienceType === 'rol' || audienceTarget.trim())

  async function handleSave(mode: 'draft' | 'schedule') {
    if (!isValid) return
    setIsSubmitting(mode)
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        audienceType,
        audienceTarget: audienceType === 'todos' || audienceType === 'rol' ? undefined : audienceTarget.trim(),
        role: audienceType === 'rol' ? role : undefined,
        scheduledFor: mode === 'schedule' && scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
      })
      onOpenChange(false)
    } finally {
      setIsSubmitting(null)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{broadcast ? 'Editar aviso' : 'Nuevo aviso'}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="broadcast-title">Título</Label>
            <Input id="broadcast-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="broadcast-content">Contenido</Label>
            <Textarea id="broadcast-content" value={content} onChange={(event) => setContent(event.target.value)} rows={4} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Audiencia</Label>
            <Select value={audienceType} onValueChange={(value) => setAudienceType(value as BroadcastAudienceType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {AUDIENCE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {audienceType === 'rol' ? (
            <div className="flex flex-col gap-1.5">
              <Label>Rol</Label>
              <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {ROLE_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : audienceType !== 'todos' ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="broadcast-target">
                {audienceType === 'carrera' ? 'Carrera' : audienceType === 'grupo' ? 'Grupo' : audienceType === 'profesor' ? 'Profesor' : 'Alumno'}
              </Label>
              <Input id="broadcast-target" value={audienceTarget} onChange={(event) => setAudienceTarget(event.target.value)} />
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="broadcast-schedule">Programar envío (opcional)</Label>
            <Input id="broadcast-schedule" type="datetime-local" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" disabled={!!isSubmitting || !isValid} onClick={() => void handleSave('draft')}>
              {isSubmitting === 'draft' ? 'Guardando…' : 'Guardar borrador'}
            </Button>
            <Button className="flex-1" disabled={!!isSubmitting || !isValid || !scheduledFor} onClick={() => void handleSave('schedule')}>
              {isSubmitting === 'schedule' ? 'Programando…' : 'Programar'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
