import {
  AlertCircle,
  FileClock,
  GraduationCap,
  Inbox,
  Presentation,
  ScrollText,
  ShieldCheck,
  Ticket,
  Users,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WelcomeCard } from '@/components/dashboard/WelcomeCard'
import { KpiGrid } from '@/components/dashboard/KpiGrid'
import { RecentActivityCard } from '@/components/dashboard/RecentActivityCard'
import { AnnouncementsCard } from '@/components/dashboard/AnnouncementsCard'
import { QuickAccessGrid } from '@/components/QuickAccessGrid'
import type { QuickAccessItem } from '@/components/QuickAccessCard'
import type { StatItem } from '@/types/dashboard'
import type { AdminExecutiveIndicators, AdminSummary } from '@/types/admin'
import type { PermissionKey } from '@/types/rbac'
import { hasModuleAccess } from '@/utils/permissions'
import { useAdminDashboard } from '../hooks/useAdminDashboard'
import { ADMIN_MANAGEMENT_SECTIONS, ADMIN_TOOL_SECTIONS } from '../admin-sections'
import { AlertsCard } from '../components/AlertsCard'
import { GlobalLeaderboardCard } from '../components/GlobalLeaderboardCard'
import { DashboardSkeleton } from '@/components/DashboardSkeleton'

function firstName(fullName: string): string {
  return fullName.trim().split(' ')[0] ?? ''
}

function buildWelcome(summary: AdminSummary) {
  const name = firstName(summary.adminName)
  return {
    title: name ? `Te damos la bienvenida, ${name}` : 'Te damos la bienvenida',
    subtitle: 'Centro de Gestión Universitaria — resumen ejecutivo de la institución.',
    badges: [summary.institutionName, summary.periodName],
  }
}

/**
 * Dashboard Ejecutivo (Sprint 19, Parte 1): reemplaza el `KpiGrid` de 18
 * tarjetas + accesos rápidos de 14 tarjetas + Centro de Reportes separado
 * por el set curado de indicadores que pidió el sprint — todo se recalcula
 * en vivo (`admin.service.ts#computeExecutiveIndicators`).
 */
function buildExecutiveItems(executive: AdminExecutiveIndicators): StatItem[] {
  return [
    { label: 'Usuarios activos', value: executive.activeUsers, icon: Users },
    { label: 'Alumnos conectados', value: executive.studentsConnected, icon: GraduationCap, hint: 'últimos 15 min' },
    { label: 'Profesores conectados', value: executive.professorsConnected, icon: Presentation, hint: 'últimos 15 min' },
    { label: 'Solicitudes pendientes', value: executive.pendingRequests, icon: Inbox },
    { label: 'Reportes por revisar', value: executive.reportsToReview, icon: FileClock },
    { label: 'Evaluaciones pendientes', value: executive.evaluationsPending, icon: ScrollText },
    { label: 'Titulación pendiente', value: executive.titulacionPending, icon: GraduationCap },
    { label: 'Tickets abiertos', value: executive.openTickets, icon: Ticket },
    { label: 'Estado de la plataforma', value: executive.systemStatus, icon: ShieldCheck },
  ]
}

/**
 * Accesos rápidos (Sprint 19, Parte 10; RBAC real desde el Sprint 20): cada
 * sección se filtra por `hasModuleAccess` contra los permisos efectivos del
 * administrador en sesión (rol ∪ permisos personalizados), no por un
 * condicional de rol quemado.
 */
function buildQuickAccess(effectivePermissions: PermissionKey[]): QuickAccessItem[] {
  return [...ADMIN_MANAGEMENT_SECTIONS, ...ADMIN_TOOL_SECTIONS]
    .filter((section) => hasModuleAccess(effectivePermissions, section.moduleKey))
    .map((section) => ({
      label: section.label,
      description: section.description,
      icon: section.icon,
      to: section.to,
    }))
}

/** Dashboard del Administrador. Compone widgets compartidos y propios de la feature. */
export function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminDashboard()

  if (isLoading) {
    return <DashboardSkeleton bottomVariant="grid" bottomCount={8} />
  }

  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertDescription>{error ?? 'No hay información disponible.'}</AlertDescription>
      </Alert>
    )
  }

  const welcome = buildWelcome(data.summary)

  return (
    <div className="flex flex-col gap-6">
      <WelcomeCard title={welcome.title} subtitle={welcome.subtitle} badges={welcome.badges} />

      <KpiGrid items={buildExecutiveItems(data.executive)} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AlertsCard alerts={data.alerts} />
        <RecentActivityCard items={data.recentActivity} title="Actividad reciente" />
        <AnnouncementsCard items={data.announcements} />
      </div>

      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">Módulos</h3>
        <QuickAccessGrid items={buildQuickAccess(data.effectivePermissions)} />
      </section>

      <GlobalLeaderboardCard />
    </div>
  )
}
