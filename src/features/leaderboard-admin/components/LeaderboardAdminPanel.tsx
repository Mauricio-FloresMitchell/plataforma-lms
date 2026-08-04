import { useEffect, useState } from 'react'
import { AlertTriangle, Award, Coins, Download, History, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/EmptyState'
import { formatDateTime } from '@/utils/date'
import { downloadCsv } from '@/utils/export'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getProfessorSubjectsAsync } from '@/services/subject.service'
import { getAvailableBadgesAsync } from '@/services/evaluation.service'
import {
  assignBadgeManuallyAsync,
  getGlobalLeaderboardAsync,
  getPointCatalogAsync,
  getSubjectLeaderboardAsync,
  listAllPointMovementsAsync,
  recalculateLeaderboardAsync,
  recordPointMovementAsync,
  resetSeasonAsync,
  revokeBadgeManuallyAsync,
} from '@/services/gamification.service'
import type { ProfessorSubjectListItem } from '@/types/subject'
import type { Badge as BadgeType } from '@/types/evaluation'
import type { LeaderboardEntry, PointActionId, PointCatalogEntry, PointMovement } from '@/types/gamification'

/** Administración del Leaderboard (Sprint 13, Parte 8): no cambia el algoritmo, solo administra sus datos. */
export function LeaderboardAdminPanel() {
  const { user } = useAuth()
  const actor = user ? { id: user.id, name: user.name, role: user.role } : null

  const [subjects, setSubjects] = useState<ProfessorSubjectListItem[]>([])
  const [subjectId, setSubjectId] = useState('')
  const [roster, setRoster] = useState<LeaderboardEntry[]>([])
  const [studentId, setStudentId] = useState('')
  const [catalog, setCatalog] = useState<PointCatalogEntry[]>([])
  const [actionId, setActionId] = useState<PointActionId | ''>('')
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [badgeId, setBadgeId] = useState('')
  const [movements, setMovements] = useState<PointMovement[]>([])
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getProfessorSubjectsAsync(), getPointCatalogAsync(), getAvailableBadgesAsync(), listAllPointMovementsAsync()]).then(
      ([subjectsData, catalogData, badgesData, movementsData]) => {
        setSubjects(subjectsData)
        setSubjectId(subjectsData[0]?.id ?? '')
        setCatalog(catalogData)
        setBadges(badgesData)
        setMovements(movementsData)
      },
    )
  }, [])

  useEffect(() => {
    if (!subjectId) return
    getSubjectLeaderboardAsync(subjectId).then((entries) => {
      setRoster(entries)
      setStudentId(entries[0]?.studentId ?? '')
    })
  }, [subjectId])

  function reloadMovements() {
    listAllPointMovementsAsync().then(setMovements)
  }

  const selectedStudent = roster.find((entry) => entry.studentId === studentId)

  async function handleRegisterPoints() {
    if (!actor || !studentId || !subjectId || !actionId) return
    await recordPointMovementAsync(studentId, subjectId, actionId, actor.name, actor)
    setFeedback('Movimiento de puntos registrado.')
    reloadMovements()
    getSubjectLeaderboardAsync(subjectId).then(setRoster)
  }

  async function handleAssignBadge() {
    if (!actor || !selectedStudent || !subjectId || !badgeId) return
    await assignBadgeManuallyAsync(actor, selectedStudent.studentId, selectedStudent.studentName, subjectId, badgeId)
    setFeedback('Insignia otorgada.')
    getSubjectLeaderboardAsync(subjectId).then(setRoster)
  }

  async function handleRevokeBadge() {
    if (!actor || !selectedStudent || !subjectId || !badgeId) return
    await revokeBadgeManuallyAsync(actor, selectedStudent.studentId, selectedStudent.studentName, subjectId, badgeId)
    setFeedback('Insignia retirada.')
    getSubjectLeaderboardAsync(subjectId).then(setRoster)
  }

  async function handleRecalculate() {
    if (!actor) return
    await recalculateLeaderboardAsync(actor)
    setFeedback('Ranking recalculado.')
    if (subjectId) getSubjectLeaderboardAsync(subjectId).then(setRoster)
  }

  async function handleResetSeason() {
    if (!actor) return
    if (!window.confirm('¿Reiniciar la temporada? Se eliminarán todos los movimientos de puntos de todas las materias. Esta acción no se puede deshacer.')) {
      return
    }
    await resetSeasonAsync(actor)
    setFeedback('Temporada reiniciada.')
    reloadMovements()
    if (subjectId) getSubjectLeaderboardAsync(subjectId).then(setRoster)
  }

  async function handleExportRanking() {
    const global = await getGlobalLeaderboardAsync()
    downloadCsv(
      'leaderboard.csv',
      global.map((entry) => ({
        posicion: entry.rank,
        alumno: entry.studentName,
        materia: entry.subjectName,
        carrera: entry.career,
        puntos: entry.totalPoints,
        estado: entry.status,
      })),
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => void handleRecalculate()}>
          <RefreshCw className="size-4" />
          Recalcular ranking
        </Button>
        <Button variant="outline" onClick={() => void handleExportRanking()}>
          <Download className="size-4" />
          Exportar ranking
        </Button>
        <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => void handleResetSeason()}>
          <AlertTriangle className="size-4" />
          Reiniciar temporada
        </Button>
      </div>

      {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}

      <Card className="p-5">
        <h3 className="mb-4 font-semibold text-foreground">Asignar puntos e insignias manualmente</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted-foreground">Materia</label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
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
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted-foreground">Alumno</label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roster.map((entry) => (
                  <SelectItem key={entry.studentId} value={entry.studentId}>
                    {entry.studentName} (#{entry.rank})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
            <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Coins className="size-4" />
              Puntos
            </p>
            <Select value={actionId} onValueChange={(value) => setActionId(value as PointActionId)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una acción" />
              </SelectTrigger>
              <SelectContent>
                {catalog.map((entry) => (
                  <SelectItem key={entry.id} value={entry.id}>
                    {entry.label} ({entry.points > 0 ? '+' : ''}
                    {entry.points})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" disabled={!actionId} onClick={() => void handleRegisterPoints()}>
              Registrar movimiento
            </Button>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
            <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Award className="size-4" />
              Insignias
            </p>
            <Select value={badgeId} onValueChange={setBadgeId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una insignia" />
              </SelectTrigger>
              <SelectContent>
                {badges.map((badge) => (
                  <SelectItem key={badge.id} value={badge.id}>
                    {badge.icon} {badge.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" disabled={!badgeId} onClick={() => void handleAssignBadge()}>
                Otorgar
              </Button>
              <Button size="sm" variant="outline" className="flex-1" disabled={!badgeId} onClick={() => void handleRevokeBadge()}>
                Quitar
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-4 flex items-center gap-1.5 font-semibold text-foreground">
          <History className="size-4" />
          Historial completo de movimientos
        </h3>
        {movements.length === 0 ? (
          <EmptyState icon={Coins} title="Sin movimientos" description="Todavía no se han registrado movimientos de puntos." />
        ) : (
          <div className="flex flex-col gap-2">
            {movements.slice(0, 20).map((movement) => (
              <div key={movement.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5 text-sm">
                <div>
                  <p className="font-medium text-foreground">{movement.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {movement.studentId} · {movement.registeredBy} · {formatDateTime(movement.createdAt)}
                  </p>
                </div>
                <span className={movement.points >= 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-destructive'}>
                  {movement.points >= 0 ? '+' : ''}
                  {movement.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
