import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getProfessorSubjectsAsync } from '@/services/subject.service'
import { createTeacherAnnouncementAsync } from '@/services/announcement.service'
import type { MockAttachment, ProfessorSubjectListItem } from '@/types/subject'
import { AnnouncementForm } from '../components/AnnouncementForm'
import type { AnnouncementFormValues } from '../schemas/announcement-schema'

/** Crea un nuevo aviso dirigido a un alumno, un grupo o una materia completa. */
export function AnnouncementCreatePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const defaultSubjectId = searchParams.get('materia') ?? undefined

  const [subjects, setSubjects] = useState<ProfessorSubjectListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getProfessorSubjectsAsync()
      .then(setSubjects)
      .catch((err) => console.error('Error loading subjects:', err))
      .finally(() => setIsLoading(false))
  }, [])

  async function handleSubmit(
    values: AnnouncementFormValues,
    targetName: string | undefined,
    attachments: MockAttachment[],
  ) {
    if (!user) return
    setError(null)
    const subject = subjects.find((s) => s.id === values.subjectId)
    if (!subject) return

    try {
      await createTeacherAnnouncementAsync(
        {
          subjectId: values.subjectId,
          subjectName: subject.name,
          scope: values.scope,
          targetName,
          content: values.content,
          attachments,
        },
        user.name,
      )
      navigate('/profesor/avisos', { state: { sent: true } })
    } catch {
      setError('No pudimos enviar el aviso. Inténtalo de nuevo.')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        breadcrumb={[
          { label: 'Inicio', to: '/profesor' },
          { label: 'Avisos', to: '/profesor/avisos' },
          { label: 'Nuevo aviso' },
        ]}
        backTo="/profesor/avisos"
        title="Nuevo aviso"
        subtitle="Envía un aviso a un alumno, a un grupo o a toda una materia."
      />

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="shadow-sm">
        <CardContent>
          <AnnouncementForm subjects={subjects} defaultSubjectId={defaultSubjectId} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  )
}
