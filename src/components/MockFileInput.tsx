import { useRef } from 'react'
import { Paperclip, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MockAttachment } from '@/types/subject'

interface MockFileInputProps {
  label: string
  kind: MockAttachment['kind']
  accept?: string
  attachments: MockAttachment[]
  onAdd: (attachment: MockAttachment) => void
  onRemove: (id: string) => void
}

/**
 * Selector de archivos simulado: usa un `<input type="file">` real para que
 * el profesor elija un archivo de su equipo, pero solo se conserva el
 * nombre — no hay carga ni almacenamiento real (MVP con datos mock).
 */
export function MockFileInput({ label, kind, accept, attachments, onAdd, onRemove }: MockFileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      onAdd({ id: `${kind}-${Date.now()}`, name: file.name, kind })
    }
    event.target.value = ''
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileSelected}
      />
      <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
        <Paperclip className="size-4" />
        {label}
      </Button>

      {attachments.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-1.5 text-sm"
            >
              <span className="flex items-center gap-2 truncate">
                <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{attachment.name}</span>
              </span>
              <button
                type="button"
                onClick={() => onRemove(attachment.id)}
                className="shrink-0 text-muted-foreground hover:text-destructive"
                aria-label={`Quitar ${attachment.name}`}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
