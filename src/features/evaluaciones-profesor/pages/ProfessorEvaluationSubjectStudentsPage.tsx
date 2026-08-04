import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Award, Building2, MessageCircle, Users } from 'lucide-react'
import { getProfessorSubjectsAsync } from '@/services/subject.service'
import { getProfessorStudentEvaluationsAsync } from '@/services/evaluation.service'
import type { ProfessorSubjectListItem } from '@/types/subject'
import type { StudentEvaluation } from '@/types/evaluation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { Pagination } from '@/components/Pagination'
import { EvaluationStatusBadge } from '@/components/EvaluationStatusBadge'
import { WeeklyReportStatusBadge } from '@/components/WeeklyReportStatusBadge'
import { OpenChatButton } from '@/features/comunicacion/components/OpenChatButton'
import { useSearch } from '@/hooks/useSearch'
import { usePagination } from '@/hooks/usePagination'

const searchFields = (student: StudentEvaluation) => [
  student.studentName,
  student.groupName,
  student.company ?? '',
]

/** Alumnos asignados a una materia, punto de entrada al flujo de evaluación individual. */
export function ProfessorEvaluationSubjectStudentsPage() {
  const { subjectId } = useParams<{ subjectId: string }>()
  const [subject, setSubject] = useState<ProfessorSubjectListItem | null>(null)
  const [students, setStudents] = useState<StudentEvaluation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!subjectId) return

    const loadData = async () => {
      setIsLoading(true)
      try {
        const [subjects, studentsData] = await Promise.all([
          getProfessorSubjectsAsync(),
          getProfessorStudentEvaluationsAsync(subjectId),
        ])
        setSubject(subjects.find((s) => s.id === subjectId) ?? null)
        setStudents(studentsData)
      } catch (error) {
        console.error('Error loading subject students:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [subjectId])

  const getFields = useCallback(searchFields, [])
  const { query, setQuery, filtered } = useSearch(students, getFields)
  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 8)

  const subjectName = subject?.name ?? students[0]?.subjectName ?? 'Materia'

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[
          { label: 'Inicio', to: '/profesor' },
          { label: 'Evaluaciones', to: '/profesor/evaluaciones' },
          { label: subjectName },
        ]}
        backTo="/profesor/evaluaciones"
        backLabel="Volver a Evaluaciones"
        title={subjectName}
        subtitle={subject ? `Grupo ${subject.groupName} • Selecciona un alumno para evaluar` : 'Selecciona un alumno para evaluar'}
        actions={
          <Badge variant="outline" className="gap-1.5">
            <Users className="size-3.5" />
            {students.length} alumno{students.length === 1 ? '' : 's'}
          </Badge>
        }
      />

      {isLoading ? (
        <ListSkeleton variant="row" count={4} />
      ) : students.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No existen alumnos asignados a esta materia."
          description="Cuando se asignen alumnos a esta materia, aparecerán aquí para evaluar."
        />
      ) : (
        <>
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por alumno, grupo o empresa…" />

          {filtered.length === 0 ? (
            <EmptyState
              icon={Award}
              title="Sin resultados"
              description="No encontramos alumnos que coincidan con tu búsqueda."
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {pageItems.map((student) => (
                  <Card key={student.studentId} className="p-5 space-y-4">
                    <div>
                      <h3 className="font-semibold">{student.studentName}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Grupo: {student.groupName}</p>
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                        <Building2 className="size-3.5" />
                        {student.company ?? 'Sin empresa asignada'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {student.weeklyReportStatus ? (
                        <WeeklyReportStatusBadge status={student.weeklyReportStatus} />
                      ) : null}
                      <EvaluationStatusBadge status={student.status} />
                    </div>

                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link to={`/profesor/evaluaciones/${subjectId}/${student.studentId}`}>Evaluar</Link>
                      </Button>
                      <OpenChatButton
                        recipientId={student.studentId}
                        recipientName={student.studentName}
                        label="Iniciar conversación"
                        icon={MessageCircle}
                      />
                    </div>
                  </Card>
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </>
      )}
    </div>
  )
}
