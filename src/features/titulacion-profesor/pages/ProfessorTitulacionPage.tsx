import { useCallback, useEffect, useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TitulacionProjectPanel } from '@/components/TitulacionProjectPanel'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  addTitulacionObservationAsync,
  addTitulacionPhaseFeedbackAsync,
  listTitulacionProductsAsync,
  recordTitulacionFileDownloadAsync,
  reviewTitulacionPhaseAsync,
} from '@/services/titulacion.service'
import type { TitulacionFeedbackType, TitulacionProduct } from '@/types/titulacion'

/** Producto de Titulación — vista del Profesor (Sprint 18): avance, retroalimentación por fase, aprobación, comparación de versiones. */
export function ProfessorTitulacionPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<TitulacionProduct[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(() => {
    setIsLoading(true)
    listTitulacionProductsAsync()
      .then((data) => {
        setProducts(data)
        setSelectedStudentId((current) => current ?? data[0]?.studentId ?? null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const selectedProduct = products.find((product) => product.studentId === selectedStudentId) ?? null
  const actor = user ? { id: user.id, name: user.name, role: user.role } : null

  async function handleReview(phaseId: string, action: 'aprobada' | 'rechazada', feedback: string) {
    if (!actor || !selectedProduct) return
    await reviewTitulacionPhaseAsync(actor, selectedProduct.studentId, selectedProduct.studentName, phaseId, action, feedback)
    load()
  }

  async function handleAddFeedback(phaseId: string, type: Exclude<TitulacionFeedbackType, 'aprobacion' | 'rechazo'>, content: string) {
    if (!actor || !selectedProduct) return
    await addTitulacionPhaseFeedbackAsync(actor, selectedProduct.studentId, selectedProduct.studentName, phaseId, type, content)
    load()
  }

  async function handleAddObservation(observation: string) {
    if (!actor || !selectedProduct) return
    await addTitulacionObservationAsync(actor, selectedProduct.studentId, selectedProduct.studentName, observation)
    load()
  }

  async function handleDownloadFile(fileId: string) {
    if (!actor || !selectedProduct) return
    await recordTitulacionFileDownloadAsync(actor, selectedProduct.studentId, fileId)
    load()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/profesor' }, { label: 'Producto de Titulación' }]}
        title="Producto de Titulación"
        subtitle={isLoading ? undefined : `${products.length} alumnos en seguimiento`}
      />

      {isLoading ? (
        <ListSkeleton variant="block" count={3} blockHeight="h-20" />
      ) : products.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Sin proyectos de titulación" description="Todavía no hay alumnos con proyecto de titulación registrado." />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            {products.map((product) => (
              <Card
                key={product.studentId}
                className={`cursor-pointer p-4 transition-colors ${product.studentId === selectedStudentId ? 'border-primary' : ''}`}
                onClick={() => setSelectedStudentId(product.studentId)}
              >
                <p className="text-sm font-medium">{product.studentName}</p>
                <p className="text-xs text-muted-foreground">{product.subjectName}</p>
                <Progress value={product.progressPercentage} className="mt-2 h-1.5" />
                <p className="mt-1 text-xs text-muted-foreground">{product.progressPercentage}%</p>
              </Card>
            ))}
          </div>

          {selectedProduct ? (
            <TitulacionProjectPanel
              product={selectedProduct}
              mode="profesor"
              actor={user ? { id: user.id, name: user.name } : null}
              onReviewPhase={handleReview}
              onAddFeedback={handleAddFeedback}
              onAddObservation={handleAddObservation}
              onDownloadFile={handleDownloadFile}
            />
          ) : null}
        </div>
      )}
    </div>
  )
}
