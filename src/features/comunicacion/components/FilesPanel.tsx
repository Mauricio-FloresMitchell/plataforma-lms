import { useEffect, useState } from 'react'
import { File, FileSpreadsheet, FileText, FileType, Image, Music, Sheet as SheetIcon, Archive as ZipIcon } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getConversationAttachmentsAsync } from '@/services/chat.service'
import { formatDateTime } from '@/utils/date'
import type { Attachment, AttachmentKind } from '@/types/chat'

const KIND_ICON: Record<AttachmentKind, typeof File> = {
  imagen: Image,
  pdf: FileType,
  word: FileText,
  excel: FileSpreadsheet,
  powerpoint: SheetIcon,
  zip: ZipIcon,
  audio: Music,
  otro: File,
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface FilesPanelProps {
  conversationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Panel "Archivos compartidos" (Parte 7): nombre, tipo, autor, fecha, descarga. */
export function FilesPanel({ conversationId, open, onOpenChange }: FilesPanelProps) {
  const { user } = useAuth()
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!open || !user) return
    setIsLoading(true)
    getConversationAttachmentsAsync({ id: user.id, name: user.name, role: user.role }, conversationId)
      .then(setAttachments)
      .finally(() => setIsLoading(false))
  }, [open, user, conversationId])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Archivos compartidos</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-2 overflow-y-auto px-4 pb-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando archivos…</p>
          ) : attachments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no se han compartido archivos en esta conversación.</p>
          ) : (
            attachments.map((attachment) => {
              const Icon = KIND_ICON[attachment.kind]
              return (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  download={attachment.fileName}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm hover:bg-accent"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{attachment.fileName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {attachment.uploadedByName} · {formatDateTime(attachment.createdAt)} · {formatFileSize(attachment.size)}
                    </p>
                  </div>
                </a>
              )
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
