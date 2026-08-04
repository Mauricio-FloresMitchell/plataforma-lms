import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, TrendingUp } from 'lucide-react'
import { getStudentSubjectsAsync } from '@/services/subject.service'
import type { StudentSubjectListItem } from '@/types/subject'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { Pagination } from '@/components/Pagination'
import { useSearch } from '@/hooks/useSearch'
import { usePagination } from '@/hooks/usePagination'

const searchFields = (subject: StudentSubjectListItem) => [subject.name, subject.code, subject.teacher]

export function StudentSubjectsListPage() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<StudentSubjectListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await getStudentSubjectsAsync()
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
        breadcrumb={[{ label: 'Inicio', to: '/alumno' }, { label: 'Materias' }]}
        title="Mis Materias"
        subtitle={isLoading ? undefined : `${subjects.length} materias inscritas`}
      />

      {isLoading ? (
        <ListSkeleton variant="block" count={5} blockHeight="h-24" />
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Sin materias inscritas"
          description="Cuando tengas materias inscritas aparecerán aquí."
        />
      ) : (
        <>
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por materia, código o profesor…" />

          {filtered.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Sin resultados"
              description="No encontramos materias que coincidan con tu búsqueda."
            />
          ) : (
            <>
              <div className="grid gap-4">
                {pageItems.map((subject) => (
                  <Card
                    key={subject.id}
                    className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/alumno/materias/${subject.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <h3 className="text-lg font-semibold">{subject.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{subject.code}</p>
                        <p className="text-sm text-muted-foreground mb-3">Profesor: {subject.teacher}</p>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Avance del periodo</span>
                            <span>{subject.progress}%</span>
                          </div>
                          <Progress value={subject.progress} className="h-2" />
                        </div>
                      </div>
                      <div className="text-right">
                        <TrendingUp className="w-8 h-8 text-blue-100" />
                      </div>
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
