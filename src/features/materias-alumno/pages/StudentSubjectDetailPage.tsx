import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BookOpen, FileText, Bell, MessageCircle } from 'lucide-react'
import { getSubjectDetailAsync } from '@/services/subject.service'
import type { SubjectDetail } from '@/types/subject'
import { PageHeader } from '@/components/PageHeader'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { SubjectSectionCard } from '@/components/SubjectSectionCard'
import { ActivityList } from '@/components/ActivityList'
import { MaterialList } from '@/components/MaterialList'
import { AnnouncementList } from '@/components/AnnouncementList'
import { OpenChatButton } from '@/features/comunicacion/components/OpenChatButton'

export function StudentSubjectDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>()
  const navigate = useNavigate()
  const [subject, setSubject] = useState<SubjectDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!subjectId) return

    const loadSubject = async () => {
      try {
        const data = await getSubjectDetailAsync(subjectId, 'alumno')
        setSubject(data)
      } catch (error) {
        console.error('Error loading subject:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSubject()
  }, [subjectId])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Materia no encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[
          { label: 'Inicio', to: '/alumno' },
          { label: 'Materias', to: '/alumno/materias' },
          { label: subject.summary.name },
        ]}
        backTo="/alumno/materias"
        backLabel="Volver a Materias"
        title={subject.summary.name}
        subtitle={subject.summary.code}
      />

      <div>
        <div className="grid gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Información de la Materia</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Profesor</p>
                <p className="font-medium">{subject.teacher || 'No asignado'}</p>
                {subject.teacher ? (
                  <OpenChatButton
                    recipientId="usr-profesor-001"
                    recipientName={subject.teacher}
                    label="Enviar mensaje"
                    icon={MessageCircle}
                    className="mt-2"
                    contextType="actividad"
                    contextId={subjectId}
                    contextLabel={subject.summary.name}
                  />
                ) : null}
              </div>
              <div>
                <p className="text-muted-foreground">Créditos</p>
                <p className="font-medium">{subject.summary.credits}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">{subject.summary.description}</p>
          </div>

          {subject.progress !== undefined && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Tu Avance en la Materia</h3>
                <span className="text-sm font-medium">{subject.progress}%</span>
              </div>
              <Progress value={subject.progress} className="h-3" />
            </div>
          )}
        </div>
      </div>

      <SubjectSectionCard
        title="Actividades"
        icon={BookOpen}
        isEmpty={subject.activities.length === 0}
        emptyMessage="No hay actividades programadas"
      >
        <ActivityList
          activities={subject.activities}
          onSelect={(activity) => navigate(`/alumno/materias/${subjectId}/actividades/${activity.id}`)}
        />
      </SubjectSectionCard>

      <SubjectSectionCard
        title="Materiales"
        icon={FileText}
        isEmpty={subject.materials.length === 0}
        emptyMessage="No hay materiales disponibles"
      >
        <MaterialList materials={subject.materials} />
      </SubjectSectionCard>

      <SubjectSectionCard
        title="Avisos"
        icon={Bell}
        isEmpty={subject.announcements.length === 0}
        emptyMessage="No hay avisos"
      >
        <AnnouncementList announcements={subject.announcements} />
      </SubjectSectionCard>
    </div>
  )
}
