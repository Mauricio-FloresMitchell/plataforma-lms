import { useEffect, useState } from 'react'
import { ThumbsDown, ThumbsUp, Trophy } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { ListSkeleton } from '@/components/ListSkeleton'
import { EmptyState } from '@/components/EmptyState'
import { LeaderboardTable } from '@/components/LeaderboardTable'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getProfessorSubjectsAsync } from '@/services/subject.service'
import { getPointCatalogAsync, getSubjectLeaderboardAsync } from '@/services/gamification.service'
import { getAvailableBadgesAsync } from '@/services/evaluation.service'
import { acceptVoteAsync, listPendingVotesAsync, rejectVoteAsync } from '@/services/vote.service'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { AssignPointsBadgesSheet } from '../components/AssignPointsBadgesSheet'
import type { ProfessorSubjectListItem } from '@/types/subject'
import type { LeaderboardEntry, PointCatalogEntry } from '@/types/gamification'
import type { Badge as BadgeType } from '@/types/evaluation'
import type { StudentVote } from '@/types/vote'

/** Leaderboard del grupo del Profesor: selecciona una materia, muestra su ranking y su cola de votos pendientes. */
export function ProfessorLeaderboardPage() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<ProfessorSubjectListItem[]>([])
  const [subjectId, setSubjectId] = useState('')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [catalog, setCatalog] = useState<PointCatalogEntry[]>([])
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [pendingVotes, setPendingVotes] = useState<StudentVote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<LeaderboardEntry | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [resolvingVoteId, setResolvingVoteId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getProfessorSubjectsAsync(), getAvailableBadgesAsync(), getPointCatalogAsync()]).then(
      ([subjectsData, badgeCatalog, pointCatalog]) => {
        setSubjects(subjectsData)
        setBadges(badgeCatalog)
        setCatalog(pointCatalog)
        setSubjectId(subjectsData[0]?.id ?? '')
      },
    )
  }, [])

  function reloadLeaderboard() {
    if (!subjectId) return
    setIsLoading(true)
    getSubjectLeaderboardAsync(subjectId)
      .then(setEntries)
      .finally(() => setIsLoading(false))
  }

  function reloadVotes() {
    if (!subjectId) return
    listPendingVotesAsync(subjectId).then(setPendingVotes)
  }

  useEffect(() => {
    reloadLeaderboard()
    reloadVotes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId])

  function openStudentSheet(entry: LeaderboardEntry) {
    setSelectedStudent(entry)
    setSheetOpen(true)
  }

  async function handleResolveVote(voteId: string, action: 'aceptar' | 'rechazar') {
    if (!user) return
    setResolvingVoteId(voteId)
    try {
      const actor = { id: user.id, name: user.name, role: user.role }
      if (action === 'aceptar') await acceptVoteAsync(voteId, actor)
      else await rejectVoteAsync(voteId, actor)
      reloadVotes()
      reloadLeaderboard()
    } finally {
      setResolvingVoteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/profesor' }, { label: 'Leaderboard' }]}
        title="Leaderboard"
        subtitle="Ranking del grupo según puntos, insignias y avance del producto de titulación. Haz clic en un alumno para asignarle puntos o insignias."
        actions={
          subjects.length > 0 ? (
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="h-10 w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : undefined
        }
      />

      {pendingVotes.length > 0 ? (
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Votos pendientes de revisión · {pendingVotes.length}
          </h2>
          <div className="flex flex-col gap-2">
            {pendingVotes.map((vote) => (
              <div key={vote.id} className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm">
                  <p>
                    <span className="font-medium">{vote.voterName}</span> votó por{' '}
                    <span className="font-medium">{vote.candidateName}</span>
                  </p>
                  {vote.reason ? <p className="text-xs text-muted-foreground">"{vote.reason}"</p> : null}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={resolvingVoteId === vote.id}
                    onClick={() => void handleResolveVote(vote.id, 'aceptar')}
                  >
                    <ThumbsUp className="size-3.5" />
                    Aceptar (+15 pts)
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={resolvingVoteId === vote.id}
                    onClick={() => void handleResolveVote(vote.id, 'rechazar')}
                  >
                    <ThumbsDown className="size-3.5" />
                    Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {isLoading ? (
        <ListSkeleton variant="block" count={3} blockHeight="h-24" />
      ) : entries.length === 0 ? (
        <EmptyState icon={Trophy} title="Sin datos de ranking" description="Aún no hay movimientos de puntos registrados en esta materia." />
      ) : (
        <LeaderboardTable
          entries={entries}
          badges={badges}
          currentUserId={user?.id}
          currentUserRole={user?.role}
          onSelectStudent={openStudentSheet}
        />
      )}

      <AssignPointsBadgesSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        subjectId={subjectId}
        student={selectedStudent}
        catalog={catalog}
        badges={badges}
        onChanged={reloadLeaderboard}
      />
    </div>
  )
}
