import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Clock, MessageCircle } from 'lucide-react'
import { getStudentEvaluationDetailAsync } from '@/services/evaluation.service'
import type { StudentEvaluationDetail } from '@/types/evaluation'
import { PageHeader } from '@/components/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { CompetencyEvaluator } from '@/components/CompetencyEvaluator'
import { BadgeList } from '@/components/BadgeList'
import { EmptyState } from '@/components/EmptyState'
import { Badge as BadgeComponent } from '@/components/ui/badge'
import { RubricEditor } from '@/components/RubricEditor'
import { RUBRIC_A_CRITERIA, RUBRIC_B_CRITERIA } from '@/types/evaluation'
import { OpenChatButton } from '@/features/comunicacion/components/OpenChatButton'

export function StudentEvaluationDetailPage() {
  const { evaluationId } = useParams<{ evaluationId: string }>()
  const [evaluation, setEvaluation] = useState<StudentEvaluationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!evaluationId) return

    const loadEvaluation = async () => {
      try {
        const data = await getStudentEvaluationDetailAsync(evaluationId)
        setEvaluation(data)
      } catch (error) {
        console.error('Error loading evaluation:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadEvaluation()
  }, [evaluationId])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!evaluation) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Evaluación no encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[
          { label: 'Inicio', to: '/alumno' },
          { label: 'Evaluaciones', to: '/alumno/evaluaciones' },
          { label: evaluation.subjectName },
        ]}
        backTo="/alumno/evaluaciones"
        backLabel="Volver a Evaluaciones"
        title={evaluation.subjectName}
        subtitle={`${evaluation.studentName} • ${evaluation.groupName}`}
        actions={
          <OpenChatButton
            recipientId="usr-profesor-001"
            recipientName="tu profesor"
            label="Solicitar aclaración"
            icon={MessageCircle}
            draftMessage={`Hola, tengo una duda sobre mi evaluación de ${evaluation.subjectName}.`}
            contextType="evaluacion"
            contextId={evaluationId}
            contextLabel={`Evaluación — ${evaluation.subjectName}`}
          />
        }
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Correo</p>
          <p className="font-medium">{evaluation.email}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Grupo</p>
          <p className="font-medium">{evaluation.groupName}</p>
        </div>
      </div>

      {evaluation.status === 'publicada' ? (
        <>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Evaluación de Competencias</h2>
            <CompetencyEvaluator competencies={evaluation.competencies} readOnly />
          </div>

          {evaluation.rubricA && evaluation.rubricB ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Rúbrica A y Rúbrica B</h2>
                {evaluation.finalPercentage !== undefined && evaluation.finalLetter ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg font-bold text-primary">{evaluation.finalPercentage}%</span>
                    <BadgeComponent variant="outline">{evaluation.finalLetter}</BadgeComponent>
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <RubricEditor
                  title="Rúbrica A (70%)"
                  criteria={RUBRIC_A_CRITERIA}
                  scores={evaluation.rubricA.scores}
                  onChange={() => {}}
                  readOnly
                />
                <RubricEditor
                  title="Rúbrica B (30%)"
                  criteria={RUBRIC_B_CRITERIA}
                  scores={evaluation.rubricB.scores}
                  onChange={() => {}}
                  readOnly
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {evaluation.attempts ? `Intento ${evaluation.attempts}` : null}
                {evaluation.evaluatedByName ? ` · Evaluado por ${evaluation.evaluatedByName}` : ''}
              </p>
            </div>
          ) : null}

          {evaluation.feedback && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-2 text-blue-900">Retroalimentación</h3>
              <p className="text-sm text-blue-800">{evaluation.feedback}</p>
            </div>
          )}

          {evaluation.badges.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Insignias Obtenidas</h2>
              <BadgeList badges={evaluation.badges} />
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={Clock}
          title="Evaluación en proceso"
          description="Tu profesor todavía está trabajando en esta evaluación. Cuando la publique, podrás ver tus competencias, retroalimentación e insignias aquí."
        />
      )}
    </div>
  )
}
