import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { ListSkeleton } from '@/components/ListSkeleton'
import { EmptyState } from '@/components/EmptyState'
import { LeaderboardTable } from '@/components/LeaderboardTable'
import { StatCard } from '@/components/StatCard'
import { cn } from '@/lib/utils'
import { getGlobalLeaderboardAsync } from '@/services/gamification.service'
import { getAvailableBadgesAsync } from '@/services/evaluation.service'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { LeaderboardEntry } from '@/types/gamification'
import type { Badge as BadgeType } from '@/types/evaluation'
import { LeaderboardAdminPanel } from '../components/LeaderboardAdminPanel'

type Tab = 'ranking' | 'administrar'

const TABS: { id: Tab; label: string }[] = [
  { id: 'ranking', label: 'Ranking' },
  { id: 'administrar', label: 'Administrar' },
]

/** Leaderboard global del Administrador: ranking (todas las materias) + panel de administración (Sprint 13, Parte 8). */
export function AdminLeaderboardPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('ranking')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getGlobalLeaderboardAsync(), getAvailableBadgesAsync()])
      .then(([leaderboard, badgeCatalog]) => {
        setEntries(leaderboard)
        setBadges(badgeCatalog)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const careers = new Set(entries.map((entry) => entry.career)).size
  const totalPoints = entries.reduce((sum, entry) => sum + entry.totalPoints, 0)
  const badgesAwarded = entries.reduce((sum, entry) => sum + entry.badgeIds.length, 0)
  const active = entries.filter((entry) => entry.totalPoints > 0).length

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Leaderboard' }]}
        title="Leaderboard institucional"
        subtitle="Ranking global de Gamificación en todas las materias, con estadísticas de participación."
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
          </button>
        ))}
      </div>

      {tab === 'ranking' ? (
        isLoading ? (
          <ListSkeleton variant="block" count={3} blockHeight="h-24" />
        ) : entries.length === 0 ? (
          <EmptyState icon={Trophy} title="Sin datos de ranking" description="Aún no hay movimientos de puntos registrados." />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Carreras representadas" value={careers} icon={Trophy} />
              <StatCard label="Puntos otorgados" value={totalPoints} icon={Trophy} />
              <StatCard label="Insignias otorgadas" value={badgesAwarded} icon={Trophy} />
              <StatCard label="Alumnos participando" value={`${active}/${entries.length}`} icon={Trophy} />
            </div>

            <LeaderboardTable entries={entries} badges={badges} currentUserId={user?.id} currentUserRole={user?.role} />
          </>
        )
      ) : (
        <LeaderboardAdminPanel />
      )}
    </div>
  )
}
