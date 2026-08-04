import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Award, BookOpen, FileText, GraduationCap, History, Library, ScrollText, Trophy } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { getManagedUserAsync } from '@/services/userManagement.service'
import { getStudentEvaluationsAsync } from '@/services/evaluation.service'
import { getAllReportsAsync } from '@/services/admin-report.service'
import { getTitulacionProductAsync } from '@/services/titulacion.service'
import { getAssignedCoursesAsync, getCertificatesAsync } from '@/services/course.service'
import { getGlobalLeaderboardAsync } from '@/services/gamification.service'
import { getIncidentsAsync } from '@/services/incident.service'
import { getAuditLogAsync } from '@/services/audit.service'
import type { ManagedUser } from '@/types/userManagement'
import type { StudentEvaluation } from '@/types/evaluation'
import type { AdminReportView } from '@/types/report'
import type { TitulacionProduct } from '@/types/titulacion'
import type { AssignedCourse, Certificate } from '@/types/course'
import type { LeaderboardEntry } from '@/types/gamification'
import type { Incident } from '@/types/incident'
import type { AuditLogEntry } from '@/types/audit'

type RecordTab = 'academico' | 'reportes' | 'titulacion' | 'cursos' | 'leaderboard' | 'actividad'

const TABS: { value: RecordTab; label: string; icon: typeof BookOpen }[] = [
  { value: 'academico', label: 'Kardex y Evaluaciones', icon: ScrollText },
  { value: 'reportes', label: 'Reportes', icon: FileText },
  { value: 'titulacion', label: 'Producto de Titulación', icon: GraduationCap },
  { value: 'cursos', label: 'Cursos y Certificaciones', icon: Library },
  { value: 'leaderboard', label: 'Leaderboard y Badges', icon: Trophy },
  { value: 'actividad', label: 'Actividad e Incidencias', icon: History },
]

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * Expediente Académico del Alumno (Sprint 19, Parte 3): agrega en un solo
 * lugar datos que hoy viven en Usuarios, Evaluaciones, Reportes, Titulación,
 * Cursos, Leaderboard, Auditoría e Incidencias — reutiliza cada servicio tal
 * cual, no duplica ningún dato. Pensado para uso futuro de Control Escolar,
 * Servicios Escolares y Atención Estudiantil (ver sprint).
 */
