import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MockFileInput } from '@/components/MockFileInput'
import { materialSchema, type MaterialFormInput, type MaterialFormValues } from '../schemas/material-schema'
import { MATERIAL_CATEGORIES } from '@/types/subject'
import type { MaterialType, MockAttachment } from '@/types/subject'

interface MaterialFormProps {
  onSubmit: (values: MaterialFormValues) => Promise<void> | void
}

const FIELD_ERROR = 'text-xs text-destructive'

const TYPE_OPTIONS: { value: MaterialType; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'word', label: 'Word' },
  { value: 'excel', label: 'Excel' },
  { value: 'powerpoint', label: 'PowerPoint' },
  { value: 'imagen', label: 'Imagen' },
  { value: 'video', label: 'Video' },
  { value: 'enlace', label: 'Enlace' },
]

const LINK_TYPES = new Set<MaterialType>(['enlace', 'video'])

export function MaterialForm({ onSubmit }: MaterialFormProps) {
  const [attachment, setAttachment] = useState<MockAttachment | null>(null)

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MaterialFormInput, unknown, MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: { title: '', type: 'pdf', url: '', fileName: '', description: '', category: 'Otro', tags: '', isHidden: false, scheduledAt: '' },
  })

  const type = watch('type')
  const isLink = LINK_TYPES.has(type)

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Título</Label>
        <Input id="title" placeholder="Ej: Introducción a la Estrategia Empresarial" aria-invalid={!!errors.title} {...register('title')} />
        {errors.title ? <p className={FIELD_ERROR}>{errors.title.message}</p> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="type">Tipo</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value)
                setAttachment(null)
                setValue('fileName', '')
                setValue('url', '')
              }}
            >
              <SelectTrigger id="type" className="h-10 w-full" aria-invalid={!!errors.type}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.type ? <p className={FIELD_ERROR}>{errors.type.message}</p> : null}
      </div>

      {isLink ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="url">{type === 'video' ? 'URL del video' : 'URL del enlace'}</Label>
          <Input
            id="url"
            placeholder="https://…"
            aria-invalid={!!errors.url}
            {...register('url')}
          />
          {errors.url ? <p className={FIELD_ERROR}>{errors.url.message}</p> : null}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label>Archivo</Label>
          <MockFileInput
            label="Adjuntar archivo"
            kind="archivo"
            attachments={attachment ? [attachment] : []}
            onAdd={(a) => {
              setAttachment(a)
              setValue('fileName', a.name)
              setValue('url', `/materials/${a.name}`)
            }}
            onRemove={() => {
              setAttachment(null)
              setValue('fileName', '')
              setValue('url', '')
            }}
          />
          {errors.fileName ? <p className={FIELD_ERROR}>{errors.fileName.message}</p> : null}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" placeholder="Describe este recurso…" className="min-h-20" {...register('description')} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Categoría</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="category" className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_CATEGORIES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tags">Etiquetas</Label>
          <Input id="tags" placeholder="Separadas por comas" {...register('tags')} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="scheduledAt">Programar visibilidad (opcional)</Label>
          <Input id="scheduledAt" type="date" {...register('scheduledAt')} />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Controller
            control={control}
            name="isHidden"
            render={({ field }) => <Switch id="isHidden" checked={field.value ?? false} onCheckedChange={field.onChange} />}
          />
          <Label htmlFor="isHidden">Ocultar al alumno</Label>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Guardando…
          </>
        ) : (
          'Agregar material'
        )}
      </Button>
    </form>
  )
}
