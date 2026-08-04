import { useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2, FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { Pagination } from '@/components/Pagination'
import { ReportListItem } from '@/components/ReportListItem'
import { useSearch } from '@/hooks/useSearch'
import { usePagination } from '@/hooks/usePagination'
import { useStudentReports } from '../hooks/useStudentReports'
import type { WeeklyReport } from '@/types/report'

const searchFields = (report: WeeklyReport) => [report.title, report.subjectName, String(report.week)]

/** Lista de reportes semanales del alumno. */
export function StudentReportsListPage() {
  const { reports, isLoading, error } = useStudentReports()
  const location = useLocation()
  const justCreated = (location.state as { created?: boolean } | null)?.created

  const getFields = useCallback(searchFields, [])
  const { query, setQuery, filtered } = useSearch(reports, getFields)
  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 6)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/alumno' }, { label: 'Reportes' }]}
        title="Reportes semanales"
        subtitle="Consulta y crea tus reportes de avance."
        actions={
          <Button asChild className="h-10">
            <Link to="/alumno/reportes/nuevo">
              <Plus className="size-4" />
              Nuevo reporte
            </Link>
          </Button>
        }
      />

      {justCreated ? (
        <Alert>
          <CheckCircle2 className="size-4" />
          <AlertDescription>Tu reporte se envió correctamente.</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <ListSkeleton variant="row" count={3} />
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aún no tienes reportes"
          description="Crea tu primer reporte semanal para comenzar."
        />
      ) : (
        <>
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por título o materia…" />

          {filtered.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Sin resultados"
              description="No encontramos reportes que coincidan con tu búsqueda."
            />
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {pageItems.map((report) => (
                  <ReportListItem
                    key={report.id}
                    report={report}
                    to={`/alumno/reportes/${report.id}`}
                  />
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
