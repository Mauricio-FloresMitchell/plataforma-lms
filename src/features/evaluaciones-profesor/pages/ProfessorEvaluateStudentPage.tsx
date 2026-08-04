import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Coins, Lock, Send } from 'lucide-react'
import {
  getProfessorStudentEvaluationsAsync,
  getAvailableBadgesAsync,
  recordEvaluationAsync,
} from '@/services/evaluation.service'
import type { StudentEvaluation, Competency, Badge as BadgeType } from '@/types/evaluation'
import { RUBRIC_A_CRITERIA, RUBRIC_B_CRITERIA } from '@/types/evaluation'
import type { RubricCriterionScore } from '@/types/rubric'
import { PageHeader } from '@/components/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge as BadgeComponent } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CompetencyEvaluator } from '@/components/CompetencyEvaluator'
import { CompetencyLevelBadge } from '@/components/CompetencyLevelBadge'
import { BadgeList } from '@/components/BadgeList'
import { EvaluationStatusBadge } from '@/components/EvaluationStatusBadge'
import { RubricEditor } from '@/components/RubricEditor'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { percentageToLevel } from '@/utils/grade'
import { calculateFinalPercentage, percentageToReportLevel } from '@/utils/reportGrade'
import { scoreRubric } from '@/utils/rubric'

