import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, Coins } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getProfessorSubjectsAsync } from '@/services/subject.service'
import { getProfessorStudentEvaluationsAsync } from '@/services/evaluation.service'
import {
  getPointCatalogAsync,
  listPointMovementsAsync,
  recordPointMovementAsync,
} from '@/services/gamification.service'
import type { ProfessorSubjectListItem } from '@/types/subject'
import type { StudentEvaluation } from '@/types/evaluation'
import type { PointActionId, PointCatalogEntry, PointMovement } from '@/types/gamification'
import { PointCatalogPicker } from '../components/PointCatalogPicker'

/** Gestión de Puntos (Sprint Leaderboard): el profesor registra movimientos usando únicamente el catálogo permitido. */
export function ManagePointsPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

  const [subjects, setSubjects] = useState<ProfessorSubjectListItem[]>([])
  const [subjectId, setSubjectId] = useState(searchParams.get('materia') ?? '')
  const [students, setStudents] = useState<StudentEvaluation[]>([])
  const [studentId, setStudentId] = useState(searchParams.get('alumno') ?? '')
  const [catalog, setCatalog] = useState<PointCatalogEntry[]>([])
  const [actionId, setActionId] = useState<PointActionId | ''>('')
  const [movements, setMovements] = useState<PointMovement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmation, setConfirmation] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getProfessorSubjectsAsync(), getPointCatalogAsync()]).then(([subjectsData, catalogData]) => {
      setSubjects(subjectsData)
      setCatalog(catalogData)
      setSubjectId((current) => current || subjectsData[0]?.id || '')
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!subjectId) return
    getProfessorStudentEvaluationsAsync(subjectId).then((data) => {
      setStudents(data)
      setStudentId((current) => (data.some((s) => s.studentId === current) ? current : data[0]?.studentId ?? ''))
    })
  }, [subjectId])

  useEffect(() => {
    if (!subjectId || !studentId) return
    listPointMovementsAsync(subjectId, studentId).then(setMovements)
  }, [subjectId, studentId])

  async function handleRegister() {
    if (!subjectId || !studentId || !actionId || !user) return
    setIsSaving(true)
    setConfirmation(null)
    try {
      await recordPointMovementAsync(studentId, subjectId, actionId, user.name, { id: user.id, name: user.name, role: user.role })
      const refreshed = await listPointMovementsAsync(subjectId, studentId)
      setMovements(refreshed)
      setActionId('')
      setConfirmation('Movimiento de puntos registrado.')
    } finally {
      setIsSaving(false)
    }
  }

  const selectedStudent = students.find((s) => s.studentId === studentId)
  const totalPoints = movements.reduce((sum, m) => sum + m.points, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/profesor' }, { label: 'Gestión de Puntos' }]}
        title="Gestión de Puntos"
        subtitle="Registra movimientos de puntos usando únicamente el catálogo permitido."
      />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : subjects.length === 0 ? (
        <EmptyState icon={Coins} title="Sin materias asignadas" description="No tienes materias asignadas para registrar puntos." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Materia</label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Alumno</label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.studentId} value={student.studentId}>
                      {student.studentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {confirmation ? (
            <Alert>
              <CheckCircle2 className="size-4" />
              <AlertDescription>{confirmation}</AlertDescription>
            </Alert>
          ) : null}

          {selectedStudent ? (
            <>
              <div className="space-y-3">
                <h2 className="text-sm font-semibold">Catálogo de acciones</h2>
                <PointCatalogPicker catalog={catalog} selectedActionId={actionId} onSelect={setActionId} />
                <Button onClick={handleRegister} disabled={!actionId || isSaving} className="h-10">
                  <Coins className="size-4" />
                  Registrar movimiento
                </Button>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-semibold">
                  Historial de {selectedStudent.studentName} · {totalPoints} pts acumulados
                </h2>
                {movements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin movimientos registrados todavía.</p>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col gap-2">
                      {movements.map((m) => (
                        <div key={m.id} className="flex items-center justify-between text-sm">
                          <span>{m.label}</span>
                          <span className={m.points > 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-red-600'}>
                            {m.points > 0 ? '+' : ''}
                            {m.points}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  )
}
