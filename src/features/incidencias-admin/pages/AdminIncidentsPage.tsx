import { useCallback, useEffect, useState } from 'react'
import { Ticket } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { SearchInput } from '@/components/SearchInput'
import { FilterChips, type FilterChipOption } from '@/components/FilterChips'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useSearch } from '@/hooks/useSearch'
import { assignIncidentResponsibleAsync, getIncidentsAsync, setIncidentStatusAsync } from '@/services/incident.service'
import { INCIDENT_ORIGIN_LABELS } from '@/types/incident'
import type { Incident, IncidentOrigin, IncidentStatus } from '@/types/incident'
import { IncidentCard } from '../components/IncidentCard'

type Tab = 'abiertas' | 'todas'

const TABS: { id: Tab; label: string }[] = [
  { id: 'abiertas', label: 'Abiertas / en proceso' },
  { id: 'todas', label: 'Todas' },
]

const ORIGIN_OPTIONS: FilterChipOption[] = (Object.keys(INCIDENT_ORIGIN_LABELS) as IncidentOrigin[]).map((origin) => ({
  value: origin,
  label: INCIDENT_ORIGIN_LABELS[origin],
}))

const searchFields = (incident: Incident) => [incident.title, incident.description, incident.reportedByName]

/** Centro de Incidencias (Sprint 19, Parte 8): reportes del Foro + solicitudes académicas/técnicas/administrativas, con seguimiento. */
export function AdminIncidentsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('abiertas')
  const [origin, setOrigin] = useState<string | null>(null)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const actor = user ? { id: user.id, name: user.name, role: user.role } : null

  const reload = useCallback(() => {
    setIsLoading(true)
    getIncidentsAsync()
      .then(setIncidents)
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(reload, [reload])

  const byTab = tab === 'abiertas' ? incidents.filter((item) => item.status === 'abierto' || item.status === 'en_proceso') : incidents
  const byOrigin = origin ? byTab.filter((item) => item.origin === origin) : byTab
  const getFields = useCallback(searchFields, [])
  const { query, setQuery, filtered } = useSearch(byOrigin, getFields)

  async function handleSetStatus(incident: Incident, status: IncidentStatus, note?: string) {
    if (!actor) return
    await setIncidentStatusAsync(actor, incident.id, status, note)
    reload()
  }

  async function handleAssign(incident: Incident, responsibleName: string) {
    if (!actor) return
    await assignIncidentResponsibleAsync(actor, incident.id, responsibleName)
    reload()
  }

  const openCount = incidents.filter((item) => item.status === 'abierto').length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Centro de Incidencias' }]}
        title="Centro de Incidencias"
        subtitle="Reportes del Foro y solicitudes académicas, técnicas y administrativas con seguimiento."
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              tab === item.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {item.label}
            {item.id === 'abiertas' && openCount > 0 ? ` (${openCount})` : ''}
          </button>
        ))}
      </div>

      {isLoading ? (
        <ListSkeleton variant="block" count={3} blockHeight="h-32" />
      ) : incidents.length === 0 ? (
        <EmptyState icon={Ticket} title="Sin incidencias" description="No hay incidencias registradas todavía." />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <SearchInput value={query} onChange={setQuery} placeholder="Buscar por título, descripción o reportante…" />
            <FilterChips options={ORIGIN_OPTIONS} value={origin} onChange={setOrigin} />
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Ticket} title="Sin resultados" description="No encontramos incidencias que coincidan con tu búsqueda o filtro." />
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  onSetStatus={(status, note) => handleSetStatus(incident, status, note)}
                  onAssign={(responsibleName) => handleAssign(incident, responsibleName)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
