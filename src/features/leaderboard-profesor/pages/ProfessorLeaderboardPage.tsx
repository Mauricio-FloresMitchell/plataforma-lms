import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { ListSkeleton } from '@/components/ListSkeleton'
import { EmptyState } from '@/components/EmptyState'
import { LeaderboardTable } from '@/components/LeaderboardTable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getProfessorSubjectsAsync } from '@/services/subject.service'
import { getSubjectLeaderboardAsync } from '@/services/gamification.service'
import { getAvailableBadgesAsync } from '@/services/evaluation.service'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { ProfessorSubjectListItem } from '@/types/subject'
import type { LeaderboardEntry } from '@/types/gamification'
import type { Badge as BadgeType } from '@/types/evaluation'

/** Leaderboard del grupo del Profesor: selecciona una materia y muestra su ranking completo. */
export function ProfessorLeaderboardPage() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<ProfessorSubjectListItem[]>([])
  const [subjectId, setSubjectId] = useState('')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getProfessorSubjectsAsync(), getAvailableBadgesAsync()]).then(([subjectsData, badgeCatalog]) => {
      setSubjects(subjectsData)
      setBadges(badgeCatalog)
      setSubjectId(subjectsData[0]?.id ?? '')
    })
  }, [])

  useEffect(() => {
    if (!subjectId) return
    setIsLoading(true)
    getSubjectLeaderboardAsync(subjectId)
      .then(setEntries)
      .finally(() => setIsLoading(false))
  }, [subjectId])

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/profesor' }, { label: 'Leaderboard' }]}
        title="Leaderboard"
        subtitle="Ranking del grupo según puntos, insignias y avance del producto de titulación."
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

      {isLoading ? (
        <ListSkeleton variant="block" count={3} blockHeight="h-24" />
      ) : entries.length === 0 ? (
        <EmptyState icon={Trophy} title="Sin datos de ranking" description="Aún no hay movimientos de puntos registrados en esta materia." />
      ) : (
        <LeaderboardTable entries={entries} badges={badges} currentUserId={user?.id} currentUserRole={user?.role} />
      )}
    </div>
  )
}
