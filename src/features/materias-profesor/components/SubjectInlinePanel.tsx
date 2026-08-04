import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, BookOpen, FileText, GraduationCap, Trophy, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StudentList } from '@/components/StudentList'
import { ActivityList } from '@/components/ActivityList'
import { MaterialList } from '@/components/MaterialList'
import { LeaderboardTable } from '@/components/LeaderboardTable'
import { getSubjectDetailAsync } from '@/services/subject.service'
import { getPendingReports } from '@/services/teacher-report.service'
import { getAvailableBadgesAsync, getProfessorStudentEvaluationsAsync } from '@/services/evaluation.service'
import { getSubjectLeaderboardAsync } from '@/services/gamification.service'
import { listTitulacionProductsAsync } from '@/services/titulacion.service'
import type { ProfessorSubjectListItem, SubjectDetail } from '@/types/subject'
import type { WeeklyReport } from '@/types/report'
import type { Badge as BadgeType, StudentEvaluation } from '@/types/evaluation'
import type { LeaderboardEntry } from '@/types/gamification'
import type { TitulacionProduct } from '@/types/titulacion'

type SubjectTab = 'alumnos' | 'actividades' | 'materiales' | 'reportes' | 'evaluaciones' | 'leaderboard' | 'titulacion'

const TABS: { value: SubjectTab; label: string; icon: typeof Users }[] = [
  { value: 'alumnos', label: 'Alumnos', icon: Users },
  { value: 'actividades', label: 'Actividades', icon: BookOpen },
  { value: 'materiales', label: 'Materiales', icon: FileText },
  { value: 'reportes', label: 'Reportes', icon: FileText },
  { value: 'evaluaciones', label: 'Evaluaciones', icon: Award },
  { value: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { value: 'titulacion', label: 'Titulación', icon: GraduationCap },
]

interface SubjectInlinePanelProps {
  subject: ProfessorSubjectListItem
}

/**
 * Contenido plegable de una materia en el Dashboard Docente (Sprint 17,
 * Parte 1): cada pestaña carga (y cachea) su propia fuente de datos —
 * ninguna requiere navegar a otra pantalla para consultarse.
 */
export function SubjectInlinePanel({ subject }: SubjectInlinePanelProps) {
  const [tab, setTab] = useState<SubjectTab>('alumnos')
  const [detail, setDetail] = useState<SubjectDetail | null>(null)
  const [reports, setReports] = useState<WeeklyReport[] | null>(null)
  const [evaluations, setEvaluations] = useState<StudentEvaluation[] | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null)
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [titulacion, setTitulacion] = useState<TitulacionProduct[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    async function load() {
      if ((tab === 'alumnos' || tab === 'actividades' || tab === 'materiales') && !detail) {
        const data = await getSubjectDetailAsync(subject.id, 'profesor')
        if (!cancelled) setDetail(data)
      }
      if (tab === 'reportes' && !reports) {
        const data = await getPendingReports(subject.id)
        if (!cancelled) setReports(data.filter((report) => report.subjectId === subject.id))
      }
      if (tab === 'evaluaciones' && !evaluations) {
        const data = await getProfessorStudentEvaluationsAsync(subject.id)
        if (!cancelled) setEvaluations(data)
      }
      if (tab === 'leaderboard' && !leaderboard) {
        const [data, badgeCatalog] = await Promise.all([getSubjectLeaderboardAsync(subject.id), getAvailableBadgesAsync()])
        if (!cancelled) {
          setLeaderboard(data)
          setBadges(badgeCatalog)
        }
      }
      if (tab === 'titulacion' && !titulacion) {
        const data = await listTitulacionProductsAsync()
        if (!cancelled) setTitulacion(data.filter((product) => product.subjectId === subject.id))
      }
      if (!cancelled) setIsLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, subject.id])

  return (
    <div className="border-t border-border bg-muted/20 p-4" onClick={(event) => event.stopPropagation()}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((item) => (
            <Button key={item.value} size="sm" variant={tab === item.value ? 'default' : 'outline'} onClick={() => setTab(item.value)}>
              <item.icon className="size-3.5" />
              {item.label}
            </Button>
          ))}
        </div>
        <Button asChild size="sm" variant="ghost">
          <Link to={`/profesor/materias/${subject.id}`}>Ver detalle completo</Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Cargando…</p>
      ) : (
        <div className="rounded-lg bg-card p-4">
          {tab === 'alumnos' ? (
            detail?.students ? <StudentList students={detail.students} /> : <p className="text-sm text-muted-foreground">Sin alumnos.</p>
          ) : null}
          {tab === 'actividades' ? (
            <>
              <div className="mb-2 flex justify-end">
                <Button asChild size="sm" variant="outline">
                  <Link to={`/profesor/materias/${subject.id}/actividades/nueva`}>Nueva actividad</Link>
                </Button>
              </div>
              <ActivityList activities={detail?.activities ?? []} />
            </>
          ) : null}
          {tab === 'materiales' ? <MaterialList materials={detail?.materials ?? []} /> : null}
          {tab === 'reportes' ? (
            reports && reports.length > 0 ? (
              <ul className="space-y-2">
                {reports.map((report) => (
                  <li key={report.id}>
                    <Link to={`/profesor/reportes/${report.id}`} className="flex items-center justify-between rounded-md border border-border p-3 text-sm hover:bg-muted/50">
                      <span>
                        {report.studentName} · Semana {report.week}
                      </span>
                      <Badge variant="outline">{report.status}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Sin reportes pendientes.</p>
            )
          ) : null}
          {tab === 'evaluaciones' ? (
            evaluations && evaluations.length > 0 ? (
              <ul className="space-y-2">
                {evaluations.map((evaluation) => (
                  <li key={evaluation.id}>
                    <Link
                      to={`/profesor/evaluaciones/${subject.id}/${evaluation.studentId}`}
                      className="flex items-center justify-between rounded-md border border-border p-3 text-sm hover:bg-muted/50"
                    >
                      <span>{evaluation.studentName}</span>
                      <Badge variant="outline">{evaluation.status}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Sin evaluaciones.</p>
            )
          ) : null}
          {tab === 'leaderboard' ? (
            leaderboard && leaderboard.length > 0 ? (
              <LeaderboardTable entries={leaderboard} badges={badges} />
            ) : (
              <p className="text-sm text-muted-foreground">Sin datos de leaderboard.</p>
            )
          ) : null}
          {tab === 'titulacion' ? (
            titulacion && titulacion.length > 0 ? (
              <ul className="space-y-2">
                {titulacion.map((project) => (
                  <li key={project.studentId} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                    <span>{project.studentName}</span>
                    <Badge variant="outline">{project.progressPercentage}%</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Sin proyectos de titulación en esta materia.</p>
            )
          ) : null}
        </div>
      )}
    </div>
  )
}
