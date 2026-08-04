import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Clock,
  Download,
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  FileType,
  Image,
  Library,
  Play,
  Presentation,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { useSearch } from '@/hooks/useSearch'
import { getLibraryDocumentsAsync } from '@/services/library.service'
import { isLibraryDocumentPublished, LIBRARY_CATEGORIES } from '@/types/library'
import type { AttachmentKind } from '@/types/chat'
import type { LibraryDocument } from '@/types/library'
import { LibraryPreviewSheet } from '@/features/biblioteca-admin/components/LibraryPreviewSheet'

const KIND_ICON: Record<AttachmentKind, typeof File> = {
  imagen: Image,
  pdf: FileType,
  word: FileText,
  excel: FileSpreadsheet,
  powerpoint: Presentation,
  zip: File,
  audio: File,
  otro: File,
}

const searchFields = (doc: LibraryDocument) => [doc.title, doc.fileName, doc.careerName ?? '', doc.subjectName ?? '', doc.professorName ?? '']

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface LibraryReadOnlyViewProps {
  homeTo: string
}

/**
 * Biblioteca / Recursos de solo lectura (Sprint 16, Parte 6/7 — Alumno;
 * Sprint 17, Parte 13 — Profesor): acceso de solo lectura a
 * `library.service.ts` (Biblioteca Institucional, Sprint 13). No hay
 * subir/editar/eliminar — solo buscar, filtrar, descargar y vista previa.
 * "Clases grabadas" se muestra con tarjetas propias (materia, profesor,
 * fecha, duración, reproducir).
 */
export function LibraryReadOnlyView({ homeTo }: LibraryReadOnlyViewProps) {
  const [documents, setDocuments] = useState<LibraryDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState('todas')
  const [previewDocument, setPreviewDocument] = useState<LibraryDocument | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const load = useCallback(() => {
    setIsLoading(true)
    getLibraryDocumentsAsync()
      .then((data) => setDocuments(data.filter((doc) => isLibraryDocumentPublished(doc))))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(load, [load])

  const byCategory = useMemo(
    () => (category === 'todas' ? documents : documents.filter((doc) => doc.category === category)),
    [documents, category],
  )
  const getFields = useCallback(searchFields, [])
  const { query, setQuery, filtered } = useSearch(byCategory, getFields)

  const recordings = filtered.filter((doc) => doc.category === 'Clases grabadas')
  const otherDocuments = filtered.filter((doc) => doc.category !== 'Clases grabadas')

  function openPreview(doc: LibraryDocument) {
    setPreviewDocument(doc)
    setIsPreviewOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: homeTo }, { label: 'Biblioteca / Recursos' }]}
        title="Biblioteca / Recursos"
        subtitle={isLoading ? undefined : `${documents.length} recursos disponibles · solo lectura`}
      />

      {isLoading ? (
        <ListSkeleton variant="row" count={5} />
      ) : documents.length === 0 ? (
        <EmptyState icon={Library} title="Sin recursos" description="Todavía no hay documentos disponibles en la biblioteca." />
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
            <EmptyState icon={File} title="Sin resultados" description="No encontramos recursos que coincidan con tu búsqueda o filtro." />
          ) : (
            <>
              {recordings.length > 0 ? (
                <div>
                  <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Clases grabadas</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {recordings.map((doc) => (
                      <Card key={doc.id} className="p-5">
                        <h3 className="text-sm font-semibold">{doc.title}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {doc.subjectName ? <span>{doc.subjectName}</span> : null}
                          {doc.professorName ? <span>{doc.professorName}</span> : null}
                          <span className="flex items-center gap-1">
                            <CalendarDays className="size-3.5" />
                            {formatDate(doc.createdAt)}
                          </span>
                          {doc.durationMinutes ? (
                            <span className="flex items-center gap-1">
                              <Clock className="size-3.5" />
                              {doc.durationMinutes} min
                            </span>
                          ) : null}
                        </div>
                        <Button size="sm" className="mt-4" onClick={() => openPreview(doc)}>
                          <Play className="size-3.5" />
                          Reproducir
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}

              {otherDocuments.length > 0 ? (
                <div>
                  {recordings.length > 0 ? <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Documentos</h2> : null}
                  <div className="flex flex-col gap-2">
                    {otherDocuments.map((doc) => {
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
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {[doc.careerName, doc.subjectName, doc.professorName].filter(Boolean).join(' · ')}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              <Button variant="ghost" size="icon-sm" aria-label="Vista previa" onClick={() => openPreview(doc)}>
                                <Eye className="size-4" />
                              </Button>
                              <Button variant="ghost" size="icon-sm" aria-label={`Descargar ${doc.title}`} asChild>
                                <a href={doc.url} download={doc.fileName}>
                                  <Download className="size-4" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </>
      )}

      <LibraryPreviewSheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen} document={previewDocument} />
    </div>
  )
}
