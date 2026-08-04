import { useCallback, useEffect, useMemo, useState } from 'react'
import { Award, History, MoreVertical, Pencil } from 'lucide-react'
import {
  getAdminEvaluationsAsync,
  getEvaluationSummaryAsync,
  updateEvaluationAsAdminAsync,
} from '@/services/evaluation.service'
import type { Competency, EvaluationSummary, FeedbackStatus, StudentEvaluation } from '@/types/evaluation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CompetencyLevelBadge } from '@/components/CompetencyLevelBadge'
import { EvaluationStatusBadge } from '@/components/EvaluationStatusBadge'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { FilterChips } from '@/components/FilterChips'
import { Pagination } from '@/components/Pagination'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useSearch } from '@/hooks/useSearch'
import { usePagination } from '@/hooks/usePagination'
import { EvaluationEditSheet } from '../components/EvaluationEditSheet'
import { EvaluationHistorySheet } from '../components/EvaluationHistorySheet'

const searchFields = (evaluation: StudentEvaluation) => [
  evaluation.studentName,
  evaluation.subjectName,
  evaluation.groupName,
]

const STATUS_OPTIONS = [
  { value: 'publicada', label: 'Publicadas' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'pendiente', label: 'Pendientes' },
]

export function AdminEvaluationsListPage() {
  const { user } = useAuth()
  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>([])
  const [summary, setSummary] = useState<EvaluationSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<string | null>(null)
  const [editingEvaluation, setEditingEvaluation] = useState<StudentEvaluation | null>(null)
  const [historyEvaluation, setHistoryEvaluation] = useState<StudentEvaluation | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const actor = user ? { id: user.id, name: user.name, role: user.role } : null

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [evaluationsData, summaryData] = await Promise.all([
        getAdminEvaluationsAsync(),
        getEvaluationSummaryAsync(),
      ])
      setEvaluations(evaluationsData)
      setSummary(summaryData)
    } catch (error) {
      console.error('Error loading evaluations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleEditSubmit(competencies: Competency[], feedback: string | undefined, newStatus: FeedbackStatus, reason: string) {
    if (!actor || !editingEvaluation) return
    await updateEvaluationAsAdminAsync(actor, editingEvaluation.id, competencies, feedback, newStatus, reason)
    loadData()
  }

  const byStatus = useMemo(
    () => (status ? evaluations.filter((e) => e.status === status) : evaluations),
    [evaluations, status],
  )

  const getFields = useCallback(searchFields, [])
  const { query, setQuery, filtered } = useSearch(byStatus, getFields)
  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 6)

  const completedPercentage = summary
    ? (summary.completedEvaluations / summary.totalEvaluations) * 100
    : 0

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Evaluaciones' }]}
        title="Evaluaciones"
        subtitle="Consulta de todas las evaluaciones del sistema"
      />

      {isLoading ? (
        <ListSkeleton variant="block" count={5} blockHeight="h-20" />
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="text-2xl font-bold">{summary.totalEvaluations}</p>
                <p className="text-xs text-muted-foreground mt-2">evaluaciones</p>
              </Card>

              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Publicadas</p>
                <p className="text-2xl font-bold">{summary.completedEvaluations}</p>
                <Progress value={completedPercentage} className="mt-2 h-2" />
              </Card>

              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Borrador</p>
                <p className="text-2xl font-bold">{summary.draftEvaluations}</p>
                <p className="text-xs text-muted-foreground mt-2">sin publicar</p>
              </Card>

              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Pendientes</p>
                <p className="text-2xl font-bold">{summary.pendingEvaluations}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {((summary.pendingEvaluations / summary.totalEvaluations) * 100).toFixed(0)}%
                </p>
              </Card>

              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Nivel Promedio</p>
                <div className="mt-2">
                  <CompetencyLevelBadge level={summary.averageCompetencyLevel} />
                </div>
              </Card>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Listado de Evaluaciones</h2>

            {evaluations.length === 0 ? (
              <EmptyState
                icon={Award}
                title="Sin evaluaciones"
                description="Cuando se registren evaluaciones aparecerán aquí."
              />
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  <SearchInput
                    value={query}
                    onChange={setQuery}
                    placeholder="Buscar por alumno, materia o grupo…"
                  />
                  <FilterChips options={STATUS_OPTIONS} value={status} onChange={setStatus} />
                </div>

                {filtered.length === 0 ? (
                  <EmptyState
                    icon={Award}
                    title="Sin resultados"
                    description="No encontramos evaluaciones que coincidan con tu búsqueda o filtro."
                  />
                ) : (
                  <>
                    <div className="space-y-3">
                      {pageItems.map((evaluation) => (
                        <Card key={evaluation.id} className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{evaluation.studentName}</h3>
                                <EvaluationStatusBadge status={evaluation.status} />
                              </div>

                              <p className="text-sm text-muted-foreground mt-1">
                                {evaluation.subjectName} • {evaluation.groupName}
                              </p>

                              {evaluation.status !== 'pendiente' && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {evaluation.competencies.slice(0, 3).map((comp) => (
                                    <CompetencyLevelBadge
                                      key={comp.id}
                                      level={comp.currentLevel}
                                      percentage={comp.percentage}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {evaluation.status !== 'pendiente' && (
                                <p className="text-xs text-muted-foreground">
                                  {new Date(evaluation.evaluatedAt).toLocaleDateString('es-ES')}
                                </p>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon-sm" aria-label="Más opciones">
                                    <MoreVertical className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onSelect={() => {
                                      setEditingEvaluation(evaluation)
                                      setIsEditOpen(true)
                                    }}
                                  >
                                    <Pencil className="size-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() => {
                                      setHistoryEvaluation(evaluation)
                                      setIsHistoryOpen(true)
                                    }}
                                  >
                                    <History className="size-4" />
                                    Ver historial
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
        </>
      )}

      <EvaluationEditSheet open={isEditOpen} onOpenChange={setIsEditOpen} evaluation={editingEvaluation} onSubmit={handleEditSubmit} />
      <EvaluationHistorySheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen} evaluation={historyEvaluation} />
    </div>
  )
}
