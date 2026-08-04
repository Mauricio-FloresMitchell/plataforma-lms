import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Coins, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getProfessorSubjectsAsync } from '@/services/subject.service'
import { getSubjectLeaderboardAsync, listPointMovementsAsync } from '@/services/gamification.service'
import type { LeaderboardEntry, PointMovement } from '@/types/gamification'

/**
 * Widgets de Gamificación del Dashboard del Profesor (Sprint Leaderboard):
 * mini leaderboard del grupo, actividad reciente y acceso rápido a Gestión
 * de Puntos. Aditivo: no reemplaza ningún widget existente del dashboard.
 */
export function GroupLeaderboardCard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [recent, setRecent] = useState<PointMovement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getProfessorSubjectsAsync().then(async (subjects) => {
      const subjectId = subjects[0]?.id
      if (!subjectId) {
        setIsLoading(false)
        return
      }
      const [leaderboard, movements] = await Promise.all([
        getSubjectLeaderboardAsync(subjectId),
        listPointMovementsAsync(subjectId),
      ])
      setEntries(leaderboard.slice(0, 5))
      setRecent(movements.slice(0, 4))
      setIsLoading(false)
    })
  }, [])

  if (isLoading) return null

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="size-4 text-primary" />
          Leaderboard del grupo
        </CardTitle>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/profesor/puntos">
              <Coins className="size-3.5" />
              Puntos
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/profesor/leaderboard">Ver todo</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay movimientos de puntos registrados.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((entry) => (
              <div key={entry.studentId} className="flex items-center justify-between text-sm">
                <span className="truncate">
                  #{entry.rank} {entry.studentName}
                </span>
                <span className="font-semibold text-foreground">{entry.totalPoints} pts</span>
              </div>
            ))}
          </div>
        )}

        {recent.length > 0 ? (
          <div className="flex flex-col gap-1 border-t border-border pt-3">
            <span className="text-xs font-medium text-foreground">Actividad reciente</span>
            {recent.map((movement) => (
              <span key={movement.id} className="text-xs text-muted-foreground">
                {movement.points > 0 ? '+' : ''}
                {movement.points} · {movement.label}
              </span>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
