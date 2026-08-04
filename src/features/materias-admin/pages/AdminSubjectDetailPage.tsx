import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { getSubjectDetailAsync } from '@/services/subject.service'
import type { SubjectDetail } from '@/types/subject'
import { PageHeader } from '@/components/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { SubjectSectionCard } from '@/components/SubjectSectionCard'
import { ActivityList } from '@/components/ActivityList'
import { MaterialList } from '@/components/MaterialList'
import { AnnouncementList } from '@/components/AnnouncementList'

export function AdminSubjectDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>()
  const [subject, setSubject] = useState<SubjectDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!subjectId) return

    const loadSubject = async () => {
      try {
        const data = await getSubjectDetailAsync(subjectId, 'administrador')
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
          { label: 'Inicio', to: '/admin' },
          { label: 'Materias', to: '/admin/materias' },
          { label: subject.summary.name },
        ]}
        backTo="/admin/materias"
        backLabel="Volver a Materias"
        title={subject.summary.name}
        subtitle={subject.summary.code}
      />

      <div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Créditos</p>
            <p className="text-2xl font-bold">{subject.summary.credits}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Descripción</p>
            <p className="text-sm">{subject.summary.description}</p>
          </div>
        </div>
      </div>

      <SubjectSectionCard
        title="Actividades"
        icon={BookOpen}
        isEmpty={subject.activities.length === 0}
        emptyMessage="No hay actividades programadas"
      >
        <ActivityList activities={subject.activities} />
      </SubjectSectionCard>

      <SubjectSectionCard
        title="Materiales"
        icon={BookOpen}
        isEmpty={subject.materials.length === 0}
        emptyMessage="No hay materiales disponibles"
      >
        <MaterialList materials={subject.materials} />
      </SubjectSectionCard>

      <SubjectSectionCard
        title="Avisos"
        icon={BookOpen}
        isEmpty={subject.announcements.length === 0}
        emptyMessage="No hay avisos"
      >
        <AnnouncementList announcements={subject.announcements} />
      </SubjectSectionCard>
    </div>
  )
}
