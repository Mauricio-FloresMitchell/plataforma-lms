import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  createActivityAsync,
  getActivityAsync,
  getSubjectDetailAsync,
  updateActivityAsync,
} from '@/services/subject.service'
import type { Activity, RubricCriterion } from '@/types/subject'
import { ActivityForm } from '../components/ActivityForm'
import type { ActivityFormValues } from '../schemas/activity-schema'

/** Crea o edita una actividad de la materia (según exista :activityId en la ruta). */
export function ActivityFormPage() {
  const { subjectId, activityId } = useParams<{ subjectId: string; activityId?: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditing = Boolean(activityId)

  const [subjectName, setSubjectName] = useState('')
  const [activity, setActivity] = useState<Activity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!subjectId) return
      try {
        const subject = await getSubjectDetailAsync(subjectId, 'profesor')
        setSubjectName(subject?.summary.name ?? '')

        if (activityId) {
          const data = await getActivityAsync(subjectId, activityId)
          setActivity(data)
        }
      } catch (err) {
        console.error('Error loading activity form data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [subjectId, activityId])

  async function handleSubmit(values: ActivityFormValues, attachments: Activity['attachments'], rubric: RubricCriterion[]) {
    if (!subjectId) return
    setError(null)
    try {
      const input = { ...values, attachments: attachments ?? [], rubric: rubric.length > 0 ? rubric : undefined }
      if (isEditing && activityId) {
        await updateActivityAsync(subjectId, activityId, input)
      } else {
        await createActivityAsync(subjectId, input, user?.name ?? '')
      }
      navigate(`/profesor/materias/${subjectId}`)
    } catch {
      setError('No pudimos guardar la actividad. Inténtalo de nuevo.')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (isEditing && !activity) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Actividad no encontrada</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        breadcrumb={[
          { label: 'Inicio', to: '/profesor' },
          { label: 'Materias', to: '/profesor/materias' },
          { label: subjectName, to: `/profesor/materias/${subjectId}` },
          { label: isEditing ? 'Editar actividad' : 'Nueva actividad' },
        ]}
        backTo={`/profesor/materias/${subjectId}`}
        backLabel="Volver a la materia"
        title={isEditing ? 'Editar actividad' : 'Nueva actividad'}
        subtitle={subjectName}
      />

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="shadow-sm">
        <CardContent>
          <ActivityForm
            defaultValues={activity ?? undefined}
            defaultAttachments={activity?.attachments ?? []}
            defaultRubric={activity?.rubric ?? []}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Guardar cambios' : 'Crear actividad'}
          />
        </CardContent>
      </Card>
    </div>
  )
}
