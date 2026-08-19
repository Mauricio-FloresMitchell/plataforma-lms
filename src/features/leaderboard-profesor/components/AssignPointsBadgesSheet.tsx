import { useEffect, useMemo, useState } from 'react'
import { Award, Check, Coins } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PointCatalogPicker } from '@/features/puntos-profesor/components/PointCatalogPicker'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { recordPointMovementAsync, assignBadgeManuallyAsync, revokeBadgeManuallyAsync } from '@/services/gamification.service'
import type { Badge as BadgeType } from '@/types/evaluation'
import type { LeaderboardEntry, PointActionId, PointCatalogEntry } from '@/types/gamification'

interface AssignPointsBadgesSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectId: string
  student: LeaderboardEntry | null
  catalog: PointCatalogEntry[]
  badges: BadgeType[]
  /** Se llama tras guardar para que la página vuelva a pedir el Leaderboard. */
  onChanged: () => void
}

/**
 * Panel emergente del Leaderboard (Sprint Leaderboard, votación y asignación
 * rápida): asigna varias acciones de puntos a la vez y otorga/quita
 * insignias manuales del alumno seleccionado, sin salir del ranking.
 */
export function AssignPointsBadgesSheet({
  open,
  onOpenChange,
  subjectId,
  student,
  catalog,
  badges,
  onChanged,
}: AssignPointsBadgesSheetProps) {
  const { user } = useAuth()
  const [actionIds, setActionIds] = useState<PointActionId[]>([])
  const [badgeIds, setBadgeIds] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)

  const manualBadges = useMemo(() => badges.filter((badge) => badge.awardType !== 'automatic'), [badges])

  useEffect(() => {
    if (!open) return
    setActionIds([])
    setBadgeIds(new Set(student?.badgeIds ?? []))
  }, [open, student])

  if (!student) return null

  const selectedPointsSum = catalog.filter((entry) => actionIds.includes(entry.id)).reduce((sum, entry) => sum + entry.points, 0)

  function toggleAction(actionId: PointActionId) {
    setActionIds((current) => (current.includes(actionId) ? current.filter((id) => id !== actionId) : [...current, actionId]))
  }

  function toggleBadge(badgeId: string) {
    setBadgeIds((current) => {
      const next = new Set(current)
      if (next.has(badgeId)) next.delete(badgeId)
      else next.add(badgeId)
      return next
    })
  }

  async function handleSave() {
    if (!user || !student) return
    setIsSaving(true)
    try {
      const actor = { id: user.id, name: user.name, role: user.role }

      for (const actionId of actionIds) {
        await recordPointMovementAsync(student.studentId, subjectId, actionId, user.name, actor)
      }

      const originalBadgeIds = new Set(student.badgeIds)
      for (const badge of manualBadges) {
        const wasGranted = originalBadgeIds.has(badge.id)
        const isChecked = badgeIds.has(badge.id)
        if (isChecked && !wasGranted) {
          await assignBadgeManuallyAsync(actor, student.studentId, student.studentName, subjectId, badge.id)
        } else if (!isChecked && wasGranted) {
          await revokeBadgeManuallyAsync(actor, student.studentId, student.studentName, subjectId, badge.id)
        }
      }

      onChanged()
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = actionIds.length > 0 || [...badgeIds].sort().join() !== [...student.badgeIds].sort().join()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{student.studentName}</SheetTitle>
          <SheetDescription>
            #{student.rank} · {student.totalPoints} pts · {student.subjectName}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4">
          <div className="space-y-3">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Coins className="size-4" />
              Puntos · selecciona una o varias acciones
            </h3>
            <PointCatalogPicker catalog={catalog} selectedActionIds={actionIds} onToggle={toggleAction} />
            {actionIds.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                {actionIds.length} {actionIds.length === 1 ? 'acción seleccionada' : 'acciones seleccionadas'} ·{' '}
                <span className={selectedPointsSum >= 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-red-600'}>
                  {selectedPointsSum >= 0 ? '+' : ''}
                  {selectedPointsSum} pts
                </span>
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Award className="size-4" />
              Insignias
            </h3>
            {manualBadges.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay insignias disponibles para otorgar manualmente.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {manualBadges.map((badge) => {
                  const isChecked = badgeIds.has(badge.id)
                  return (
                    <Card
                      key={badge.id}
                      onClick={() => toggleBadge(badge.id)}
                      className={`relative flex cursor-pointer flex-row items-center gap-2 p-3 transition-all ${
                        isChecked ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
                      }`}
                    >
                      <span className="text-xl">{badge.icon}</span>
                      <span className="flex-1 text-sm font-medium">{badge.name}</span>
                      {isChecked ? (
                        <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3" />
                        </span>
                      ) : null}
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <SheetFooter>
          <Button onClick={() => void handleSave()} disabled={!hasChanges || isSaving} className="h-10">
            Guardar cambios
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
