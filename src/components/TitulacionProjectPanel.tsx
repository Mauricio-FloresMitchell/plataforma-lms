import { useState } from 'react'
import { Award, FileClock, ListChecks, User } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { TitulacionPhaseCard } from '@/components/TitulacionPhaseCard'
import { TitulacionHistoryPanel } from '@/components/TitulacionHistoryPanel'
import type { TitulacionFeedbackType, TitulacionFile, TitulacionProduct } from '@/types/titulacion'

interface TitulacionProjectPanelProps {
  product: TitulacionProduct
  /** alumno: edita borradores y publica fases. profesor: retroalimenta y revisa. readonly: solo consulta (Administrador). */
  mode: 'alumno' | 'profesor' | 'readonly'
  actor: { id: string; name: string } | null
  onSaveDraft?: (phaseId: string, deliverableId: string, content: string, files: TitulacionFile[]) => Promise<void>
  onPublishPhase?: (phaseId: string, comment: string) => Promise<void>
  onDuplicateVersion?: (phaseId: string, versionNumber: number) => Promise<void>
  onAddFeedback?: (phaseId: string, type: Exclude<TitulacionFeedbackType, 'aprobacion' | 'rechazo'>, content: string) => Promise<void>
  onReviewPhase?: (phaseId: string, action: 'aprobada' | 'rechazada', feedback: string) => Promise<void>
  onAddObservation?: (observation: string) => Promise<void>
  onDownloadFile?: (fileId: string) => void
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Panel único del Producto de Titulación (Sprint 18), reutilizado por los 3 roles. */
export function TitulacionProjectPanel({
  product,
  mode,
  actor,
  onSaveDraft,
  onPublishPhase,
  onDuplicateVersion,
  onAddFeedback,
  onReviewPhase,
  onAddObservation,
  onDownloadFile,
}: TitulacionProjectPanelProps) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null)
  const [observation, setObservation] = useState(product.observations)
  const [isSavingObservation, setIsSavingObservation] = useState(false)

  const recentFiles = product.phases
    .flatMap((phase) => phase.deliverables.flatMap((item) => item.files))
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 5)
  const recentHistory = [...product.history].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  async function handleSaveObservation() {
    setIsSavingObservation(true)
    try {
      await onAddObservation?.(observation)
    } finally {
      setIsSavingObservation(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">{product.studentName}</p>
            <p className="text-xs text-muted-foreground">{product.objective}</p>
          </div>
          <span className="text-2xl font-bold text-primary">{product.progressPercentage}%</span>
        </div>
        <Progress value={product.progressPercentage} className="h-2.5" />

        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          {product.careerName ? (
            <div>
              <p className="text-muted-foreground">Carrera</p>
              <p className="font-medium">{product.careerName}</p>
            </div>
          ) : null}
          {product.subjectName ? (
            <div>
              <p className="text-muted-foreground">Materia</p>
              <p className="font-medium">{product.subjectName}</p>
            </div>
          ) : null}
          <div>
            <p className="text-muted-foreground">Profesor asignado</p>
            <p className="flex items-center gap-1 font-medium"><User className="size-3" />{product.professorName ?? 'Sin asignar'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Versión</p>
            <p className="font-medium">v{product.version}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Creado</p>
            <p className="font-medium">{formatDate(product.createdAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Actualizado</p>
            <p className="font-medium">{formatDate(product.updatedAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center gap-1"><ListChecks className="size-3" />Entregables</p>
            <p className="font-medium">{product.completedDeliverables} completados · {product.pendingDeliverables} pendientes</p>
          </div>
          <div>
            <p className="text-muted-foreground">Estado</p>
            <p className="font-medium capitalize">{product.status.replace('_', ' ')}</p>
          </div>
        </div>

        {product.competencies.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {product.competencies.map((competency) => (
              <Badge key={competency} variant="outline" className="gap-1"><Award className="size-3" />{competency}</Badge>
            ))}
          </div>
        ) : null}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4 space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><FileClock className="size-3.5" />Últimas modificaciones</p>
          {recentHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin movimientos todavía.</p>
          ) : (
            recentHistory.map((entry) => (
              <p key={entry.id} className="text-xs">
                <span className="text-muted-foreground">{formatDate(entry.createdAt)} · </span>
                {entry.actorName}{entry.detail ? ` — ${entry.detail}` : ''}
              </p>
            ))
          )}
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Archivos recientes</p>
          {recentFiles.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin archivos todavía.</p>
          ) : (
            recentFiles.map((file) => (
              <button key={file.id} type="button" onClick={() => onDownloadFile?.(file.id)} className="block text-xs text-primary hover:underline">
                {file.name} · v{file.version}
              </button>
            ))
          )}
        </Card>
      </div>

      <div className="space-y-3">
        {product.phases.map((phase) => (
          <TitulacionPhaseCard
            key={phase.id}
            phase={phase}
            isExpanded={expandedPhase === phase.id}
            onToggle={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
            mode={mode}
            actor={actor}
            onSaveDraft={onSaveDraft ? (deliverableId, content, files) => onSaveDraft(phase.id, deliverableId, content, files) : undefined}
            onPublishPhase={onPublishPhase ? (comment) => onPublishPhase(phase.id, comment) : undefined}
            onDuplicateVersion={onDuplicateVersion ? (versionNumber) => onDuplicateVersion(phase.id, versionNumber) : undefined}
            onAddFeedback={onAddFeedback ? (type, content) => onAddFeedback(phase.id, type, content) : undefined}
            onReviewPhase={onReviewPhase ? (action, feedback) => onReviewPhase(phase.id, action, feedback) : undefined}
            onDownloadFile={onDownloadFile}
          />
        ))}
      </div>

      <Card className="p-5 bg-amber-50 border-amber-200">
        <p className="text-sm font-semibold text-amber-900 mb-2">Observaciones generales</p>
        {mode === 'profesor' ? (
          <div className="space-y-2">
            <Textarea value={observation} onChange={(event) => setObservation(event.target.value)} className="min-h-16 text-sm" />
            <Button size="sm" variant="outline" onClick={handleSaveObservation} disabled={isSavingObservation}>
              Guardar observación
            </Button>
          </div>
        ) : (
          <p className="text-sm text-amber-800">{product.observations || 'Sin observaciones todavía.'}</p>
        )}
      </Card>

      <div className="space-y-2">
        <p className="text-sm font-semibold">Historial completo</p>
        <TitulacionHistoryPanel entries={product.history} />
      </div>
    </div>
  )
}
