import { useCallback, useEffect, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { TitulacionProjectPanel } from '@/components/TitulacionProjectPanel'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  duplicateTitulacionPhaseVersionAsync,
  getTitulacionProductAsync,
  publishTitulacionPhaseAsync,
  recordTitulacionFileDownloadAsync,
  saveTitulacionDraftAsync,
} from '@/services/titulacion.service'
import type { TitulacionFile, TitulacionProduct } from '@/types/titulacion'

/**
 * Producto de Titulación del Alumno (Sprint 18): redacta borradores, sube
 * evidencia versionada y publica cada fase a revisión de su profesor.
 */
export function StudentTitulacionPage() {
  const { user } = useAuth()
  const [product, setProduct] = useState<TitulacionProduct | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(() => {
    if (!user) return
    setIsLoading(true)
    getTitulacionProductAsync(user.id)
      .then(setProduct)
      .finally(() => setIsLoading(false))
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  async function handleSaveDraft(phaseId: string, deliverableId: string, content: string, files: TitulacionFile[]) {
    if (!user) return
    await saveTitulacionDraftAsync(user.id, phaseId, deliverableId, content, files)
    load()
  }

  async function handlePublishPhase(phaseId: string, comment: string) {
    if (!user) return
    await publishTitulacionPhaseAsync(user.id, phaseId, { id: user.id, name: user.name }, comment)
    load()
  }

  async function handleDuplicateVersion(phaseId: string, versionNumber: number) {
    if (!user) return
    await duplicateTitulacionPhaseVersionAsync(user.id, phaseId, versionNumber, { id: user.id, name: user.name })
    load()
  }

  async function handleDownloadFile(fileId: string) {
    if (!user) return
    await recordTitulacionFileDownloadAsync({ id: user.id, name: user.name, role: user.role }, user.id, fileId)
    load()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay información de titulación disponible.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/alumno' }, { label: 'Producto de Titulación' }]}
        title="Producto de Titulación"
        subtitle="Redacta, sube evidencia y publica cada fase a revisión de tu profesor."
      />
      <TitulacionProjectPanel
        product={product}
        mode="alumno"
        actor={user ? { id: user.id, name: user.name } : null}
        onSaveDraft={handleSaveDraft}
        onPublishPhase={handlePublishPhase}
        onDuplicateVersion={handleDuplicateVersion}
        onDownloadFile={handleDownloadFile}
      />
    </div>
  )
}
