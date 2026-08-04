import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MockFileInput } from '@/components/MockFileInput'
import { activitySchema, type ActivityFormInput, type ActivityFormValues } from '../schemas/activity-schema'
import type { MockAttachment, RubricCriterion } from '@/types/subject'

interface ActivityFormProps {
  defaultValues?: Partial<ActivityFormValues>
  defaultAttachments?: MockAttachment[]
  defaultRubric?: RubricCriterion[]
  onSubmit: (values: ActivityFormValues, attachments: MockAttachment[], rubric: RubricCriterion[]) => Promise<void> | void
  submitLabel?: string
}

const FIELD_ERROR = 'text-xs text-destructive'

/** Adjuntos ampliados (Sprint 17, Parte 2): texto/PDF/Word/Excel/PPT ya cubiertos por "archivo"; se agregan audio/video/links. */
export function ActivityForm({
  defaultValues,
  defaultAttachments = [],
  defaultRubric = [],
  onSubmit,
  submitLabel = 'Guardar actividad',
}: ActivityFormProps) {
  const [attachments, setAttachments] = useState<MockAttachment[]>(defaultAttachments)
  const [rubric, setRubric] = useState<RubricCriterion[]>(defaultRubric)
  const [linkUrl, setLinkUrl] = useState('')

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormInput, unknown, ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      instructions: defaultValues?.instructions ?? '',
      openDate: defaultValues?.openDate ?? '',
      dueDate: defaultValues?.dueDate ?? '',
      status: defaultValues?.status ?? 'pendiente',
      weightPercentage: defaultValues?.weightPercentage,
      isHidden: defaultValues?.isHidden ?? false,
    },
  })

  function handleFormSubmit(values: ActivityFormValues) {
    return onSubmit(values, attachments, rubric)
  }

  function addCriterion() {
    setRubric((prev) => [...prev, { id: `rub-${Date.now()}`, label: '', description: '', weight: 0 }])
  }

  function updateCriterion(id: string, patch: Partial<RubricCriterion>) {
    setRubric((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function removeCriterion(id: string) {
    setRubric((prev) => prev.filter((item) => item.id !== id))
  }

  function addLink() {
    if (!linkUrl.trim()) return
    setAttachments((prev) => [...prev, { id: `enlace-${Date.now()}`, name: linkUrl.trim(), kind: 'enlace' }])
    setLinkUrl('')
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Título</Label>
        <Input id="title" placeholder="Ej: Análisis de casos empresariales" aria-invalid={!!errors.title} {...register('title')} />
        {errors.title ? <p className={FIELD_ERROR}>{errors.title.message}</p> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          placeholder="Describe en qué consiste la actividad…"
          className="min-h-24"
          aria-invalid={!!errors.description}
          {...register('description')}
        />
        {errors.description ? <p className={FIELD_ERROR}>{errors.description.message}</p> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="instructions">Instrucciones completas</Label>
        <Textarea
          id="instructions"
          placeholder="Instrucciones detalladas de entrega…"
          className="min-h-20"
          {...register('instructions')}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="openDate">Fecha de apertura</Label>
          <Input id="openDate" type="date" {...register('openDate')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dueDate">Fecha límite</Label>
          <Input id="dueDate" type="date" aria-invalid={!!errors.dueDate} {...register('dueDate')} />
          {errors.dueDate ? <p className={FIELD_ERROR}>{errors.dueDate.message}</p> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="weightPercentage">Porcentaje de evaluación</Label>
          <Input id="weightPercentage" type="number" min={0} max={100} {...register('weightPercentage')} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">Estado</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status" className="h-10 w-full" aria-invalid={!!errors.status}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="atrasada">Atrasada</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status ? <p className={FIELD_ERROR}>{errors.status.message}</p> : null}
        </div>

        <div className="flex items-center gap-2 pt-6">
          <Controller
            control={control}
            name="isHidden"
            render={({ field }) => <Switch id="isHidden" checked={field.value ?? false} onCheckedChange={field.onChange} />}
          />
          <Label htmlFor="isHidden">Ocultar al alumno (borrador)</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <MockFileInput
          label="Adjuntar archivo"
          kind="archivo"
          attachments={attachments.filter((a) => a.kind === 'archivo')}
          onAdd={(a) => setAttachments((prev) => [...prev, a])}
          onRemove={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
        />
        <MockFileInput
          label="Adjuntar imagen"
          kind="imagen"
          accept="image/*"
          attachments={attachments.filter((a) => a.kind === 'imagen')}
          onAdd={(a) => setAttachments((prev) => [...prev, a])}
          onRemove={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
        />
        <MockFileInput
          label="Adjuntar audio"
          kind="audio"
          accept="audio/*"
          attachments={attachments.filter((a) => a.kind === 'audio')}
          onAdd={(a) => setAttachments((prev) => [...prev, a])}
          onRemove={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
        />
        <MockFileInput
          label="Adjuntar video"
          kind="video"
          accept="video/*"
          attachments={attachments.filter((a) => a.kind === 'video')}
          onAdd={(a) => setAttachments((prev) => [...prev, a])}
          onRemove={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Enlace</Label>
        <div className="flex items-center gap-1.5">
          <Input value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://…" className="h-9" />
          <Button type="button" variant="outline" size="sm" onClick={addLink}>
            Agregar enlace
          </Button>
        </div>
        {attachments.filter((a) => a.kind === 'enlace').length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {attachments
              .filter((a) => a.kind === 'enlace')
              .map((link) => (
                <li key={link.id} className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-1.5 text-sm">
                  <span className="truncate">{link.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== link.id))}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    Quitar
                  </button>
                </li>
              ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>Rúbrica</Label>
          <Button type="button" variant="outline" size="sm" onClick={addCriterion}>
            <Plus className="size-3.5" />
            Agregar criterio
          </Button>
        </div>
        {rubric.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sin criterios de rúbrica todavía.</p>
        ) : (
          rubric.map((criterion) => (
            <div key={criterion.id} className="flex items-center gap-2">
              <Input
                value={criterion.label}
                onChange={(event) => updateCriterion(criterion.id, { label: event.target.value })}
                placeholder="Nombre del criterio"
                className="h-9"
              />
              <Input
                type="number"
                min={0}
                max={100}
                value={criterion.weight}
                onChange={(event) => updateCriterion(criterion.id, { weight: Number(event.target.value) || 0 })}
                placeholder="Peso"
                className="h-9 w-24"
              />
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeCriterion(criterion.id)} aria-label="Quitar criterio">
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Guardando…
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  )
}
