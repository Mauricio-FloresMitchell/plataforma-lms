import { FileText, FileType, FileSpreadsheet, Image, Link as LinkIcon, Presentation, Video, Archive as ZipIcon } from 'lucide-react'
import type { ForumAttachment, ForumAttachmentKind } from '@/types/forum'

const KIND_ICON: Record<ForumAttachmentKind, typeof FileText> = {
  imagen: Image,
  pdf: FileType,
  word: FileText,
  excel: FileSpreadsheet,
  powerpoint: Presentation,
  zip: ZipIcon,
  video: Video,
  enlace: LinkIcon,
}

interface ForumAttachmentListProps {
  attachments: ForumAttachment[]
}

/** Renderiza los adjuntos de una publicación o comentario (Sprint 16, Parte 3). Solo lectura. */
export function ForumAttachmentList({ attachments }: ForumAttachmentListProps) {
  if (attachments.length === 0) return null

  return (
    <ul className="mt-2 flex flex-wrap gap-1.5">
      {attachments.map((attachment) => {
        const Icon = KIND_ICON[attachment.kind]
        const isLink = attachment.kind === 'enlace'
        return (
          <li key={attachment.id}>
            <a
              href={isLink ? attachment.url : '#'}
              target={isLink ? '_blank' : undefined}
              rel={isLink ? 'noopener noreferrer' : undefined}
              className="flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2.5 py-1 text-xs text-foreground hover:bg-muted"
              onClick={(event) => {
                if (!isLink) event.preventDefault()
              }}
            >
              <Icon className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="max-w-48 truncate">{attachment.fileName}</span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}
