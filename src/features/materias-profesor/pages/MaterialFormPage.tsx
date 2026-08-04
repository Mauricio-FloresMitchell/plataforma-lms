import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { createMaterialAsync, getSubjectDetailAsync } from '@/services/subject.service'
import { MaterialForm } from '../components/MaterialForm'
import type { MaterialFormValues } from '../schemas/material-schema'

/** Crea un nuevo material para la materia. */
export function MaterialFormPage() {
  const { subjectId } = useParams<{ subjectId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [subjectName, setSubjectName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!subjectId) return
      try {
        const subject = await getSubjectDetailAsync(subjectId, 'profesor')
        setSubjectName(subject?.summary.name ?? '')
      } catch (err) {
        console.error('Error loading material form data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [subjectId])

  async function handleSubmit(values: MaterialFormValues) {
    if (!subjectId) return
    setError(null)
    try {
      await createMaterialAsync(
        subjectId,
        {
          title: values.title,
          type: values.type,
          url: values.url,
          description: values.description || undefined,
          category: values.category,
          tags: values.tags && values.tags.length > 0 ? values.tags : undefined,
          isHidden: values.isHidden,
          scheduledAt: values.scheduledAt || undefined,
        },
        user?.name ?? '',
      )
      navigate(`/profesor/materias/${subjectId}`)
    } catch {
      setError('No pudimos guardar el material. Inténtalo de nuevo.')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-72" />
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
          { label: 'Nuevo material' },
        ]}
        backTo={`/profesor/materias/${subjectId}`}
        backLabel="Volver a la materia"
        title="Nuevo material"
        subtitle={subjectName}
      />

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="shadow-sm">
        <CardContent>
          <MaterialForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  )
}
