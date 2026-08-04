import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Megaphone, Paperclip, Plus, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { Pagination } from '@/components/Pagination'
import { useSearch } from '@/hooks/useSearch'
import { usePagination } from '@/hooks/usePagination'
import { getTeacherAnnouncementsAsync } from '@/services/announcement.service'
import type { TeacherAnnouncement } from '@/types/announcement'

const SCOPE_LABELS: Record<TeacherAnnouncement['scope'], string> = {
  alumno: 'Alumno',
  grupo: 'Grupo',
  materia: 'Materia',
}

const searchFields = (announcement: TeacherAnnouncement) => [
  announcement.subjectName,
  announcement.content,
  announcement.targetName ?? '',
]

/** Historial de avisos enviados por el profesor. */
export function AnnouncementsHistoryPage() {
  const location = useLocation()
  const justSent = (location.state as { sent?: boolean } | null)?.sent

  const [announcements, setAnnouncements] = useState<TeacherAnnouncement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getTeacherAnnouncementsAsync()
      .then(setAnnouncements)
      .catch((err) => console.error('Error loading announcements:', err))
      .finally(() => setIsLoading(false))
  }, [])

  const getFields = useCallback(searchFields, [])
  const { query, setQuery, filtered } = useSearch(announcements, getFields)
  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 6)

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/profesor' }, { label: 'Avisos' }]}
        title="Avisos"
        subtitle="Historial de avisos enviados a tus alumnos, grupos y materias."
        actions={
          <Button asChild className="h-10">
            <Link to="/profesor/avisos/nuevo">
              <Plus className="size-4" />
              Nuevo aviso
            </Link>
          </Button>
        }
      />

      {justSent ? (
        <Alert>
          <CheckCircle2 className="size-4" />
          <AlertDescription>Aviso enviado correctamente.</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <ListSkeleton variant="row" count={3} />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Sin avisos enviados"
          description="Cuando envíes un aviso aparecerá aquí."
        />
      ) : (
        <>
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por materia, alumno o contenido…" />

          {filtered.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="Sin resultados"
              description="No encontramos avisos que coincidan con tu búsqueda."
            />
          ) : (
            <>
              <div className="space-y-3">
                {pageItems.map((announcement) => (
                  <Card key={announcement.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{SCOPE_LABELS[announcement.scope]}</Badge>
                          <span className="text-sm font-medium">
                            {announcement.subjectName}
                            {announcement.targetName ? ` • ${announcement.targetName}` : ''}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{announcement.content}</p>
                        {announcement.attachments.length > 0 ? (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                            <Paperclip className="size-3" />
                            {announcement.attachments.length} adjunto
                            {announcement.attachments.length > 1 ? 's' : ''}
                          </span>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {new Date(announcement.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </>
      )}
    </div>
  )
}
