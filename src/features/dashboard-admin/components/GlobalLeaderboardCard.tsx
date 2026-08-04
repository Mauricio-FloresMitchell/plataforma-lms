import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getGlobalLeaderboardAsync } from '@/services/gamification.service'
import type { LeaderboardEntry } from '@/types/gamification'

/**
 * Widgets de Gamificación del Dashboard del Administrador (Sprint
 * Leaderboard): mini leaderboard global y estadísticas institucionales
 * (carreras, badges, puntos, participación). Aditivo: no reemplaza ningún
 * widget existente del dashboard.
 */
export function GlobalLeaderboardCard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getGlobalLeaderboardAsync()
      .then(setEntries)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return null

  const careers = new Set(entries.map((entry) => entry.career)).size
  const totalPoints = entries.reduce((sum, entry) => sum + entry.totalPoints, 0)
  const badgesAwarded = entries.reduce((sum, entry) => sum + entry.badgeIds.length, 0)
  const participating = entries.filter((entry) => entry.totalPoints > 0).length

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="size-4 text-primary" />
          Leaderboard global
        </CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/leaderboard">Ver todo</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay movimientos de puntos registrados.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
              <div>
                <p className="text-xl font-bold text-foreground">{careers}</p>
                <p className="text-xs text-muted-foreground">Carreras</p>
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{badgesAwarded}</p>
                <p className="text-xs text-muted-foreground">Badges</p>
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{totalPoints}</p>
                <p className="text-xs text-muted-foreground">Puntos</p>
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">
                  {participating}/{entries.length}
                </p>
                <p className="text-xs text-muted-foreground">Participación</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-border pt-3">
              {entries.slice(0, 3).map((entry) => (
                <div key={entry.studentId} className="flex items-center justify-between text-sm">
                  <span className="truncate">
                    #{entry.rank} {entry.studentName} · {entry.career}
                  </span>
                  <span className="font-semibold text-foreground">{entry.totalPoints} pts</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
