import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StudentStatusBadge } from '@/components/StudentStatusBadge'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getStudentLeaderboardEntryAsync, listPointMovementsAsync } from '@/services/gamification.service'
import { getAvailableBadgesAsync } from '@/services/evaluation.service'
import type { LeaderboardEntry } from '@/types/gamification'
import type { Badge as BadgeType } from '@/types/evaluation'

const STUDENT_LEADERBOARD_SUBJECT_ID = 'sub-001'

/**
 * Widgets de Gamificación del Dashboard del Alumno (Sprint Leaderboard):
 * Mi Ranking, Mis puntos, Bonificación, Badges y Actividad reciente en una
 * sola tarjeta. Aditivo: no reemplaza ningún widget existente del dashboard.
 */
export function GamificationCard() {
  const { user } = useAuth()
  const [entry, setEntry] = useState<LeaderboardEntry | null>(null)
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [recentLabels, setRecentLabels] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      getStudentLeaderboardEntryAsync(STUDENT_LEADERBOARD_SUBJECT_ID, user.id),
      getAvailableBadgesAsync(),
      listPointMovementsAsync(STUDENT_LEADERBOARD_SUBJECT_ID, user.id),
    ])
      .then(([leaderboardEntry, badgeCatalog, movements]) => {
        setEntry(leaderboardEntry)
        setBadges(badgeCatalog)
        setRecentLabels(movements.slice(0, 3).map((m) => `${m.points > 0 ? '+' : ''}${m.points} · ${m.label}`))
      })
      .finally(() => setIsLoading(false))
  }, [user])

  if (isLoading || !entry) {
    return null
  }

  const earnedBadges = entry.badgeIds
    .map((id) => badges.find((b) => b.id === id))
    .filter((b): b is BadgeType => Boolean(b))

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="size-4 text-primary" />
          Mi Gamificación
        </CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link to="/alumno/leaderboard">Ver leaderboard</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">#{entry.rank}</p>
            <p className="text-xs text-muted-foreground">Mi ranking</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{entry.totalPoints}</p>
            <p className="text-xs text-muted-foreground">Mis puntos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">+{entry.bonus}%</p>
            <p className="text-xs text-muted-foreground">Bonificación</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Estado</span>
          <StudentStatusBadge status={entry.status} />
        </div>

        {earnedBadges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map((badge) => (
              <span
                key={badge.id}
                title={badge.name}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs"
              >
                <span>{badge.icon}</span>
                {badge.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Aún no tienes insignias de gamificación.</p>
        )}

        {recentLabels.length > 0 ? (
          <div className="flex flex-col gap-1 border-t border-border pt-3">
            <span className="text-xs font-medium text-foreground">Actividad reciente</span>
            {recentLabels.map((label, index) => (
              <span key={index} className="text-xs text-muted-foreground">
                {label}
              </span>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
