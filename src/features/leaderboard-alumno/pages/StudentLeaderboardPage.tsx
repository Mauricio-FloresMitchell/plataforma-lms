import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { ListSkeleton } from '@/components/ListSkeleton'
import { EmptyState } from '@/components/EmptyState'
import { LeaderboardTable } from '@/components/LeaderboardTable'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getSubjectLeaderboardAsync } from '@/services/gamification.service'
import { getAvailableBadgesAsync } from '@/services/evaluation.service'
import type { LeaderboardEntry } from '@/types/gamification'
import type { Badge as BadgeType } from '@/types/evaluation'

/** Materia con datos de Gamificación disponibles para el Alumno demo (Sprint Leaderboard). */
const STUDENT_LEADERBOARD_SUBJECT_ID = 'sub-001'

/** Leaderboard de la materia del Alumno: Top 3, ranking completo y su propia fila resaltada. */
export function StudentLeaderboardPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getSubjectLeaderboardAsync(STUDENT_LEADERBOARD_SUBJECT_ID), getAvailableBadgesAsync()])
      .then(([leaderboard, badgeCatalog]) => {
        setEntries(leaderboard)
        setBadges(badgeCatalog)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/alumno' }, { label: 'Leaderboard' }]}
        title="Leaderboard"
        subtitle="Ranking de tu grupo según puntos, insignias y avance del producto de titulación."
      />

      {isLoading ? (
        <ListSkeleton variant="block" count={3} blockHeight="h-24" />
      ) : entries.length === 0 ? (
        <EmptyState icon={Trophy} title="Sin datos de ranking" description="Aún no hay movimientos de puntos registrados." />
      ) : (
        <LeaderboardTable entries={entries} badges={badges} highlightStudentId={user?.id} />
      )}
    </div>
  )
}
