import { useRef, useState } from 'react'
import { Paperclip, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { TitulacionFile, TitulacionFileKind } from '@/types/titulacion'

const FILE_KIND_OPTIONS: { value: TitulacionFileKind; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'word', label: 'Word' },
  { value: 'excel', label: 'Excel' },
  { value: 'powerpoint', label: 'PowerPoint' },
  { value: 'zip', label: 'ZIP' },
  { value: 'imagen', label: 'Imagen' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'enlace', label: 'Enlace' },
]

interface TitulacionFileUploaderProps {
  files: TitulacionFile[]
  uploader: { id: string; name: string }
  onChange: (files: TitulacionFile[]) => void
  onDownload?: (fileId: string) => void
}

/**
 * Selector de archivos del Producto de Titulación (Sprint 18, Parte 10): 9
 * tipos admitidos, versionado por nombre — un archivo con el mismo nombre
 * nunca sobrescribe al anterior, agrega una nueva versión.
 */
export function TitulacionFileUploader({ files, uploader, onChange, onDownload }: TitulacionFileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [kind, setKind] = useState<TitulacionFileKind>('pdf')

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      const previousVersions = files.filter((item) => item.name === file.name)
      const version = previousVersions.length > 0 ? Math.max(...previousVersions.map((item) => item.version)) + 1 : 1
      const newFile: TitulacionFile = {
        id: `tf-${Date.now()}`,
        name: file.name,
        kind,
        version,
        uploadedById: uploader.id,
        uploadedByName: uploader.name,
        uploadedAt: new Date().toISOString(),
        url: '#',
      }
      onChange([...files, newFile])
    }
    event.target.value = ''
  }

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" className="hidden" onChange={handleFileSelected} />
      <div className="flex flex-wrap items-center gap-2">
        <Select value={kind} onValueChange={(value) => setKind(value as TitulacionFileKind)}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILE_KIND_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <Paperclip className="size-4" />
          Adjuntar archivo
        </Button>
      </div>

      {files.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {files.map((file) => (
            <li key={file.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-1.5 text-sm">
              <button
                type="button"
                onClick={() => onDownload?.(file.id)}
                className="flex min-w-0 items-center gap-2 truncate text-left hover:underline"
              >
                <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">v{file.version} · {file.kind}</span>
              </button>
              <button
                type="button"
                onClick={() => onChange(files.filter((item) => item.id !== file.id))}
                className="shrink-0 text-muted-foreground hover:text-destructive"
                aria-label={`Quitar ${file.name}`}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
