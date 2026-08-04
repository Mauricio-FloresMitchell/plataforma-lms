import { useState } from 'react'
import { CheckCircle2, Circle, Copy, Loader2, Send, ThumbsDown, ThumbsUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TitulacionFileUploader } from '@/components/TitulacionFileUploader'
import type { TitulacionFeedbackType, TitulacionFile, TitulacionPhase, TitulacionPhaseStatus } from '@/types/titulacion'

interface TitulacionPhaseCardProps {
  phase: TitulacionPhase
  isExpanded: boolean
  onToggle: () => void
  mode: 'alumno' | 'profesor' | 'readonly'
  actor: { id: string; name: string } | null
  onSaveDraft?: (deliverableId: string, content: string, files: TitulacionFile[]) => Promise<void>
  onPublishPhase?: (comment: string) => Promise<void>
  onDuplicateVersion?: (versionNumber: number) => Promise<void>
  onAddFeedback?: (type: Exclude<TitulacionFeedbackType, 'aprobacion' | 'rechazo'>, content: string) => Promise<void>
  onReviewPhase?: (action: 'aprobada' | 'rechazada', feedback: string) => Promise<void>
  onDownloadFile?: (fileId: string) => void
}

const PHASE_STATUS_CONFIG: Record<TitulacionPhaseStatus, { color: string; label: string }> = {
  pendiente: { color: 'bg-muted text-muted-foreground', label: 'Pendiente' },
  en_proceso: { color: 'bg-blue-100 text-blue-800', label: 'En proceso' },
  enviada: { color: 'bg-amber-100 text-amber-800', label: 'Enviada a revisión' },
  aprobada: { color: 'bg-green-100 text-green-800', label: 'Aprobada' },
  rechazada: { color: 'bg-red-100 text-red-800', label: 'Rechazada' },
  bloqueada: { color: 'bg-slate-200 text-slate-700', label: 'Bloqueada' },
}

