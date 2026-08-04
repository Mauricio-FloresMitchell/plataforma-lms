import { AlertCircle, BookOpen, FileClock, Layers, Users } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WelcomeCard } from '@/components/dashboard/WelcomeCard'
import { KpiGrid } from '@/components/dashboard/KpiGrid'
import { RecentActivityCard } from '@/components/dashboard/RecentActivityCard'
import { UpcomingActivitiesCard } from '@/components/dashboard/UpcomingActivitiesCard'
import { AnnouncementsCard } from '@/components/dashboard/AnnouncementsCard'
import type { StatItem } from '@/types/dashboard'
import type { ProfessorKpis, ProfessorSummary } from '@/types/professor'
import { useProfessorDashboard } from '../hooks/useProfessorDashboard'
import { ProfessorSubjectsCard } from '../components/ProfessorSubjectsCard'
import { PendingReportsCard } from '../components/PendingReportsCard'
import { GroupLeaderboardCard } from '../components/GroupLeaderboardCard'
import { DashboardSkeleton } from '@/components/DashboardSkeleton'

function firstName(fullName: string): string {
  return fullName.trim().split(' ')[0] ?? ''
}

function buildWelcome(summary: ProfessorSummary) {
  const name = firstName(summary.professorName)
  return {
    title: name ? `Te damos la bienvenida, ${name}` : 'Te damos la bienvenida',
    subtitle: 'Este es el resumen de tu actividad docente.',
    badges: [summary.departmentName, `${summary.periodName}`],
  }
}

function buildKpis(kpis: ProfessorKpis): StatItem[] {
  return [
    { label: 'Alumnos asignados', value: kpis.assignedStudents, icon: Users },
    { label: 'Grupos', value: kpis.groupsCount, icon: Layers },
    {
      label: 'Reportes por revisar',
      value: kpis.pendingReviews,
      icon: FileClock,
      hint: kpis.pendingReviews === 0 ? 'Al día' : 'Pendientes',
    },
    { label: 'Materias impartidas', value: kpis.subjectsCount, icon: BookOpen },
  ]
}

/** Dashboard del Profesor. Compone widgets compartidos y propios de la feature. */
export function ProfessorDashboardPage() {
  const { data, isLoading, error } = useProfessorDashboard()

  if (isLoading) {
    return <DashboardSkeleton />
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

      <KpiGrid items={buildKpis(data.kpis)} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ProfessorSubjectsCard subjects={data.subjects} />
        <PendingReportsCard reports={data.pendingReports} />
        <UpcomingActivitiesCard items={data.upcomingActivities} title="Próximas entregas" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivityCard items={data.recentActivity} />
        <AnnouncementsCard items={data.announcements} />
      </div>

      <GroupLeaderboardCard />
    </div>
  )
}
