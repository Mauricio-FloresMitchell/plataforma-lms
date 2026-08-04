import { useCallback } from 'react'
import { ClipboardCheck } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { Pagination } from '@/components/Pagination'
import { ReportListItem } from '@/components/ReportListItem'
import { useSearch } from '@/hooks/useSearch'
import { usePagination } from '@/hooks/usePagination'
import { useProfessorReports } from '../hooks/useProfessorReports'
import type { WeeklyReport } from '@/types/report'

const searchFields = (report: WeeklyReport) => [
  report.studentName,
  report.title,
  report.subjectName,
  String(report.week),
]

/** Lista de reportes pendientes de revisión para el profesor. */
export function ProfessorReportsListPage() {
  const { reports, isLoading, error } = useProfessorReports()

  const getFields = useCallback(searchFields, [])
  const { query, setQuery, filtered } = useSearch(reports, getFields)
  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 6)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/profesor' }, { label: 'Reportes' }]}
        title="Reportes pendientes"
        subtitle="Revisa y evalúa los reportes enviados por tus alumnos."
      />

      {isLoading ? (
        <ListSkeleton variant="row" count={3} />
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Sin reportes pendientes"
          description="No tienes reportes por revisar por ahora."
        />
      ) : (
        <>
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por alumno, título o materia…" />

          {filtered.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
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
                    to={`/profesor/reportes/${report.id}`}
                    showStudent
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
