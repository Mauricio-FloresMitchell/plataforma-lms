import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Users } from 'lucide-react'
import { getProfessorSubjectsAsync } from '@/services/subject.service'
import type { ProfessorSubjectListItem } from '@/types/subject'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { Pagination } from '@/components/Pagination'
import { useSearch } from '@/hooks/useSearch'
import { usePagination } from '@/hooks/usePagination'

const searchFields = (subject: ProfessorSubjectListItem) => [
  subject.name,
  subject.code,
  subject.groupName,
]

export function ProfessorEvaluationsListPage() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<ProfessorSubjectListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
        breadcrumb={[{ label: 'Inicio', to: '/profesor' }, { label: 'Evaluaciones' }]}
        title="Evaluar Alumnos"
        subtitle="Selecciona una materia para evaluar a los estudiantes"
      />

      {isLoading ? (
        <ListSkeleton variant="block" count={3} blockHeight="h-24" />
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={Award}
          title="Sin materias asignadas"
          description="Cuando tengas materias asignadas aparecerán aquí."
        />
      ) : (
        <>
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por materia, código o grupo…" />

          {filtered.length === 0 ? (
            <EmptyState
              icon={Award}
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
                    onClick={() => navigate(`/profesor/evaluaciones/${subject.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{subject.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{subject.code}</p>
                        <p className="text-sm text-muted-foreground mt-2">Grupo: {subject.groupName}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{subject.studentsCount}</span>
                        </div>
                        <Badge variant="outline">Por evaluar</Badge>
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
