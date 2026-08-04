import { File, FileSpreadsheet, FileText, FileType, Image, Music, Sheet as SheetIcon, Archive as ZipIcon } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { formatDateTime } from '@/utils/date'
import type { AttachmentKind } from '@/types/chat'
import type { LibraryDocument } from '@/types/library'

interface LibraryPreviewSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: LibraryDocument | null
}

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

/** Vista previa de un documento (Sprint 13, Parte 10): metadatos, sin contenido real de archivo en el MVP. */
export function LibraryPreviewSheet({ open, onOpenChange, document }: LibraryPreviewSheetProps) {
  if (!document) return null
  const Icon = KIND_ICON[document.kind]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Vista previa</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center gap-4 px-4 pb-4">
          <div className="flex size-20 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Icon className="size-8" />
          </div>
          <div className="w-full space-y-2 text-sm">
            <p className="text-center font-medium text-foreground">{document.title}</p>
            <p className="text-center text-xs text-muted-foreground">{document.fileName}</p>
            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoría</span>
                <span className="text-foreground">{document.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tamaño</span>
                <span className="text-foreground">{formatFileSize(document.size)}</span>
              </div>
              {document.careerName ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Carrera</span>
                  <span className="text-foreground">{document.careerName}</span>
                </div>
              ) : null}
              {document.subjectName ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Materia</span>
                  <span className="text-foreground">{document.subjectName}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subido por</span>
                <span className="text-foreground">{document.uploadedByName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha</span>
                <span className="text-foreground">{formatDateTime(document.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Versión</span>
                <span className="text-foreground">v{document.version}</span>
              </div>
              {document.publishAt ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Publicación programada</span>
                  <span className="text-foreground">{formatDateTime(document.publishAt)}</span>
                </div>
              ) : null}
              {document.expiresAt ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vence</span>
                  <span className="text-foreground">{formatDateTime(document.expiresAt)}</span>
                </div>
              ) : null}
            </div>
            {document.tags.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-1.5 border-t border-border pt-3">
                {document.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">{tag}</span>
                ))}
              </div>
            ) : null}
            {document.versions.length > 0 ? (
              <div className="border-t border-border pt-3">
                <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Historial de versiones</p>
                <ul className="flex flex-col gap-1">
                  {document.versions.map((entry) => (
                    <li key={entry.version} className="text-xs text-muted-foreground">
                      v{entry.version} · {entry.fileName} · {formatDateTime(entry.uploadedAt)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
