import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Clock, Download, Eye, File, FileSpreadsheet, FileText, FileType, History, Image, MoreVertical, Music, Pencil, Sheet as SheetIcon, Trash2, Archive as ZipIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useSearch } from '@/hooks/useSearch'
import {
  deleteLibraryDocumentAsync,
  getLibraryDocumentsAsync,
  recordLibraryDownloadAsync,
  replaceLibraryDocumentFileAsync,
  updateLibraryDocumentAsync,
  uploadLibraryDocumentAsync,
} from '@/services/library.service'
import { LIBRARY_CATEGORIES, isLibraryDocumentPublished } from '@/types/library'
import type { AttachmentKind } from '@/types/chat'
import type { LibraryDocument, LibraryDocumentInput } from '@/types/library'
import { LibraryFormSheet } from '../components/LibraryFormSheet'
import { LibraryPreviewSheet } from '../components/LibraryPreviewSheet'

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

const searchFields = (doc: LibraryDocument) => [doc.title, doc.fileName, doc.careerName ?? '', doc.subjectName ?? '', doc.professorName ?? '', ...doc.tags]

/** Biblioteca Institucional (Sprint 13, Parte 10). */
export function AdminLibraryPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<LibraryDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState('todas')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<LibraryDocument | null>(null)
  const [previewDocument, setPreviewDocument] = useState<LibraryDocument | null>(null)
  const [versioningDocumentId, setVersioningDocumentId] = useState<string | null>(null)
  const versionInputRef = useRef<HTMLInputElement>(null)

  const actor = user ? { id: user.id, name: user.name, role: user.role } : null

  const reload = useCallback(() => {
    setIsLoading(true)
    getLibraryDocumentsAsync()
      .then(setDocuments)
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(reload, [reload])

  const byCategory = useMemo(
    () => (category === 'todas' ? documents : documents.filter((doc) => doc.category === category)),
    [documents, category],
  )
  const getFields = useCallback(searchFields, [])
  const { query, setQuery, filtered } = useSearch(byCategory, getFields)

  function openUpload() {
    setEditingDocument(null)
    setIsFormOpen(true)
  }

  async function handleSubmit(input: LibraryDocumentInput) {
    if (!actor) return
    if (editingDocument) {
      await updateLibraryDocumentAsync(actor, editingDocument.id, input)
    } else {
      await uploadLibraryDocumentAsync(actor, input)
    }
    reload()
  }

  async function handleDelete(doc: LibraryDocument) {
    if (!actor) return
    if (!window.confirm(`¿Eliminar "${doc.title}"? Esta acción no se puede deshacer.`)) return
    await deleteLibraryDocumentAsync(actor, doc.id)
    reload()
  }

  function handleDownload(doc: LibraryDocument) {
    if (!actor) return
    void recordLibraryDownloadAsync(actor, doc.id)
  }

  function openVersionPicker(doc: LibraryDocument) {
    setVersioningDocumentId(doc.id)
    versionInputRef.current?.click()
  }

  async function handleVersionFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !actor || !versioningDocumentId) return
    await replaceLibraryDocumentFileAsync(actor, versioningDocumentId, file.name, file.size)
    setVersioningDocumentId(null)
    reload()
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Biblioteca' }]}
        title="Biblioteca Institucional"
        subtitle={isLoading ? undefined : `${documents.length} documentos`}
        actions={<Button onClick={openUpload}>Subir documento</Button>}
      />
      <input ref={versionInputRef} type="file" className="hidden" onChange={(event) => void handleVersionFileSelected(event)} />

      {isLoading ? (
        <ListSkeleton variant="row" count={5} />
      ) : documents.length === 0 ? (
        <EmptyState icon={File} title="Sin documentos" description="Sube el primer documento de la biblioteca." />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchInput value={query} onChange={setQuery} placeholder="Buscar por título, carrera, materia o profesor…" />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10 sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {LIBRARY_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={File} title="Sin resultados" description="No encontramos documentos que coincidan con tu búsqueda o filtro." />
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((doc) => {
                const Icon = KIND_ICON[doc.kind]
                return (
                  <Card key={doc.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-medium text-foreground">{doc.title}</p>
                          <Badge variant="outline">{doc.category}</Badge>
                          <Badge variant="outline" className="gap-1"><History className="size-3" />v{doc.version}</Badge>
                          {!isLibraryDocumentPublished(doc) ? (
                            <Badge className="gap-1 bg-amber-100 text-amber-800"><Clock className="size-3" />Programado</Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {[doc.careerName, doc.subjectName, doc.professorName, formatFileSize(doc.size)].filter(Boolean).join(' · ')}
                        </p>
                        {doc.tags.length > 0 ? (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {doc.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="Más opciones">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => {
                              setPreviewDocument(doc)
                              setIsPreviewOpen(true)
                            }}
                          >
                            <Eye className="size-4" />
                            Vista previa
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={doc.url} download={doc.fileName} onClick={() => handleDownload(doc)}>
                              <Download className="size-4" />
                              Descargar
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              setEditingDocument(doc)
                              setIsFormOpen(true)
                            }}
                          >
                            <Pencil className="size-4" />
                            Editar / mover
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openVersionPicker(doc)}>
                            <History className="size-4" />
                            Versionar (subir nuevo archivo)
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => void handleDelete(doc)}>
                            <Trash2 className="size-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      <LibraryFormSheet open={isFormOpen} onOpenChange={setIsFormOpen} document={editingDocument} onSubmit={handleSubmit} />
      <LibraryPreviewSheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen} document={previewDocument} />
    </div>
  )
}
