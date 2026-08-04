import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award } from 'lucide-react'
import { getStudentEvaluationsAsync } from '@/services/evaluation.service'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { StudentEvaluation } from '@/types/evaluation'
import { Card } from '@/components/ui/card'
import { CompetencyLevelBadge } from '@/components/CompetencyLevelBadge'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { Pagination } from '@/components/Pagination'
import { useSearch } from '@/hooks/useSearch'
import { usePagination } from '@/hooks/usePagination'

const searchFields = (evaluation: StudentEvaluation) => [evaluation.subjectName, evaluation.groupName]

export function StudentEvaluationsListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadEvaluations = async () => {
      if (!user) return

      try {
        const data = await getStudentEvaluationsAsync(user.id)
        setEvaluations(data)
      } catch (error) {
        console.error('Error loading evaluations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadEvaluations()
  }, [user])

  const getFields = useCallback(searchFields, [])
  const { query, setQuery, filtered } = useSearch(evaluations, getFields)
  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 6)

  const evaluatedCount = evaluations.filter((e) => e.status === 'publicada').length
  const pendingCount = evaluations.filter((e) => e.status !== 'publicada').length

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/alumno' }, { label: 'Evaluaciones' }]}
        title="Mis Evaluaciones"
        subtitle={
          isLoading
            ? undefined
            : `${evaluations.length} evaluaciones • ${evaluatedCount} completadas • ${pendingCount} pendientes`
        }
      />

      {isLoading ? (
        <ListSkeleton variant="block" count={3} blockHeight="h-24" />
      ) : evaluations.length === 0 ? (
        <EmptyState
          icon={Award}
          title="Sin evaluaciones"
          description="Cuando tengas evaluaciones registradas aparecerán aquí."
        />
      ) : (
        <>
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por materia o grupo…" />

          {filtered.length === 0 ? (
            <EmptyState
              icon={Award}
              title="Sin resultados"
              description="No encontramos evaluaciones que coincidan con tu búsqueda."
            />
          ) : (
            <>
              <div className="space-y-4">
                {pageItems.map((evaluation) => (
                  <Card
                    key={evaluation.id}
                    className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/alumno/evaluaciones/${evaluation.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{evaluation.subjectName}</h3>
                          <Badge variant={evaluation.status === 'publicada' ? 'default' : 'secondary'}>
                            {evaluation.status === 'publicada' ? 'Evaluada' : 'Pendiente'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mt-3">
                          <div>
                            <p className="text-xs">Código</p>
                            <p className="font-medium text-foreground">{evaluation.subjectName}</p>
                          </div>
                          <div>
                            <p className="text-xs">Grupo</p>
                            <p className="font-medium text-foreground">{evaluation.groupName}</p>
                          </div>
                        </div>

                        {evaluation.status === 'publicada' && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs text-muted-foreground mb-2">Competencias</p>
                            <div className="flex flex-wrap gap-2">
                              {evaluation.competencies.slice(0, 3).map((comp) => (
                                <CompetencyLevelBadge key={comp.id} level={comp.currentLevel} showLabel={false} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {evaluation.status === 'publicada' && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Evaluado</p>
                          <p className="text-sm font-medium">
                            {new Date(evaluation.evaluatedAt).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      )}
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
