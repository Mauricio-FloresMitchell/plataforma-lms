import { useCallback, useEffect, useState } from 'react'
import { Download, GraduationCap, Lock, RefreshCw, UserCog, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TitulacionProjectPanel } from '@/components/TitulacionProjectPanel'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  closeTitulacionProductAsync,
  listTitulacionProductsAsync,
  reassignTitulacionProfessorAsync,
  recordTitulacionFileDownloadAsync,
  setTitulacionProductStatusAsync,
  unlockTitulacionPhaseAsync,
} from '@/services/titulacion.service'
import { getManagedUsersAsync } from '@/services/userManagement.service'
import { getTitulacionExportAdapter } from '@/services/export/titulacionExport.adapter'
import type { TitulacionProduct, TitulacionProductStatus } from '@/types/titulacion'
import type { ManagedUser } from '@/types/userManagement'

const STATUS_OPTIONS: TitulacionProductStatus[] = ['borrador', 'activo', 'en_revision', 'cerrado']

/** Producto de Titulación — vista del Administrador (Sprint 18, Parte 12): consulta agregada + reasignar/desbloquear/editar/cerrar/exportar. */
export function AdminTitulacionPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<TitulacionProduct[]>([])
  const [professors, setProfessors] = useState<ManagedUser[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [exportMessage, setExportMessage] = useState<string | null>(null)

  const load = useCallback(() => {
    setIsLoading(true)
    Promise.all([listTitulacionProductsAsync(), getManagedUsersAsync('profesor')])
      .then(([data, teachers]) => {
        setProducts(data)
        setProfessors(teachers)
        setSelectedStudentId((current) => current ?? data[0]?.studentId ?? null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const selectedProduct = products.find((product) => product.studentId === selectedStudentId) ?? null
  const actor = user ? { id: user.id, name: user.name, role: user.role } : null

  async function handleReassign(professorId: string) {
    if (!actor || !selectedProduct) return
    const professor = professors.find((item) => item.id === professorId)
    if (!professor) return
    await reassignTitulacionProfessorAsync(actor, selectedProduct.studentId, professor.id, professor.name)
    load()
  }

  async function handleUnlockPhase(phaseId: string) {
    if (!actor || !selectedProduct) return
    await unlockTitulacionPhaseAsync(actor, selectedProduct.studentId, phaseId)
    load()
  }

  async function handleStatusChange(status: TitulacionProductStatus) {
    if (!actor || !selectedProduct) return
    await setTitulacionProductStatusAsync(actor, selectedProduct.studentId, status)
    load()
  }

  async function handleClose() {
    if (!actor || !selectedProduct) return
    await closeTitulacionProductAsync(actor, selectedProduct.studentId)
    load()
  }

  async function handleExport() {
    if (!selectedProduct) return
    const result = await getTitulacionExportAdapter().exportProduct(selectedProduct.id, 'pdf')
    setExportMessage(result.message)
  }

  async function handleDownloadFile(fileId: string) {
    if (!actor || !selectedProduct) return
    await recordTitulacionFileDownloadAsync(actor, selectedProduct.studentId, fileId)
    load()
  }

  const lockedPhases = selectedProduct?.phases.filter((phase) => phase.status === 'bloqueada') ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Producto de Titulación' }]}
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
            <div className="space-y-4">
              <Card className="p-4 space-y-3">
                <p className="text-sm font-semibold">Acciones de Administrador</p>
                <div className="flex flex-wrap items-center gap-2">
                  <UserCog className="size-4 text-muted-foreground" />
                  <Select onValueChange={handleReassign}>
                    <SelectTrigger className="h-8 w-56 text-xs"><SelectValue placeholder="Reasignar profesor…" /></SelectTrigger>
                    <SelectContent>
                      {professors.map((professor) => (
                        <SelectItem key={professor.id} value={professor.id}>{professor.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedProduct.status} onValueChange={(value) => handleStatusChange(value as TitulacionProductStatus)}>
                    <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button size="sm" variant="outline" onClick={handleClose} disabled={selectedProduct.status === 'cerrado'}>
                    <XCircle className="size-3.5" />
                    Cerrar producto
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleExport}>
                    <Download className="size-3.5" />
                    Exportar
                  </Button>
                </div>

                {lockedPhases.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2 border-t border-border pt-2">
                    <Lock className="size-4 text-muted-foreground" />
                    {lockedPhases.map((phase) => (
                      <Button key={phase.id} size="sm" variant="ghost" onClick={() => handleUnlockPhase(phase.id)}>
                        <RefreshCw className="size-3.5" />
                        Desbloquear "{phase.title}"
                      </Button>
                    ))}
                  </div>
                ) : null}

                {exportMessage ? <p className="text-xs text-muted-foreground">{exportMessage}</p> : null}
              </Card>

              <TitulacionProjectPanel product={selectedProduct} mode="readonly" actor={actor} onDownloadFile={handleDownloadFile} />
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
