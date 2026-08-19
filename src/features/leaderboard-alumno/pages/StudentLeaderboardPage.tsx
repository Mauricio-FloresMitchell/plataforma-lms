import { useEffect, useState } from 'react'
import { ThumbsUp, Trophy } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { ListSkeleton } from '@/components/ListSkeleton'
import { EmptyState } from '@/components/EmptyState'
import { LeaderboardTable } from '@/components/LeaderboardTable'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getSubjectLeaderboardAsync } from '@/services/gamification.service'
import { getAvailableBadgesAsync } from '@/services/evaluation.service'
import { getMyPendingVoteAsync } from '@/services/vote.service'
import { VoteForStudentSheet } from '../components/VoteForStudentSheet'
import type { LeaderboardEntry } from '@/types/gamification'
import type { Badge as BadgeType } from '@/types/evaluation'
import type { StudentVote } from '@/types/vote'

/** Materia con datos de Gamificación disponibles para el Alumno demo (Sprint Leaderboard). */
const STUDENT_LEADERBOARD_SUBJECT_ID = 'sub-001'

/** Leaderboard de la materia del Alumno: Top 3, ranking completo, su propia fila resaltada y votación por un compañero. */
export function StudentLeaderboardPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [myPendingVote, setMyPendingVote] = useState<StudentVote | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [voteCandidate, setVoteCandidate] = useState<LeaderboardEntry | null>(null)
  const [voteSheetOpen, setVoteSheetOpen] = useState(false)

  function reloadMyVote() {
    if (!user) return
    getMyPendingVoteAsync(STUDENT_LEADERBOARD_SUBJECT_ID, user.id).then(setMyPendingVote)
  }

  useEffect(() => {
    Promise.all([getSubjectLeaderboardAsync(STUDENT_LEADERBOARD_SUBJECT_ID), getAvailableBadgesAsync()])
      .then(([leaderboard, badgeCatalog]) => {
        setEntries(leaderboard)
        setBadges(badgeCatalog)
      })
      .finally(() => setIsLoading(false))
    reloadMyVote()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  function openVoteSheet(entry: LeaderboardEntry) {
    setVoteCandidate(entry)
    setVoteSheetOpen(true)
  }

  function handleVoted() {
    reloadMyVote()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/alumno' }, { label: 'Leaderboard' }]}
        title="Leaderboard"
        subtitle="Ranking de tu grupo según puntos, insignias y avance del producto de titulación."
      />

      {myPendingVote ? (
        <Alert>
          <ThumbsUp className="size-4" />
          <AlertDescription>
            Tu voto por <span className="font-medium">{myPendingVote.candidateName}</span> está pendiente de revisión de tu
            profesor.
          </AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <ListSkeleton variant="block" count={3} blockHeight="h-24" />
      ) : entries.length === 0 ? (
        <EmptyState icon={Trophy} title="Sin datos de ranking" description="Aún no hay movimientos de puntos registrados." />
      ) : (
        <LeaderboardTable
          entries={entries}
          badges={badges}
          highlightStudentId={user?.id}
          currentUserId={user?.id}
          onVoteStudent={openVoteSheet}
          voterHasPendingVote={Boolean(myPendingVote)}
        />
      )}

      <VoteForStudentSheet
        open={voteSheetOpen}
        onOpenChange={setVoteSheetOpen}
        subjectId={STUDENT_LEADERBOARD_SUBJECT_ID}
        candidate={voteCandidate}
        onVoted={handleVoted}
      />
    </div>
  )
}
