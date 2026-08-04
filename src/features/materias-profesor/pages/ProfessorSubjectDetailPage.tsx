import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BookOpen, FileText, Bell, Plus, Users } from 'lucide-react'
import {
  deleteActivityAsync,
  deleteMaterialAsync,
  duplicateActivityAsync,
  getSubjectDetailAsync,
  setActivityHiddenAsync,
  setMaterialHiddenAsync,
} from '@/services/subject.service'
import type { Activity, Material, SubjectDetail } from '@/types/subject'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SubjectSectionCard } from '@/components/SubjectSectionCard'
import { ActivityList } from '@/components/ActivityList'
import { MaterialList } from '@/components/MaterialList'
import { AnnouncementList } from '@/components/AnnouncementList'
import { StudentList } from '@/components/StudentList'

export function ProfessorSubjectDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>()
  const navigate = useNavigate()
  const [subject, setSubject] = useState<SubjectDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadSubject = useCallback(async () => {
    if (!subjectId) return
    try {
      const data = await getSubjectDetailAsync(subjectId, 'profesor')
      setSubject(data)
    } catch (error) {
      console.error('Error loading subject:', error)
    } finally {
      setIsLoading(false)
    }
  }, [subjectId])

  useEffect(() => {
    loadSubject()
  }, [loadSubject])

  async function handleDeleteActivity(activity: Activity) {
    if (!subjectId) return
    if (!window.confirm(`¿Eliminar la actividad "${activity.title}"? Esta acción no se puede deshacer.`)) return
    await deleteActivityAsync(subjectId, activity.id)
    loadSubject()
  }

  async function handleDuplicateActivity(activity: Activity) {
    if (!subjectId) return
    await duplicateActivityAsync(subjectId, activity.id)
    loadSubject()
  }

  async function handleToggleHiddenActivity(activity: Activity) {
    if (!subjectId) return
    await setActivityHiddenAsync(subjectId, activity.id, !activity.isHidden)
    loadSubject()
  }

  async function handleDeleteMaterial(material: Material) {
    if (!subjectId) return
    if (!window.confirm(`¿Eliminar el material "${material.title}"? Esta acción no se puede deshacer.`)) return
    await deleteMaterialAsync(subjectId, material.id)
    loadSubject()
  }

  async function handleToggleHiddenMaterial(material: Material) {
    if (!subjectId) return
    await setMaterialHiddenAsync(subjectId, material.id, !material.isHidden)
    loadSubject()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48" />
        {Array.from({ length: 4 }).map((_, i) => (
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
          { label: 'Inicio', to: '/profesor' },
          { label: 'Materias', to: '/profesor/materias' },
          { label: subject.summary.name },
        ]}
        backTo="/profesor/materias"
        backLabel="Volver a Materias"
        title={subject.summary.name}
        subtitle={subject.summary.code}
      />

      <div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">{subject.summary.description}</p>
        </div>
      </div>

      {subject.students && (
        <SubjectSectionCard
          title="Estudiantes"
          icon={Users}
          isEmpty={subject.students.length === 0}
          emptyMessage="No hay estudiantes inscritos"
        >
          <StudentList students={subject.students} />
        </SubjectSectionCard>
      )}

      <SubjectSectionCard
        title="Actividades"
        icon={BookOpen}
        isEmpty={subject.activities.length === 0}
        emptyMessage="No hay actividades programadas"
        actions={
          <Button asChild size="sm">
            <Link to={`/profesor/materias/${subjectId}/actividades/nueva`}>
              <Plus className="size-4" />
              Nueva actividad
            </Link>
          </Button>
        }
      >
        <ActivityList
          activities={subject.activities}
          onEdit={(activity) =>
            navigate(`/profesor/materias/${subjectId}/actividades/${activity.id}/editar`)
          }
          onDelete={handleDeleteActivity}
          onDuplicate={handleDuplicateActivity}
          onToggleHidden={handleToggleHiddenActivity}
        />
      </SubjectSectionCard>

      <SubjectSectionCard
        title="Materiales"
        icon={FileText}
        isEmpty={subject.materials.length === 0}
        emptyMessage="No hay materiales disponibles"
        actions={
          <Button asChild size="sm">
            <Link to={`/profesor/materias/${subjectId}/materiales/nuevo`}>
              <Plus className="size-4" />
              Nuevo material
            </Link>
          </Button>
        }
      >
        <MaterialList materials={subject.materials} onDelete={handleDeleteMaterial} onToggleHidden={handleToggleHiddenMaterial} />
      </SubjectSectionCard>

      <SubjectSectionCard
        title="Avisos"
        icon={Bell}
        isEmpty={subject.announcements.length === 0}
        emptyMessage="No hay avisos"
        actions={
          <Button asChild size="sm">
            <Link to={`/profesor/avisos/nuevo?materia=${subjectId}`}>
              <Plus className="size-4" />
              Nuevo aviso
            </Link>
          </Button>
        }
      >
        <AnnouncementList announcements={subject.announcements} />
      </SubjectSectionCard>
    </div>
  )
}
