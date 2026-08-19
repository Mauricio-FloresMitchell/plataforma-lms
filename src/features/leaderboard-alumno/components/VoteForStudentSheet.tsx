import { useEffect, useState } from 'react'
import { ThumbsUp } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { castVoteAsync } from '@/services/vote.service'
import type { LeaderboardEntry } from '@/types/gamification'

interface VoteForStudentSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectId: string
  candidate: LeaderboardEntry | null
  /** Se llama tras enviar el voto para refrescar el estado de "voto pendiente" en la página. */
  onVoted: () => void
}

/**
 * Votación entre alumnos (Sprint Leaderboard): "Mejor solución del breakout
 * room (votación del grupo)" del Manual de Mejoras Transversales, llevada al
 * Leaderboard como nominación individual. El profesor decide si el voto se
 * convierte en puntos (`AssignPointsBadgesSheet`/cola de votos del Profesor).
 */
export function VoteForStudentSheet({ open, onOpenChange, subjectId, candidate, onVoted }: VoteForStudentSheetProps) {
  const { user } = useAuth()
  const [reason, setReason] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setReason('')
    setError(null)
  }, [open, candidate])

  if (!candidate) return null

  async function handleSubmit() {
    if (!user || !candidate) return
    setIsSaving(true)
    setError(null)
    try {
      const actor = { id: user.id, name: user.name, role: user.role }
      const vote = await castVoteAsync(subjectId, candidate.subjectName, actor, candidate.studentId, candidate.studentName, reason.trim() || undefined)
      if (!vote) {
        setError('Ya tienes un voto pendiente de revisión. Espera a que tu profesor lo resuelva antes de votar de nuevo.')
        return
      }
      onVoted()
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Votar por {candidate.studentName}</SheetTitle>
          <SheetDescription>
            Tu voto queda pendiente de revisión de tu profesor. Si lo acepta, tu compañero suma +15 pts en el Leaderboard.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 px-4 pb-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vote-reason">Motivo (opcional)</Label>
            <Textarea
              id="vote-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Ej. Explicó muy claro la propuesta de solución en el breakout room."
              rows={4}
            />
          </div>
        </div>

        <SheetFooter>
          <Button onClick={() => void handleSubmit()} disabled={isSaving} className="h-10">
            <ThumbsUp className="size-4" />
            Enviar voto
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