export function StudentRecordPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const [user, setUser] = useState<ManagedUser | null>(null)
  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>([])
  const [reports, setReports] = useState<AdminReportView[]>([])
  const [titulacion, setTitulacion] = useState<TitulacionProduct | null>(null)
  const [courses, setCourses] = useState<AssignedCourse[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState<RecordTab>('academico')

  useEffect(() => {
    if (!studentId) return
    let active = true
    setIsLoading(true)
    Promise.all([
      getManagedUserAsync(studentId),
      getStudentEvaluationsAsync(studentId),
      getAllReportsAsync({ studentId }),
      getTitulacionProductAsync(studentId),
      getAssignedCoursesAsync(),
      getCertificatesAsync(),
      getGlobalLeaderboardAsync(),
      getIncidentsAsync(),
      getAuditLogAsync({ userId: studentId }),
    ]).then(([managedUser, studentEvaluations, studentReports, product, allCourses, allCertificates, leaderboard, allIncidents, audit]) => {
      if (!active) return
      setUser(managedUser)
      setEvaluations(studentEvaluations)
      setReports(studentReports)
      setTitulacion(product)
      setCourses(allCourses)
      setCertificates(allCertificates)
      setLeaderboardEntries(leaderboard.filter((entry) => entry.studentId === studentId))
      setIncidents(allIncidents.filter((incident) => incident.reportedById === studentId))
      setAuditEntries(audit)
    }).finally(() => {
      if (active) setIsLoading(false)
    })
    return () => {
      active = false
    }
  }, [studentId])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <ListSkeleton variant="block" count={1} blockHeight="h-32" />
        <ListSkeleton variant="row" count={5} />
      </div>
    )
  }

  if (!user) {
    return <EmptyState icon={GraduationCap} title="Alumno no encontrado" description="No existe un usuario con este identificador." />
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Usuarios', to: '/admin/usuarios' }, { label: user.name }]}
        title={`Expediente académico — ${user.name}`}
        subtitle={user.matricula ? `Matrícula ${user.matricula}` : 'Sin matrícula registrada'}
      />

      <Card className="p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Correo</p>
            <p className="text-sm font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Carrera</p>
            <p className="text-sm font-medium">{user.careerName ?? 'Sin asignar'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Grupo</p>
            <p className="text-sm font-medium">{user.groupName ?? 'Sin asignar'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estado</p>
            <Badge variant="outline" className="mt-0.5">{user.status}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Materias</p>
            <p className="text-sm font-medium">{user.subjectNames.join(', ') || 'Sin materias'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Alta</p>
            <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
          </div>
          {titulacion ? (
            <div>
              <p className="text-xs text-muted-foreground">Avance de Titulación</p>
              <p className="text-sm font-medium">{titulacion.progressPercentage}%</p>
            </div>
          ) : null}
          {leaderboardEntries[0] ? (
            <div>
              <p className="text-xs text-muted-foreground">Posición Leaderboard</p>
              <p className="text-sm font-medium">#{leaderboardEntries[0].rank} · {leaderboardEntries[0].totalPoints} pts</p>
            </div>
          ) : null}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              tab === item.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <item.icon className="size-3.5" />
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'academico' ? (
        evaluations.length === 0 ? (
          <EmptyState icon={ScrollText} title="Sin evaluaciones" description="Este alumno todavía no tiene evaluaciones registradas." />
        ) : (
          <div className="flex flex-col gap-3">
            {evaluations.map((evaluation) => (
              <Card key={evaluation.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{evaluation.subjectName}</p>
                  <Badge variant="outline">{evaluation.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(evaluation.evaluatedAt)} · {evaluation.groupName}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {evaluation.competencies.map((competency) => (
                    <Badge key={competency.id} variant="outline" className="text-[10px]">
                      {competency.name}: {competency.currentLevel}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )
      ) : null}

      {tab === 'reportes' ? (
        reports.length === 0 ? (
          <EmptyState icon={FileText} title="Sin reportes" description="Este alumno todavía no ha enviado reportes semanales." />
        ) : (
          <div className="flex flex-col gap-3">
            {reports.map((report) => (
              <Card key={report.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">Semana {report.week} · {report.subjectName}</p>
                  <Badge variant="outline">{report.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(report.submittedAt)}</p>
              </Card>
            ))}
          </div>
        )
      ) : null}

      {tab === 'titulacion' ? (
        !titulacion ? (
          <EmptyState icon={GraduationCap} title="Sin Producto de Titulación" description="Este alumno todavía no tiene un proyecto registrado." />
        ) : (
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{titulacion.objective}</p>
              <span className="text-lg font-bold text-primary">{titulacion.progressPercentage}%</span>
            </div>
            <Progress value={titulacion.progressPercentage} />
            <p className="text-xs text-muted-foreground">
              Profesor asignado: {titulacion.professorName ?? 'Sin asignar'} · Estado: {titulacion.status} · v{titulacion.version}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {titulacion.phases.map((phase) => (
                <Badge key={phase.id} variant="outline">{phase.title}: {phase.status}</Badge>
              ))}
            </div>
          </Card>
        )
      ) : null}

      {tab === 'cursos' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-4">
            <p className="mb-2 text-sm font-semibold">Cursos</p>
            {courses.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin cursos asignados.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {courses.map((course) => (
                  <li key={course.id} className="flex items-center justify-between text-sm">
                    <span>{course.title}</span>
                    <Badge variant="outline">{course.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="p-4">
            <p className="mb-2 text-sm font-semibold">Certificaciones</p>
            {certificates.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin certificaciones todavía.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {certificates.map((certificate) => (
                  <li key={certificate.id} className="flex items-center justify-between text-sm">
                    <span>{certificate.courseTitle}</span>
                    <Badge variant="outline">{certificate.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      ) : null}

      {tab === 'leaderboard' ? (
        leaderboardEntries.length === 0 ? (
          <EmptyState icon={Trophy} title="Sin datos de Leaderboard" description="Este alumno todavía no tiene movimientos de puntos registrados." />
        ) : (
          <div className="flex flex-col gap-3">
            {leaderboardEntries.map((entry) => (
              <Card key={entry.subjectId} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{entry.subjectName}</p>
                  <Badge variant="outline">#{entry.rank} · {entry.totalPoints} pts</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {entry.badgeIds.length === 0 ? (
                    <span className="text-xs text-muted-foreground">Sin insignias todavía.</span>
                  ) : (
                    entry.badgeIds.map((badgeId) => (
                      <Badge key={badgeId} variant="outline" className="gap-1">
                        <Award className="size-3" />
                        {badgeId}
                      </Badge>
                    ))
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      ) : null}

      {tab === 'actividad' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-4">
            <p className="mb-2 text-sm font-semibold">Actividad reciente (Auditoría)</p>
            {auditEntries.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin actividad registrada.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {auditEntries.slice(0, 10).map((entry) => (
                  <li key={entry.id} className="text-xs">
                    <span className="font-medium">{entry.module}</span> — {entry.action}
                    <span className="text-muted-foreground"> · {formatDate(entry.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="p-4">
            <p className="mb-2 text-sm font-semibold">Incidencias / Observaciones</p>
            {incidents.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin incidencias registradas.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {incidents.map((incident) => (
                  <li key={incident.id} className="text-xs">
                    <span className="font-medium">{incident.title}</span>
                    <span className="text-muted-foreground"> · {incident.status} · {formatDate(incident.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      ) : null}
    </div>
  )
}
