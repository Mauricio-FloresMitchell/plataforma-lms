import { useCallback, useEffect, useState } from 'react'
import { Award, CalendarClock, CheckCircle2, Download, GraduationCap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getAssignedCoursesAsync, getCertificatesAsync, markCourseCompletedAsync } from '@/services/course.service'
import { downloadPrintableHtml } from '@/utils/export'
import type { AssignedCourse, Certificate } from '@/types/course'

type Tab = 'activos' | 'finalizados' | 'certificados'

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface CursosCertificacionesPanelProps {
  /** Sprint 17, Parte 12: módulo fusionado, visible en los 3 perfiles. Solo el Alumno puede marcar cursos como completados. */
  canManage?: boolean
  initialTab?: Tab
}

/** Cursos Asignados + Certificaciones fusionados en un solo módulo (Sprint 17, Parte 12). */
export function CursosCertificacionesPanel({ canManage = false, initialTab = 'activos' }: CursosCertificacionesPanelProps) {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>(initialTab)
  const [courses, setCourses] = useState<AssignedCourse[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(() => {
    setIsLoading(true)
    Promise.all([getAssignedCoursesAsync(), getCertificatesAsync()])
      .then(([courseData, certData]) => {
        setCourses(courseData)
        setCertificates(certData)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleComplete(course: AssignedCourse) {
    await markCourseCompletedAsync(course.id)
    load()
  }

  function handleDownload(certificate: Certificate) {
    downloadPrintableHtml(
      `certificado-${certificate.courseId}.html`,
      'Certificado de finalización',
      `<p style="margin-top:1.5rem">Se otorga el presente certificado a</p>
       <h2 style="font-size:1.5rem;margin:0.5rem 0">${user?.name ?? ''}</h2>
       <p>por haber completado satisfactoriamente el curso</p>
       <h3 style="margin:0.5rem 0">${certificate.courseTitle}</h3>
       <p style="color:#666">${certificate.category}</p>
       <p style="margin-top:1.5rem">Fecha de emisión: ${formatDate(certificate.issuedAt)}</p>`,
    )
  }

  const active = courses.filter((course) => course.status === 'activo')
  const finished = courses.filter((course) => course.status === 'finalizado')

  const tabs: { value: Tab; label: string }[] = [
    { value: 'activos', label: `Activos (${active.length})` },
    { value: 'finalizados', label: `Finalizados (${finished.length})` },
    { value: 'certificados', label: `Certificados (${certificates.length})` },
  ]

  if (isLoading) {
    return <ListSkeleton variant="block" count={3} blockHeight="h-32" />
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-border">
        {tabs.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              tab === item.value ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'activos' ? (
        active.length === 0 ? (
          <EmptyState icon={GraduationCap} title="Sin cursos activos" description="No hay cursos complementarios en curso." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {active.map((course) => (
              <Card key={course.id} className="p-5">
                <Badge variant="outline" className="mb-1.5">
                  {course.category}
                </Badge>
                <h3 className="text-sm font-semibold">{course.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{course.description}</p>
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progreso</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarClock className="size-3.5" />
                    Inicio: {formatDate(course.startDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarClock className="size-3.5" />
                    Límite: {formatDate(course.dueDate)}
                  </span>
                </div>
                {canManage && course.progress >= 100 ? (
                  <Button size="sm" className="mt-4" onClick={() => handleComplete(course)}>
                    <CheckCircle2 className="size-3.5" />
                    Marcar como completado
                  </Button>
                ) : null}
              </Card>
            ))}
          </div>
        )
      ) : null}

      {tab === 'finalizados' ? (
        finished.length === 0 ? (
          <EmptyState icon={GraduationCap} title="Sin cursos finalizados" description="Todavía no hay cursos finalizados." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {finished.map((course) => (
              <Card key={course.id} className="p-5">
                <Badge variant="outline" className="mb-1.5">
                  {course.category}
                </Badge>
                <h3 className="text-sm font-semibold">{course.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{course.description}</p>
                <Badge className="mt-3 bg-green-100 text-green-800">Finalizado</Badge>
              </Card>
            ))}
          </div>
        )
      ) : null}

      {tab === 'certificados' ? (
        certificates.length === 0 ? (
          <EmptyState icon={Award} title="Sin certificados" description="Los certificados de cursos finalizados aparecerán aquí." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {certificates.map((certificate) => (
              <Card key={certificate.id} className="p-5">
                <Badge variant="outline" className="mb-1.5">
                  {certificate.category}
                </Badge>
                <h3 className="text-sm font-semibold">{certificate.courseTitle}</h3>
                <p className="mt-1 text-xs text-muted-foreground">Emitido el {formatDate(certificate.issuedAt)}</p>
                <Button size="sm" variant="outline" className="mt-4" onClick={() => handleDownload(certificate)}>
                  <Download className="size-3.5" />
                  Descargar certificado
                </Button>
              </Card>
            ))}
          </div>
        )
      ) : null}
    </div>
  )
}
