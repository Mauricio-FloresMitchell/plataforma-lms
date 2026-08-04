import { useEffect, useRef, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { resolveAttachmentKind } from '@/features/comunicacion/utils/attachmentKind'
import { LIBRARY_CATEGORIES } from '@/types/library'
import type { LibraryDocument, LibraryDocumentInput } from '@/types/library'

interface LibraryFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: LibraryDocument | null
  onSubmit: (input: LibraryDocumentInput) => Promise<void>
}

/** Subir/editar/mover un documento de la Biblioteca (Sprint 13, Parte 10). */
export function LibraryFormSheet({ open, onOpenChange, document, onSubmit }: LibraryFormSheetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [fileName, setFileName] = useState('')
  const [size, setSize] = useState(0)
  const [category, setCategory] = useState<(typeof LIBRARY_CATEGORIES)[number]>('Otro')
  const [careerName, setCareerName] = useState('')
  const [subjectName, setSubjectName] = useState('')
  const [professorName, setProfessorName] = useState('')
  const [tags, setTags] = useState('')
  const [publishAt, setPublishAt] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitle(document?.title ?? '')
    setFileName(document?.fileName ?? '')
    setSize(document?.size ?? 0)
    setCategory(document?.category ?? 'Otro')
    setCareerName(document?.careerName ?? '')
    setSubjectName(document?.subjectName ?? '')
    setProfessorName(document?.professorName ?? '')
    setTags(document?.tags.join(', ') ?? '')
    setPublishAt(document?.publishAt ? document.publishAt.slice(0, 10) : '')
    setExpiresAt(document?.expiresAt ? document.expiresAt.slice(0, 10) : '')
  }, [open, document])

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setSize(file.size)
    if (!title.trim()) setTitle(file.name)
  }

  const isValid = title.trim() && fileName.trim()

  async function handleSubmit() {
    if (!isValid) return
    setIsSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        fileName,
        size,
        kind: resolveAttachmentKind(fileName),
        category,
        careerName: careerName.trim() || undefined,
        subjectName: subjectName.trim() || undefined,
        professorName: professorName.trim() || undefined,
        tags: tags.split(',').map((item) => item.trim()).filter(Boolean),
        publishAt: publishAt ? new Date(publishAt).toISOString() : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{document ? 'Editar documento' : 'Subir documento'}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          {!document ? (
            <div className="flex flex-col gap-1.5">
              <Label>Archivo</Label>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                {fileName || 'Seleccionar archivo…'}
              </Button>
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="library-title">Título</Label>
            <Input id="library-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Categoría</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as typeof category)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIBRARY_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="library-career">Carrera (opcional)</Label>
            <Input id="library-career" value={careerName} onChange={(event) => setCareerName(event.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="library-subject">Materia (opcional)</Label>
            <Input id="library-subject" value={subjectName} onChange={(event) => setSubjectName(event.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="library-professor">Profesor (opcional)</Label>
            <Input id="library-professor" value={professorName} onChange={(event) => setProfessorName(event.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="library-tags">Etiquetas (separadas por coma)</Label>
            <Input id="library-tags" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Ej. reglamento, titulación" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="library-publish">Programar publicación</Label>
              <Input id="library-publish" type="date" value={publishAt} onChange={(event) => setPublishAt(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="library-expire">Programar vencimiento</Label>
              <Input id="library-expire" type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
            </div>
          </div>

          <Button onClick={() => void handleSubmit()} disabled={isSubmitting || !isValid}>
            {isSubmitting ? 'Guardando…' : document ? 'Guardar cambios' : 'Subir documento'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
