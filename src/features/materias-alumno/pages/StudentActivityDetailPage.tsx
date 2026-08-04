import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, Clock, AlertCircle, FileText, MessageCircle, Paperclip, History } from 'lucide-react'
import {
  getActivityAsync,
  getActivitySubmissionAsync,
  getSubjectDetailAsync,
  submitActivityAsync,
} from '@/services/subject.service'
import type { Activity, ActivitySubmission, MockAttachment, SubjectDetail } from '@/types/subject'
import { PageHeader } from '@/components/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SubjectSectionCard } from '@/components/SubjectSectionCard'
import { MaterialList } from '@/components/MaterialList'
import { MockFileInput } from '@/components/MockFileInput'
import { BadgeList } from '@/components/BadgeList'
import { EmptyState } from '@/components/EmptyState'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { OpenChatButton } from '@/features/comunicacion/components/OpenChatButton'

const statusConfig = {
  completada: { icon: CheckCircle2, color: 'bg-green-100 text-green-800', label: 'Completada' },
  pendiente: { icon: Clock, color: 'bg-blue-100 text-blue-800', label: 'Pendiente' },
  atrasada: { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Atrasada' },
}

const submissionStatusConfig = {
  no_entregado: { color: 'bg-muted text-muted-foreground', label: 'Sin entregar' },
  entregado: { color: 'bg-blue-100 text-blue-800', label: 'Entregado' },
  evaluado: { color: 'bg-green-100 text-green-800', label: 'Evaluado' },
}

export function StudentActivityDetailPage() {
  const { subjectId, activityId } = useParams<{ subjectId: string; activityId: string }>()
  const { user } = useAuth()

  const [subject, setSubject] = useState<SubjectDetail | null>(null)
  const [activity, setActivity] = useState<Activity | null>(null)
  const [submission, setSubmission] = useState<ActivitySubmission | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [files, setFiles] = useState<MockAttachment[]>([])
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!subjectId || !activityId || !user) return
    setIsLoading(true)
    try {
      const [subjectData, activityData, submissionData] = await Promise.all([
        getSubjectDetailAsync(subjectId, 'alumno'),
        getActivityAsync(subjectId, activityId),
        getActivitySubmissionAsync(activityId, user.id),
      ])
      setSubject(subjectData)
      setActivity(activityData)
      setSubmission(submissionData)
      setFiles(submissionData?.files ?? [])
      setComment(submissionData?.comment ?? '')
    } catch (err) {
      console.error('Error loading activity detail:', err)
    } finally {
      setIsLoading(false)
    }
  }, [subjectId, activityId, user])

  useEffect(() => {
    load()
  }, [load])

  async function handleSubmit() {
    if (!subjectId || !activityId || !user) return
    if (files.length === 0) {
      setError('Adjunta al menos un archivo antes de enviar tu entrega.')
      return
    }
    setError(null)
    setConfirmation(null)
    setIsSubmitting(true)
    try {
      const result = await submitActivityAsync(subjectId, activityId, { id: user.id, name: user.name }, { files, comment: comment.trim() || undefined })
      setSubmission(result)
      setConfirmation(
        result.isLate
          ? 'Tu entrega se registró fuera de tiempo, pero fue enviada correctamente.'
          : 'Tu entrega se envió correctamente.',
      )
    } catch {
      setError('No pudimos registrar tu entrega. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    )
  }

  if (!subject || !activity) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Actividad no encontrada</p>
      </div>
    )
  }

  const config = statusConfig[activity.status]
  const StatusIcon = config.icon
  const submissionStatus = submissionStatusConfig[submission?.status ?? 'no_entregado']
  const isLocked = submission?.status === 'evaluado'
  const isPastDue = new Date() > new Date(activity.dueDate)

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[
          { label: 'Inicio', to: '/alumno' },
          { label: 'Materias', to: '/alumno/materias' },
          { label: subject.summary.name, to: `/alumno/materias/${subjectId}` },
          { label: activity.title },
        ]}
        backTo={`/alumno/materias/${subjectId}`}
        backLabel="Volver a la materia"
        title={activity.title}
        subtitle={subject.summary.name}
        actions={
          subject.teacher ? (
            <OpenChatButton
              recipientId="usr-profesor-001"
              recipientName={subject.teacher}
              label="Enviar mensaje"
              icon={MessageCircle}
              contextType="actividad"
              contextId={activityId}
              contextLabel={activity.title}
            />
          ) : undefined
        }
      />

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={config.color}>
            <StatusIcon className="size-3.5" />
            {config.label}
          </Badge>
          <Badge className={submissionStatus.color} variant="secondary">
            {submissionStatus.label}
          </Badge>
          {activity.weightPercentage !== undefined ? (
            <Badge variant="outline">Vale {activity.weightPercentage}% de la materia</Badge>
          ) : null}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-1">Descripción</h2>
          <p className="text-sm">{activity.description}</p>
        </div>

        {activity.instructions ? (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-1">Instrucciones</h2>
            <p className="whitespace-pre-line text-sm">{activity.instructions}</p>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Profesor</p>
            <p className="font-medium">{subject.teacher || 'No asignado'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Fecha de entrega</p>
            <p className={`font-medium ${isPastDue && submission?.status !== 'evaluado' ? 'text-destructive' : ''}`}>
              {new Date(activity.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {activity.rubric && activity.rubric.length > 0 ? (
        <SubjectSectionCard title="Rúbrica de evaluación" icon={FileText} isEmpty={false}>
          <div className="space-y-2">
            {activity.rubric.map((criterion) => (
              <div key={criterion.id} className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{criterion.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{criterion.description}</p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {criterion.weight} pts
                </Badge>
              </div>
            ))}
          </div>
        </SubjectSectionCard>
      ) : null}

      {activity.attachments && activity.attachments.length > 0 ? (
        <SubjectSectionCard title="Archivos del profesor" icon={Paperclip} isEmpty={false}>
          <ul className="flex flex-col gap-1.5">
            {activity.attachments.map((file) => (
              <li key={file.id} className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{file.name}</span>
              </li>
            ))}
          </ul>
        </SubjectSectionCard>
      ) : null}

      <SubjectSectionCard
        title="Material complementario"
        icon={FileText}
        isEmpty={subject.materials.length === 0}
        emptyMessage="No hay material complementario para esta materia"
      >
        <MaterialList materials={subject.materials} />
      </SubjectSectionCard>

      <SubjectSectionCard title="Tu entrega" icon={CheckCircle2} isEmpty={false}>
        <div className="space-y-4">
          {confirmation ? (
            <Alert>
              <CheckCircle2 className="size-4" />
              <AlertDescription>{confirmation}</AlertDescription>
            </Alert>
          ) : null}
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {isLocked ? (
            <p className="text-sm text-muted-foreground">
              Tu entrega ya fue evaluada y no se puede modificar. Revisa la retroalimentación más abajo.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <MockFileInput
                  label="Adjuntar archivo"
                  kind="archivo"
                  attachments={files.filter((f) => f.kind === 'archivo')}
                  onAdd={(a) => setFiles((prev) => [...prev, a])}
                  onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
                />
                <MockFileInput
                  label="Adjuntar imagen"
                  kind="imagen"
                  accept="image/*"
                  attachments={files.filter((f) => f.kind === 'imagen')}
                  onAdd={(a) => setFiles((prev) => [...prev, a])}
                  onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="submission-comment">Comentario de entrega (opcional)</Label>
                <Textarea
                  id="submission-comment"
                  rows={3}
                  placeholder="Agrega notas para tu profesor sobre esta entrega…"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                />
              </div>

              <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
                {isSubmitting ? 'Enviando…' : submission ? 'Reemplazar entrega' : 'Enviar actividad'}
              </Button>

              {submission ? (
                <p className="text-xs text-muted-foreground">
                  Última entrega: {new Date(submission.submittedAt).toLocaleString('es-ES')}
                  {submission.isLate ? ' · fuera de tiempo' : ''}
                </p>
              ) : null}
            </>
          )}

          {submission && submission.history.length > 0 ? (
            <div>
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground mb-2">
                <History className="size-4" />
                Historial de entregas
              </h3>
              <ul className="space-y-2">
                {submission.history.map((version, index) => (
                  <li key={index} className="rounded-md border border-border px-3 py-2 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">
                      {new Date(version.submittedAt).toLocaleString('es-ES')}
                    </p>
                    <p>{version.files.map((f) => f.name).join(', ')}</p>
                    {version.comment ? <p className="mt-0.5 italic">"{version.comment}"</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </SubjectSectionCard>

      {submission?.status === 'evaluado' ? (
        <SubjectSectionCard title="Evaluación de tu entrega" icon={CheckCircle2} isEmpty={false}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">{submission.percentage}%</span>
              <span className="text-sm text-muted-foreground">
                Evaluado por {submission.evaluatedByName}
                {submission.evaluatedAt ? ` · ${new Date(submission.evaluatedAt).toLocaleDateString('es-ES')}` : ''}
              </span>
            </div>

            {submission.feedback ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-2 text-blue-900">Retroalimentación</h3>
                <p className="text-sm text-blue-800">{submission.feedback}</p>
              </div>
            ) : null}

            {submission.observations ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-2 text-amber-900">Observaciones del profesor</h3>
                <p className="text-sm text-amber-800">{submission.observations}</p>
              </div>
            ) : null}

            {submission.badges && submission.badges.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Insignias obtenidas</h3>
                <BadgeList badges={submission.badges} />
              </div>
            ) : null}
          </div>
        </SubjectSectionCard>
      ) : submission ? (
        <EmptyState
          icon={Clock}
          title="Entrega en revisión"
          description="Tu profesor todavía no evalúa esta entrega. Cuando la evalúe, verás aquí tu retroalimentación, porcentaje e insignias."
        />
      ) : null}
    </div>
  )
}