const FEEDBACK_TYPE_LABEL: Record<TitulacionFeedbackType, string> = {
  comentario: 'Comentario',
  aprobacion: 'Aprobación',
  rechazo: 'Rechazo',
  solicitud_cambios: 'Solicitud de cambios',
  observacion: 'Observación',
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Tarjeta de una fase del Producto de Titulación (Sprint 18): entregables, versionado, retroalimentación y revisión. */
export function TitulacionPhaseCard({
  phase,
  isExpanded,
  onToggle,
  mode,
  actor,
  onSaveDraft,
  onPublishPhase,
  onDuplicateVersion,
  onAddFeedback,
  onReviewPhase,
  onDownloadFile,
}: TitulacionPhaseCardProps) {
  const [drafts, setDrafts] = useState<Record<string, { content: string; files: TitulacionFile[] }>>({})
  const [publishComment, setPublishComment] = useState('')
  const [feedbackType, setFeedbackType] = useState<Exclude<TitulacionFeedbackType, 'aprobacion' | 'rechazo'>>('comentario')
  const [feedbackContent, setFeedbackContent] = useState('')
  const [reviewFeedback, setReviewFeedback] = useState('')
  const [compareA, setCompareA] = useState<number | null>(null)
  const [compareB, setCompareB] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const config = PHASE_STATUS_CONFIG[phase.status]
  const canEdit = mode === 'alumno' && phase.status !== 'aprobada' && phase.status !== 'bloqueada'
  const versionA = phase.versions.find((v) => v.version === compareA)
  const versionB = phase.versions.find((v) => v.version === compareB)

  function draftFor(deliverableId: string, content: string, files: TitulacionFile[]) {
    return drafts[deliverableId] ?? { content, files }
  }

  async function runSaving(action: () => Promise<void>) {
    setIsSaving(true)
    try {
      await action()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="p-4">
      <button type="button" className="flex w-full items-center justify-between gap-3 text-left" onClick={onToggle}>
        <div>
          <span className="text-sm font-semibold">{phase.title}</span>
          <p className="text-xs text-muted-foreground">Versión {phase.version}</p>
        </div>
        <Badge className={config.color}>{config.label}</Badge>
      </button>

      {isExpanded ? (
        <div className="mt-3 space-y-4">
          {phase.description ? <p className="text-sm text-muted-foreground">{phase.description}</p> : null}
          {phase.objectives.length > 0 ? (
            <ul className="list-inside list-disc text-xs text-muted-foreground">
              {phase.objectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          ) : null}

          <div className="space-y-3">
            {phase.deliverables.map((deliverable) => {
              const draft = draftFor(deliverable.id, deliverable.draftContent ?? '', deliverable.files)
              return (
                <div key={deliverable.id} className="rounded-md border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {deliverable.status === 'aprobado' ? (
                        <CheckCircle2 className="size-4 text-green-600" />
                      ) : (
                        <Circle className="size-4 text-muted-foreground" />
                      )}
                      {deliverable.title}
                    </span>
                    {deliverable.dueDate ? <span className="text-xs text-muted-foreground">{formatDate(deliverable.dueDate)}</span> : null}
                  </div>

                  {canEdit ? (
                    <>
                      <Textarea
                        placeholder="Redacta tu borrador aquí…"
                        value={draft.content}
                        onChange={(event) => setDrafts((prev) => ({ ...prev, [deliverable.id]: { ...draft, content: event.target.value } }))}
                        className="min-h-20 text-sm"
                      />
                      <TitulacionFileUploader
                        files={draft.files}
                        uploader={actor ?? { id: 'usr-alumno-001', name: 'Alumno' }}
                        onChange={(files) => setDrafts((prev) => ({ ...prev, [deliverable.id]: { ...draft, files } }))}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isSaving}
                        onClick={() => runSaving(() => onSaveDraft?.(deliverable.id, draft.content, draft.files) ?? Promise.resolve())}
                      >
                        Guardar borrador
                      </Button>
                    </>
                  ) : (
                    <>
                      {deliverable.draftContent ? <p className="text-xs text-muted-foreground whitespace-pre-line">{deliverable.draftContent}</p> : null}
                      {deliverable.files.length > 0 ? (
                        <ul className="space-y-1">
                          {deliverable.files.map((file) => (
                            <li key={file.id}>
                              <button type="button" onClick={() => onDownloadFile?.(file.id)} className="text-xs text-primary hover:underline">
                                {file.name} · v{file.version} ({file.kind})
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </>
                  )}

                  {deliverable.evidence.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {deliverable.evidence.map((evidence) => (
                        <Badge key={evidence.id} variant="outline">
                          {evidence.label}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>

          {mode === 'alumno' && canEdit ? (
            <div className="space-y-2 rounded-md border border-dashed border-border p-3">
              <Textarea
                placeholder="Comentario de esta versión (qué cambió)…"
                value={publishComment}
                onChange={(event) => setPublishComment(event.target.value)}
                className="min-h-14 text-sm"
              />
              <Button
                size="sm"
                disabled={isSaving || !publishComment.trim()}
                onClick={() => runSaving(async () => { await onPublishPhase?.(publishComment); setPublishComment('') })}
              >
                {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                Publicar versión final de la fase
              </Button>
            </div>
          ) : null}

          {mode === 'profesor' ? (
            <div className="space-y-2 rounded-md border border-border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Select value={feedbackType} onValueChange={(value) => setFeedbackType(value as typeof feedbackType)}>
                  <SelectTrigger className="h-8 w-48 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comentario">Comentario</SelectItem>
                    <SelectItem value="solicitud_cambios">Solicitud de cambios</SelectItem>
                    <SelectItem value="observacion">Observación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="Retroalimentación para esta fase…"
                value={feedbackContent}
                onChange={(event) => setFeedbackContent(event.target.value)}
                className="min-h-14 text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                disabled={isSaving || !feedbackContent.trim()}
                onClick={() => runSaving(async () => { await onAddFeedback?.(feedbackType, feedbackContent); setFeedbackContent('') })}
              >
                Enviar retroalimentación
              </Button>

              {phase.status === 'enviada' ? (
                <div className="space-y-2 border-t border-border pt-2">
                  <Textarea
                    placeholder="Retroalimentación obligatoria para aprobar o rechazar…"
                    value={reviewFeedback}
                    onChange={(event) => setReviewFeedback(event.target.value)}
                    className="min-h-14 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={isSaving || !reviewFeedback.trim()}
                      onClick={() => runSaving(async () => { await onReviewPhase?.('aprobada', reviewFeedback); setReviewFeedback('') })}
                    >
                      <ThumbsUp className="size-3.5" />
                      Aprobar fase
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isSaving || !reviewFeedback.trim()}
                      onClick={() => runSaving(async () => { await onReviewPhase?.('rechazada', reviewFeedback); setReviewFeedback('') })}
                    >
                      <ThumbsDown className="size-3.5" />
                      Rechazar fase
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {phase.feedback.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">Retroalimentación</p>
              {phase.feedback.map((entry) => (
                <div key={entry.id} className="rounded-md bg-muted/40 p-2.5 text-sm">
                  <p className="text-xs font-medium text-muted-foreground">
                    {FEEDBACK_TYPE_LABEL[entry.type]} · {entry.authorName} · {formatDate(entry.createdAt)}
                  </p>
                  <p>{entry.content}</p>
                </div>
              ))}
            </div>
          ) : null}

          {phase.versions.length > 0 ? (
            <div className="space-y-2 border-t border-border pt-3">
              <p className="text-xs font-semibold text-muted-foreground">Versiones</p>
              <ul className="space-y-1.5">
                {phase.versions.map((snapshot) => (
                  <li key={snapshot.version} className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-xs">
                    <div>
                      <p className="font-medium">v{snapshot.version} · {snapshot.authorName} · {formatDate(snapshot.createdAt)}</p>
                      <p className="text-muted-foreground">{snapshot.comment}</p>
                    </div>
                    {mode === 'alumno' && phase.status !== 'aprobada' && phase.status !== 'bloqueada' ? (
                      <Button size="sm" variant="ghost" disabled={isSaving} onClick={() => runSaving(() => onDuplicateVersion?.(snapshot.version) ?? Promise.resolve())}>
                        <Copy className="size-3.5" />
                        Duplicar
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>

              {phase.versions.length > 1 ? (
                <div className="space-y-2 rounded-md bg-muted/30 p-3">
                  <p className="text-xs font-semibold text-muted-foreground">Comparar versiones</p>
                  <div className="flex flex-wrap gap-2">
                    <Select value={compareA?.toString() ?? ''} onValueChange={(value) => setCompareA(Number(value))}>
                      <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Versión A" /></SelectTrigger>
                      <SelectContent>
                        {phase.versions.map((v) => <SelectItem key={v.version} value={v.version.toString()}>v{v.version}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={compareB?.toString() ?? ''} onValueChange={(value) => setCompareB(Number(value))}>
                      <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Versión B" /></SelectTrigger>
                      <SelectContent>
                        {phase.versions.map((v) => <SelectItem key={v.version} value={v.version.toString()}>v{v.version}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {versionA && versionB ? (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {[versionA, versionB].map((v) => (
                        <div key={v.version} className="space-y-1 rounded-md border border-border bg-background p-2">
                          <p className="font-medium">v{v.version} · {v.authorName}</p>
                          <p className="text-muted-foreground">{formatDate(v.createdAt)}</p>
                          <p>{v.comment}</p>
                          <p className="text-muted-foreground">{v.changesSummary}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}
