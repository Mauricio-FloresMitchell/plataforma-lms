import { useCallback, useEffect, useMemo, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { Pagination } from '@/components/Pagination'
import { formatDateTime } from '@/utils/date'
import { usePagination } from '@/hooks/usePagination'
import { getAuditLogAsync } from '@/services/audit.service'
import type { AuditLogEntry, AuditModule } from '@/types/audit'

const MODULES: AuditModule[] = [
  'Carreras',
  'Materias',
  'Grupos',
  'Usuarios',
  'Reportes',
  'Evaluaciones',
  'Leaderboard',
  'Notificaciones',
  'Biblioteca',
  'Configuración',
  'Backups',
  'Producto de Titulación',
  'Sesión',
  'Foro',
  'Incidencias',
  'Gestión Académica',
]

/**
 * Auditoría (Sprint 13, Parte 12; ampliada en Sprint 19, Parte 6): registro
 * real de sesión (inicio/cierre/intentos fallidos), descargas, consultas,
 * cambios, creaciones, eliminaciones, exportaciones y moderación — no solo
 * las mutaciones administrativas originales del Sprint 13.
 */
export function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [moduleFilter, setModuleFilter] = useState('todos')
  const [query, setQuery] = useState('')

  const reload = useCallback(() => {
    setIsLoading(true)
    getAuditLogAsync()
      .then(setEntries)
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(reload, [reload])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return entries.filter((entry) => {
      if (moduleFilter !== 'todos' && entry.module !== moduleFilter) return false
      if (term && !`${entry.userName} ${entry.action} ${entry.module}`.toLowerCase().includes(term)) return false
      return true
    })
  }, [entries, moduleFilter, query])

  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 10)

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Auditoría' }]}
        title="Auditoría"
        subtitle={isLoading ? undefined : `${entries.length} acciones registradas`}
      />

      {isLoading ? (
        <ListSkeleton variant="row" count={6} />
      ) : entries.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Sin registros" description="Las acciones administrativas quedarán registradas aquí." />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchInput value={query} onChange={setQuery} placeholder="Buscar por usuario, acción o módulo…" />
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="h-10 sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los módulos</SelectItem>
                {MODULES.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Sin resultados" description="No encontramos registros que coincidan con tu búsqueda o filtro." />
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {pageItems.map((entry) => (
                  <Card key={entry.id} className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{entry.module}</Badge>
                          <p className="text-sm font-medium text-foreground">{entry.action}</p>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {entry.userName}{entry.role ? ` (${entry.role})` : ' (sin sesión)'} · {formatDateTime(entry.createdAt)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground/80">
                        IP {entry.ipSimulated} · {entry.browserSimulated} en {entry.osSimulated} · {entry.locationSimulated}
                      </p>
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
