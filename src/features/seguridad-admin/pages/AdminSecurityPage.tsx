import { useEffect, useState } from 'react'
import { AlertTriangle, Key, Lock, ShieldAlert, ShieldCheck, UserCheck, Wifi } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { formatDateTime } from '@/utils/date'
import { getSecurityOverviewAsync } from '@/services/admin.service'
import type { SecurityOverview } from '@/types/admin'

/** Panel de Seguridad (Sprint 20): visión consolidada de acceso y cambios críticos, derivada de Usuarios y Auditoría. */
export function AdminSecurityPage() {
  const [overview, setOverview] = useState<SecurityOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getSecurityOverviewAsync()
      .then(setOverview)
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Seguridad' }]}
        title="Seguridad"
        subtitle="Administradores activos, sesiones, intentos fallidos y cambios críticos de la plataforma."
      />

      {isLoading || !overview ? (
        <ListSkeleton variant="block" count={3} blockHeight="h-20" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Administradores activos" value={overview.activeAdmins} icon={UserCheck} />
            <StatCard label="Sesiones abiertas" value={overview.openSessions} icon={Wifi} hint="últimos 15 min" />
            <StatCard label="Intentos fallidos" value={overview.failedAttempts} icon={AlertTriangle} />
            <StatCard label="Usuarios bloqueados" value={overview.blockedUsers} icon={Lock} />
            <StatCard label="Contraseñas reiniciadas" value={overview.passwordResets} icon={Key} />
            <StatCard label="Cambios críticos" value={overview.criticalChanges} icon={ShieldAlert} />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Actividad reciente</h3>
            {overview.recentActivity.length === 0 ? (
              <EmptyState icon={ShieldCheck} title="Sin actividad" description="No hay eventos de seguridad registrados todavía." />
            ) : (
              <Card className="divide-y divide-border">
                {overview.recentActivity.map((entry) => (
                  <div key={entry.id} className="p-3 text-sm">
                    <p>
                      <span className="font-medium">{entry.userName}</span>
                      {entry.role ? ` (${entry.role})` : ' (sin sesión)'} — {entry.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.module} · {formatDateTime(entry.createdAt)} · IP {entry.ipSimulated} · {entry.locationSimulated}
                    </p>
                  </div>
                ))}
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  )
}
