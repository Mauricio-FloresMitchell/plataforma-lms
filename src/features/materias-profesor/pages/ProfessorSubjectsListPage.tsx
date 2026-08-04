import { useCallback, useEffect, useState } from 'react'
import { BookOpen, ChevronDown, Users } from 'lucide-react'
import { getProfessorSubjectsAsync } from '@/services/subject.service'
import type { ProfessorSubjectListItem } from '@/types/subject'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { Pagination } from '@/components/Pagination'
import { useSearch } from '@/hooks/useSearch'
import { usePagination } from '@/hooks/usePagination'
import { SubjectInlinePanel } from '../components/SubjectInlinePanel'

const searchFields = (subject: ProfessorSubjectListItem) => [
  subject.name,
  subject.code,
  subject.groupName,
]

export function ProfessorSubjectsListPage() {
  const [subjects, setSubjects] = useState<ProfessorSubjectListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await getProfessorSubjectsAsync()
        setSubjects(data)
      } catch (error) {
        console.error('Error loading subjects:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSubjects()
  }, [])

  const getFields = useCallback(searchFields, [])
  const { query, setQuery, filtered } = useSearch(subjects, getFields)
  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 6)

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/profesor' }, { label: 'Materias' }]}
        title="Mis Materias"
        subtitle={isLoading ? undefined : `${subjects.length} materias impartidas`}
      />

      {isLoading ? (
        <ListSkeleton variant="block" count={3} blockHeight="h-24" />
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Sin materias asignadas"
          description="Cuando tengas materias asignadas aparecerán aquí."
        />
      ) : (
        <>
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por materia, código o grupo…" />

          {filtered.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Sin resultados"
              description="No encontramos materias que coincidan con tu búsqueda."
            />
          ) : (
            <>
              <div className="grid gap-4">
                {pageItems.map((subject) => {
                  const isExpanded = expandedId === subject.id
                  return (
                    <Card key={subject.id} className="overflow-hidden p-0 transition-shadow hover:shadow-md">
                      <button
                        type="button"
                        className="flex w-full items-start justify-between gap-4 p-6 text-left"
                        onClick={() => setExpandedId(isExpanded ? null : subject.id)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="w-4 h-4 text-primary" />
                            <h3 className="text-lg font-semibold">{subject.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{subject.code}</p>
                          <p className="text-sm text-muted-foreground">Grupo: {subject.groupName}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right flex flex-col items-end gap-2">
                            <div className="flex items-center gap-1 text-sm">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{subject.studentsCount}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">estudiantes</span>
                          </div>
                          <ChevronDown className={`size-5 shrink-0 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                      {isExpanded ? <SubjectInlinePanel subject={subject} /> : null}
                    </Card>
                  )
                })}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </>
      )}
    </div>
  )
}
