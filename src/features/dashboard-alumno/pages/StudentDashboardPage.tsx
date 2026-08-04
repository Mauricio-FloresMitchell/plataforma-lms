import { AlertCircle, Award, BookOpen, FileClock, GraduationCap, Library, TrendingUp } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WelcomeCard } from '@/components/dashboard/WelcomeCard'
import { KpiGrid } from '@/components/dashboard/KpiGrid'
import { RecentActivityCard } from '@/components/dashboard/RecentActivityCard'
import { UpcomingActivitiesCard } from '@/components/dashboard/UpcomingActivitiesCard'
import { AnnouncementsCard } from '@/components/dashboard/AnnouncementsCard'
import { QuickAccessGrid } from '@/components/QuickAccessGrid'
import type { QuickAccessItem } from '@/components/QuickAccessCard'
import type { StatItem } from '@/types/dashboard'
import type { StudentKpis, StudentSummary } from '@/types/student'
import { useStudentDashboard } from '../hooks/useStudentDashboard'
import { ProgressCard } from '../components/ProgressCard'
import { SubjectsCard } from '../components/SubjectsCard'
import { GamificationCard } from '../components/GamificationCard'
import { DashboardSkeleton } from '@/components/DashboardSkeleton'

function firstName(fullName: string): string {
  return fullName.trim().split(' ')[0] ?? ''
}

function buildWelcome(summary: StudentSummary) {
  const name = firstName(summary.studentName)
  return {
    title: name ? `Bienvenida, ${name}` : 'Bienvenida',
    subtitle: 'Este es el resumen de tu avance académico.',
    badges: [summary.careerName, `Grupo ${summary.groupName}`, summary.periodName],
  }
}

/** Accesos rápidos del Alumno (Sprint 16, Parte 9): aditivo, no forma parte del Sidebar/ROLE_NAV. */
const QUICK_ACCESS: QuickAccessItem[] = [
  { label: 'Cursos Asignados', description: 'Progreso y fechas de tus cursos complementarios', icon: GraduationCap, to: '/alumno/cursos' },
  { label: 'Certificaciones', description: 'Certificados de tus cursos finalizados', icon: Award, to: '/alumno/certificaciones' },
  { label: 'Producto de Titulación', description: 'Avance por fases de tu proyecto', icon: TrendingUp, to: '/alumno/titulacion' },
  { label: 'Biblioteca / Recursos', description: 'Documentos y clases grabadas', icon: Library, to: '/alumno/biblioteca' },
]

function buildKpis(kpis: StudentKpis): StatItem[] {
  return [
    { label: 'Materias inscritas', value: kpis.subjectsCount, icon: BookOpen },
    {
      label: 'Reportes pendientes',
      value: kpis.pendingReports,
      icon: FileClock,
      hint: kpis.pendingReports === 0 ? 'Sin pendientes' : 'Por entregar',
    },
    { label: 'Insignias obtenidas', value: kpis.badgesEarned, icon: Award },
    {
      label: 'Nivel de competencia',
      value: kpis.competencyLevel,
      icon: TrendingUp,
      hint: 'Nivel general',
    },
  ]
}

/** Dashboard del Alumno. Compone widgets compartidos y propios de la feature. */
export function StudentDashboardPage() {
  const { data, isLoading, error } = useStudentDashboard()

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

      <QuickAccessGrid items={QUICK_ACCESS} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ProgressCard progress={data.progress} />
        <SubjectsCard subjects={data.subjects} />
        <UpcomingActivitiesCard items={data.upcomingActivities} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivityCard items={data.recentActivity} />
        <AnnouncementsCard items={data.announcements} />
      </div>

      <GamificationCard />
    </div>
  )
}
