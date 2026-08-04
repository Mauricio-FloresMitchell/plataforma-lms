import { PartyPopper } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RankMovementIndicator } from '@/components/RankMovementIndicator'
import { StudentStatusBadge } from '@/components/StudentStatusBadge'
import { OpenChatButton } from '@/features/comunicacion/components/OpenChatButton'
import type { Role } from '@/types/auth'
import type { Badge as BadgeType } from '@/types/evaluation'
import type { LeaderboardEntry } from '@/types/gamification'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  badges: BadgeType[]
  /** Resalta la fila de este alumno (vista "Mi Ranking" del Alumno). */
  highlightStudentId?: string
  /** Habilita "Felicitar" (Parte 14) en el Top 3 para Profesor/Administrador; ausente = no se muestra. */
  currentUserId?: string
  currentUserRole?: Role
}

const MEDALS = ['🥇', '🥈', '🥉']

function badgeIcons(badgeIds: string[], badges: BadgeType[]) {
  return badgeIds
    .map((id) => badges.find((b) => b.id === id))
    .filter((b): b is BadgeType => Boolean(b))
}

/** Tabla de Leaderboard reutilizable por Alumno, Profesor y Administrador (Sprint Leaderboard). */
export function LeaderboardTable({ entries, badges, highlightStudentId, currentUserId, currentUserRole }: LeaderboardTableProps) {
  const canCongratulate = currentUserRole === 'profesor' || currentUserRole === 'administrador'
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Aún no hay alumnos en este ranking.</p>
  }

  const top3 = entries.slice(0, 3)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {top3.map((entry, index) => (
          <Card
            key={entry.studentId}
            className={`p-4 text-center ${entry.studentId === highlightStudentId ? 'ring-2 ring-primary' : ''}`}
          >
            <div className="text-3xl">{MEDALS[index]}</div>
            <p className="mt-1 font-semibold text-sm">{entry.studentName}</p>
            <p className="text-xs text-muted-foreground">{entry.career}</p>
            <p className="mt-2 text-lg font-bold text-primary">{entry.totalPoints} pts</p>
            <div className="mt-2 flex justify-center">
              <StudentStatusBadge status={entry.status} />
            </div>
            {canCongratulate && currentUserId && entry.studentId !== currentUserId ? (
              <OpenChatButton
                recipientId={entry.studentId}
                recipientName={entry.studentName}
                label="Felicitar"
                icon={PartyPopper}
                draftMessage={`¡Felicidades por tu lugar #${entry.rank} en el ranking de ${entry.subjectName}!`}
                className="mt-3 w-full"
              />
            ) : null}
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="hidden gap-2 px-3 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[3rem_1fr_8rem_5rem_6rem_5rem_8rem_8rem_6rem]">
          <span>#</span>
          <span>Alumno</span>
          <span>Carrera</span>
          <span>Cuatr.</span>
          <span>Puntos</span>
          <span>Bonif.</span>
          <span>Badges</span>
          <span>Avance</span>
          <span>Estado</span>
        </div>

        {entries.map((entry) => (
          <Card
            key={entry.studentId}
            className={`grid grid-cols-2 gap-2 p-3 text-sm sm:grid-cols-[3rem_1fr_8rem_5rem_6rem_5rem_8rem_8rem_6rem] sm:items-center ${
              entry.studentId === highlightStudentId ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
          >
            <span className="flex items-center gap-1 font-medium">
              {entry.rank}
              <RankMovementIndicator movement={entry.rankMovement} />
            </span>
            <span className="font-medium truncate">{entry.studentName}</span>
            <span className="text-muted-foreground truncate">{entry.career}</span>
            <span className="text-muted-foreground">Cuatri. {entry.term}</span>
            <span className="font-semibold">{entry.totalPoints} pts</span>
            <span className="text-muted-foreground">+{entry.bonus}%</span>
            <span className="flex flex-wrap gap-1">
              {badgeIcons(entry.badgeIds, badges).map((badge) => (
                <span key={badge.id} title={badge.name} className="text-base">
                  {badge.icon}
                </span>
              ))}
            </span>
            <span className="flex items-center gap-2">
              <Progress value={entry.titulacionProgress} className="h-2 w-16" />
              <span className="text-xs text-muted-foreground">{entry.titulacionProgress}%</span>
            </span>
            <StudentStatusBadge status={entry.status} />
          </Card>
        ))}
      </div>
    </div>
  )
}