export function ProfessorEvaluateStudentPage() {
  const { subjectId, studentId } = useParams<{ subjectId: string; studentId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [student, setStudent] = useState<StudentEvaluation | null>(null)
  const [students, setStudents] = useState<StudentEvaluation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [selectedBadges, setSelectedBadges] = useState<string[]>([])
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [competencies, setCompetencies] = useState<Competency[]>([])
  const [confirmation, setConfirmation] = useState<string | null>(null)
  const [modificationRequested, setModificationRequested] = useState(false)
  const [rubricAScores, setRubricAScores] = useState<RubricCriterionScore[]>([])
  const [rubricBScores, setRubricBScores] = useState<RubricCriterionScore[]>([])
  const [bonus, setBonus] = useState(0)
  const [observations, setObservations] = useState('')

  const rubricAResult = scoreRubric(RUBRIC_A_CRITERIA, rubricAScores)
  const rubricBResult = scoreRubric(RUBRIC_B_CRITERIA, rubricBScores)
  const finalPercentagePreview = calculateFinalPercentage(rubricAResult.percentage, rubricBResult.percentage, bonus)
  const finalLetterPreview = percentageToReportLevel(finalPercentagePreview)

  const currentStudentIndex = students.findIndex((s) => s.studentId === studentId)
  const hasNext = currentStudentIndex < students.length - 1
  const hasPrev = currentStudentIndex > 0
  const isPublished = student?.status === 'publicada' && !modificationRequested
  const isLocked = isPublished

  const averagePercentage =
    competencies.length > 0
      ? Math.round(competencies.reduce((sum, c) => sum + c.percentage, 0) / competencies.length)
      : 0
  const averageLevel = percentageToLevel(averagePercentage)

  // Insignias automáticas (Sprint Leaderboard) no se ofrecen aquí: el sistema
  // las calcula solo a partir de movimientos de puntos, nunca las asigna el profesor.
  const manualBadges = badges.filter((b) => b.awardType !== 'automatic')

  useEffect(() => {
    const loadData = async () => {
      if (!subjectId) return

      try {
        const studentsData = await getProfessorStudentEvaluationsAsync(subjectId)
        setStudents(studentsData)

        const badgesData = await getAvailableBadgesAsync()
        setBadges(badgesData)

        const selectedStudent = studentId
          ? studentsData.find((s) => s.studentId === studentId)
          : studentsData[0]

        if (selectedStudent) {
          setStudent(selectedStudent)
          setCompetencies(selectedStudent.competencies)
          setFeedback(selectedStudent.feedback || '')
          setSelectedBadges(selectedStudent.badgeIds ?? [])
          setRubricAScores(selectedStudent.rubricA?.scores ?? [])
          setRubricBScores(selectedStudent.rubricB?.scores ?? [])
          setBonus(selectedStudent.bonus ?? 0)
          setObservations(selectedStudent.observations ?? '')
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
        setModificationRequested(false)
        setConfirmation(null)
      }
    }

    loadData()
  }, [subjectId, studentId])

  const handlePercentageChange = (competencyId: string, percentage: number) => {
    setCompetencies((prev) =>
      prev.map((c) =>
        c.id === competencyId ? { ...c, percentage, currentLevel: percentageToLevel(percentage) } : c,
      ),
    )
  }

  const handleBadgeToggle = (badgeId: string) => {
    setSelectedBadges((prev) =>
      prev.includes(badgeId) ? prev.filter((id) => id !== badgeId) : [...prev, badgeId],
    )
  }

  async function handleSave(status: 'borrador' | 'publicada') {
    if (!student || !user) return
    setIsSaving(true)
    setConfirmation(null)
    try {
      const updated = await recordEvaluationAsync(
        student.id,
        competencies,
        feedback,
        status,
        selectedBadges,
        { id: user.id, name: user.name, role: user.role },
        { rubricAScores, rubricBScores, bonus, observations },
      )
      if (updated) {
        setStudent(updated)
        setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
        setConfirmation(
          status === 'publicada'
            ? 'Evaluación publicada. El alumno ya puede consultarla.'
            : 'Borrador guardado. El alumno todavía no puede verlo.',
        )
      }
    } finally {
      setIsSaving(false)
    }
  }

  function handleRequestModification() {
    setModificationRequested(true)
    setConfirmation('Solicitud enviada al Administrador. Podrás editar esta evaluación cuando sea aprobada.')
  }

  function goToStudent(index: number) {
    const target = students[index]
    if (target && subjectId) {
      navigate(`/profesor/evaluaciones/${subjectId}/${target.studentId}`)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay estudiantes para evaluar</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[
          { label: 'Inicio', to: '/profesor' },
          { label: 'Evaluaciones', to: '/profesor/evaluaciones' },
          { label: student.subjectName, to: `/profesor/evaluaciones/${subjectId}` },
          { label: student.studentName },
        ]}
        backTo={`/profesor/evaluaciones/${subjectId}`}
        backLabel="Volver a Alumnos"
        title="Evaluar Alumno"
        subtitle={`${student.studentName} • ${student.subjectName}`}
        actions={
          <BadgeComponent variant="outline">
            {currentStudentIndex + 1} de {students.length}
          </BadgeComponent>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Materia</p>
          <p className="font-medium text-sm">{student.subjectName}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Grupo</p>
          <p className="font-medium text-sm">{student.groupName}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Estado</p>
          <div className="mt-1">
            <EvaluationStatusBadge status={student.status} />
          </div>
        </div>
      </div>

      {confirmation ? (
        <Alert>
          <AlertDescription>{confirmation}</AlertDescription>
        </Alert>
      ) : null}

      {isLocked ? (
        <Alert variant="destructive">
          <Lock className="size-4" />
          <AlertDescription>
            Esta evaluación ya está publicada. Para modificarla necesitas solicitar autorización al
            Administrador.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Competencias a Evaluar</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Promedio general</span>
            <CompetencyLevelBadge level={averageLevel} percentage={averagePercentage} />
          </div>
        </div>
        <CompetencyEvaluator
          competencies={competencies}
          onPercentageChange={handlePercentageChange}
          readOnly={isLocked}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Rúbrica A y Rúbrica B (Modelo Educativo)</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">% final (70/30 + bonificación)</span>
            <span className="text-lg font-bold text-primary">{finalPercentagePreview}%</span>
            <BadgeComponent variant="outline">{finalLetterPreview}</BadgeComponent>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RubricEditor title="Rúbrica A (70%)" criteria={RUBRIC_A_CRITERIA} scores={rubricAScores} onChange={setRubricAScores} readOnly={isLocked} />
          <RubricEditor title="Rúbrica B (30%)" criteria={RUBRIC_B_CRITERIA} scores={rubricBScores} onChange={setRubricBScores} readOnly={isLocked} />
        </div>
        {!isLocked ? (
          <div className="flex items-center gap-2">
            <Label htmlFor="bonus" className="text-sm text-muted-foreground">
              Bonificación
            </Label>
            <Input
              id="bonus"
              type="number"
              min={0}
              max={20}
              value={bonus}
              onChange={(event) => setBonus(Math.max(0, Math.min(20, Number(event.target.value) || 0)))}
              className="h-8 w-24"
            />
            <span className="text-xs text-muted-foreground">puntos extra sobre el % final</span>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Intentos</p>
          <p className="font-medium text-sm">{student.attempts ?? 0}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Profesor evaluador</p>
          <p className="font-medium text-sm">{student.evaluatedByName ?? user?.name ?? 'Sin asignar'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Retroalimentación</h2>
        <p className="text-xs text-muted-foreground -mt-2">Visible para el alumno cuando la evaluación se publica.</p>
        <Card className="p-4">
          <Textarea
            placeholder="Escribe tu retroalimentación para el estudiante..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-24"
            disabled={isLocked}
          />
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Observaciones</h2>
        <p className="text-xs text-muted-foreground -mt-2">Uso interno del profesor — el alumno no las ve.</p>
        <Card className="p-4">
          <Textarea
            placeholder="Notas internas sobre el desempeño del alumno..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="min-h-20"
            disabled={isLocked}
          />
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Asignar Insignias</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/profesor/puntos?materia=${subjectId}&alumno=${student.studentId}`}>
              <Coins className="size-4" />
              Registrar puntos
            </Link>
          </Button>
        </div>
        <BadgeList
          badges={manualBadges}
          selectable={!isLocked}
          selectedBadgeIds={selectedBadges}
          onBadgeToggle={handleBadgeToggle}
        />
      </div>

      {selectedBadges.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Vista previa del alumno</h2>
          <p className="text-sm text-muted-foreground -mt-2">
            Así verá el alumno sus insignias obtenidas en esta evaluación.
          </p>
          <BadgeList badges={badges.filter((b) => selectedBadges.includes(b.id))} />
        </div>
      )}

      <div className="flex gap-2 justify-between">
        <div className="flex gap-2">
          {hasPrev && (
            <Button variant="outline" onClick={() => goToStudent(currentStudentIndex - 1)}>
              Anterior Estudiante
            </Button>
          )}
          {hasNext && (
            <Button variant="outline" onClick={() => goToStudent(currentStudentIndex + 1)}>
              Siguiente Estudiante
            </Button>
          )}
        </div>

        {isLocked ? (
          <Button onClick={handleRequestModification} disabled={modificationRequested}>
            <Send className="size-4" />
            Solicitar modificación al Administrador
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave('borrador')} disabled={isSaving}>
              Guardar Borrador
            </Button>
            <Button onClick={() => handleSave('publicada')} disabled={isSaving}>
              Publicar Evaluación
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
