import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, FileText, MoreVertical, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { FilterChips } from '@/components/FilterChips'
import { Pagination } from '@/components/Pagination'
import { formatDateTime } from '@/utils/date'
import { downloadCsv, downloadPrintableHtml } from '@/utils/export'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useSearch } from '@/hooks/useSearch'
import { usePagination } from '@/hooks/usePagination'
import { getAllReportsAsync, setReportStatusAsync } from '@/services/admin-report.service'
import type { AdminReportView } from '@/types/report'

const STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'aprobado', label: 'Aprobados' },
  { value: 'correcciones', label: 'Correcciones' },
]

const searchFields = (report: AdminReportView) => [report.studentName, report.subjectName, report.title, report.groupName]

/** Centro de Reportes del Administrador (Sprint 13, Parte 6). */
export function AdminReportsListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState<AdminReportView[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<string | null>(null)
  const [careerFilter, setCareerFilter] = useState('todas')
  const [professorFilter, setProfessorFilter] = useState('todos')

  const actor = user ? { id: user.id, name: user.name, role: user.role } : null

  const reload = useCallback(() => {
    setIsLoading(true)
    getAllReportsAsync()
      .then(setReports)
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(reload, [reload])

  const careers = useMemo(() => Array.from(new Set(reports.map((r) => r.careerName).filter(Boolean))) as string[], [reports])
  const professors = useMemo(() => Array.from(new Set(reports.map((r) => r.professorName).filter(Boolean))) as string[], [reports])

  const byFilters = reports.filter((report) => {
    if (status && report.status !== status) return false
    if (careerFilter !== 'todas' && report.careerName !== careerFilter) return false
    if (professorFilter !== 'todos' && report.professorName !== professorFilter) return false
    return true
  })

  const getFields = useCallback(searchFields, [])
  const { query, setQuery, filtered } = useSearch(byFilters, getFields)
  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 8)

  async function handleStatusChange(report: AdminReportView, newStatus: AdminReportView['status'], label: string) {
    if (!actor) return
    await setReportStatusAsync(actor, report.id, newStatus, label)
    reload()
  }

  function handleDownloadPdf(report: AdminReportView) {
    downloadPrintableHtml(
      `reporte-${report.id}.html`,
      report.title,
      `<p><strong>Alumno:</strong> ${report.studentName}</p>
       <p><strong>Materia:</strong> ${report.subjectName} (${report.groupName})</p>
       <p><strong>Semana:</strong> ${report.week}</p>
       <p><strong>Estado:</strong> ${report.status}</p>
       <p><strong>Contenido:</strong></p><p>${report.content}</p>
       ${report.evaluation ? `<p><strong>Evaluación:</strong> ${report.evaluation.level} — ${report.evaluation.observations}</p>` : ''}`,
    )
  }

  function handleExportExcel() {
    downloadCsv(
      'reportes.csv',
      filtered.map((report) => ({
        alumno: report.studentName,
        materia: report.subjectName,
        grupo: report.groupName,
        carrera: report.careerName ?? '',
        profesor: report.professorName ?? '',
        semana: report.week,
        estado: report.status,
        enviado: formatDateTime(report.submittedAt),
      })),
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Centro de Reportes' }]}
        title="Centro de Reportes"
        subtitle={isLoading ? undefined : `${reports.length} reportes en el sistema`}
        actions={
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="size-4" />
            Exportar Excel
          </Button>
        }
      />

      {isLoading ? (
        <ListSkeleton variant="block" count={5} blockHeight="h-24" />
      ) : reports.length === 0 ? (
        <EmptyState icon={FileText} title="Sin reportes" description="Cuando se envíen reportes aparecerán aquí." />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <SearchInput value={query} onChange={setQuery} placeholder="Buscar por alumno, materia, grupo o título…" />
            <FilterChips options={STATUS_OPTIONS} value={status} onChange={setStatus} />
            <div className="flex flex-wrap gap-2">
              <Select value={careerFilter} onValueChange={setCareerFilter}>
                <SelectTrigger className="h-9 w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las carreras</SelectItem>
                  {careers.map((career) => (
                    <SelectItem key={career} value={career}>
                      {career}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={professorFilter} onValueChange={setProfessorFilter}>
                <SelectTrigger className="h-9 w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los profesores</SelectItem>
                  {professors.map((professor) => (
                    <SelectItem key={professor} value={professor}>
                      {professor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={FileText} title="Sin resultados" description="No encontramos reportes que coincidan con tu búsqueda o filtros." />
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {pageItems.map((report) => (
                  <Card key={report.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 cursor-pointer" onClick={() => navigate(`/admin/reportes/${report.id}`)}>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-foreground">{report.title}</h3>
                          <Badge variant="outline">{report.status}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {report.studentName} · {report.subjectName} · Semana {report.week}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {[report.careerName, report.professorName].filter(Boolean).join(' · ')}
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="Más opciones">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => navigate(`/admin/reportes/${report.id}`)}>
                            <FileText className="size-4" />
                            Abrir reporte
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleDownloadPdf(report)}>
                            <Download className="size-4" />
                            Descargar PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => void handleStatusChange(report, 'aprobado', 'Aprobó')}>
                            <ThumbsUp className="size-4" />
                            Aprobar
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => void handleStatusChange(report, 'correcciones', 'Rechazó')}>
                            <ThumbsDown className="size-4" />
                            Rechazar
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => void handleStatusChange(report, 'pendiente', 'Devolvió')}>
                            <RotateCcw className="size-4" />
                            Devolver
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
