import { useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { ForumAttachment } from '@/types/forum'
import { ForumAttachmentPicker } from './ForumAttachmentPicker'

interface CommentFormProps {
  placeholder?: string
  submitLabel?: string
  autoFocus?: boolean
  onSubmit: (content: string, attachments: ForumAttachment[]) => Promise<void> | void
  onCancel?: () => void
}

const MIN_LENGTH = 3

/** Formulario compacto para crear un comentario o una respuesta. Reutilizado en ambos casos. */
export function CommentForm({
  placeholder = 'Escribe un comentario…',
  submitLabel = 'Comentar',
  autoFocus = false,
  onSubmit,
  onCancel,
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<ForumAttachment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (content.trim().length < MIN_LENGTH) {
      setError('Escribe al menos unas palabras antes de enviar.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit(content.trim(), attachments)
      setContent('')
      setAttachments([])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={placeholder}
        rows={3}
        autoFocus={autoFocus}
        aria-invalid={!!error}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <p className="text-xs text-muted-foreground">Usa @Nombre para mencionar a alguien.</p>
      <ForumAttachmentPicker attachments={attachments} onChange={setAttachments} imagesOnly />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="h-9" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" size="sm" variant="ghost" className="h-9" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  )
}
