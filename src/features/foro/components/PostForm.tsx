import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ForumAttachment, ForumCategory } from '@/types/forum'
import { postSchema, type PostFormInput, type PostFormValues } from '../schemas/post-schema'
import { ForumAttachmentPicker } from './ForumAttachmentPicker'

interface PostFormProps {
  categories: ForumCategory[]
  onSubmit: (values: PostFormValues, attachments: ForumAttachment[]) => Promise<void> | void
}

const FIELD_ERROR = 'text-xs text-destructive'

/** Formulario de creación de publicación del foro (RHF + Zod). */
export function PostForm({ categories, onSubmit }: PostFormProps) {
  const [attachments, setAttachments] = useState<ForumAttachment[]>([])
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PostFormInput, unknown, PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: { title: '', categoryId: '', tags: '', content: '' },
  })

  function handleFormSubmit(values: PostFormValues) {
    return onSubmit(values, attachments)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          placeholder="Escribe un título claro"
          className="h-10"
          aria-invalid={!!errors.title}
          {...register('title')}
        />
        {errors.title ? <p className={FIELD_ERROR}>{errors.title.message}</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="categoryId">Categoría</Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="categoryId"
                  className="h-10 w-full"
                  aria-invalid={!!errors.categoryId}
                >
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId ? <p className={FIELD_ERROR}>{errors.categoryId.message}</p> : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tags">Etiquetas</Label>
          <Input
            id="tags"
            placeholder="Separadas por comas"
            className="h-10"
            {...register('tags')}
          />
          <span className="text-xs text-muted-foreground">Ej: finanzas, reportes</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="content">Contenido</Label>
        <Textarea
          id="content"
          rows={8}
          placeholder="Comparte tu duda, recurso o propuesta…"
          aria-invalid={!!errors.content}
          {...register('content')}
        />
        {errors.content ? <p className={FIELD_ERROR}>{errors.content.message}</p> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Adjuntos (opcional)</Label>
        <ForumAttachmentPicker attachments={attachments} onChange={setAttachments} />
      </div>

      <Button type="submit" className="h-10 w-fit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Publicando…
          </>
        ) : (
          'Publicar'
        )}
      </Button>
    </form>
  )
}
