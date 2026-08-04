import { useRef, useState } from 'react'
import { FileText, FileType, FileSpreadsheet, Image, Link as LinkIcon, Paperclip, Presentation, Video, X, Archive as ZipIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ForumAttachment, ForumAttachmentKind } from '@/types/forum'
import { resolveForumAttachmentKind } from '../utils/attachmentKind'

const KIND_ICON: Record<ForumAttachmentKind, typeof Paperclip> = {
  imagen: Image,
  pdf: FileType,
  word: FileText,
  excel: FileSpreadsheet,
  powerpoint: Presentation,
  zip: ZipIcon,
  video: Video,
  enlace: LinkIcon,
}

interface ForumAttachmentPickerProps {
  attachments: ForumAttachment[]
  onChange: (attachments: ForumAttachment[]) => void
  /** Comentarios/respuestas solo admiten imágenes (Sprint 16, Parte 3). */
  imagesOnly?: boolean
}

/** Selector de adjuntos del Foro: publicaciones admiten todos los tipos; comentarios, solo imágenes. */
export function ForumAttachmentPicker({ attachments, onChange, imagesOnly = false }: ForumAttachmentPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [linkUrl, setLinkUrl] = useState('')

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      const kind = imagesOnly ? 'imagen' : resolveForumAttachmentKind(file.name)
      onChange([...attachments, { id: `fatt-${Date.now()}`, fileName: file.name, kind, url: '#' }])
    }
    event.target.value = ''
  }

  function addLink() {
    if (!linkUrl.trim()) return
    onChange([...attachments, { id: `fatt-${Date.now()}`, fileName: linkUrl.trim(), kind: 'enlace', url: linkUrl.trim() }])
    setLinkUrl('')
  }

  function remove(id: string) {
    onChange(attachments.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input ref={inputRef} type="file" accept={imagesOnly ? 'image/*' : undefined} className="hidden" onChange={handleFileSelected} />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <Paperclip className="size-3.5" />
          {imagesOnly ? 'Adjuntar imagen' : 'Adjuntar archivo'}
        </Button>

        {!imagesOnly ? (
          <div className="flex items-center gap-1.5">
            <Input
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder="https://…"
              className="h-8 w-48"
            />
            <Button type="button" variant="outline" size="sm" onClick={addLink} disabled={!linkUrl.trim()}>
              <LinkIcon className="size-3.5" />
              Agregar enlace
            </Button>
          </div>
        ) : null}
      </div>

      {attachments.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {attachments.map((attachment) => {
            const Icon = KIND_ICON[attachment.kind]
            return (
              <li
                key={attachment.id}
                className="flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2.5 py-1 text-xs"
              >
                <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="max-w-40 truncate">{attachment.fileName}</span>
                <button
                  type="button"
                  onClick={() => remove(attachment.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label={`Quitar ${attachment.fileName}`}
                >
                  <X className="size-3" />
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
