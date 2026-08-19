import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Building2, CheckCircle2, Paperclip, Plus, User, X } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { ListSkeleton } from '@/components/ListSkeleton'
import { EmptyState } from '@/components/EmptyState'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CompanyStatusBadge } from '@/components/CompanyStatusBadge'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  attachCompanyLetterAsync,
  confirmCompanyAsync,
  listMyCompaniesAsync,
  registerCompanyAsync,
  rejectCompanyAsync,
} from '@/services/company-prospect.service'
import { CompanyFormSheet } from '../components/CompanyFormSheet'
import type { CompanyProspect, CompanyProspectInput } from '@/types/company'

/** Materia con Sistema de Prospección disponible para el Alumno demo — única materia de la plataforma. */
const SUBJECT_ID = 'sub-001'
const SUBJECT_NAME = 'Clase Modelo 1 y Modelo 2'

/** Sistema de Prospección Estudiantil de Empresas (Manual de Mejoras Transversales, Mejora 2). */
export function StudentCompaniesPage() {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<CompanyProspect[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [busyCompanyId, setBusyCompanyId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachTargetId, setAttachTargetId] = useState<string | null>(null)

  function reload() {
    if (!user) return
    listMyCompaniesAsync(SUBJECT_ID, user.id).then(setCompanies)
  }

  useEffect(() => {
    if (!user) return
    setIsLoading(true)
    listMyCompaniesAsync(SUBJECT_ID, user.id)
      .then(setCompanies)
      .finally(() => setIsLoading(false))
  }, [user])

  async function handleRegister(input: CompanyProspectInput) {
    if (!user) return
    await registerCompanyAsync({ id: user.id, name: user.name, role: user.role }, SUBJECT_ID, SUBJECT_NAME, input)
    reload()
  }

  async function handleConfirm(company: CompanyProspect) {
    if (!user) return
    setBusyCompanyId(company.id)
    try {
      await confirmCompanyAsync({ id: user.id, name: user.name, role: user.role }, SUBJECT_ID, SUBJECT_NAME, company.id, company.name)
      reload()
    } finally {
      setBusyCompanyId(null)
    }
  }

  async function handleReject(company: CompanyProspect) {
    if (!user) return
    setBusyCompanyId(company.id)
    try {
      await rejectCompanyAsync({ id: user.id, name: user.name, role: user.role }, company.id, company.name)
      reload()
    } finally {
      setBusyCompanyId(null)
    }
  }

  function openAttachDialog(companyId: string) {
    setAttachTargetId(companyId)
    fileInputRef.current?.click()
  }

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !attachTargetId || !user) return
    const companyName = companies.find((item) => item.id === attachTargetId)?.name ?? ''
    setBusyCompanyId(attachTargetId)
    try {
      await attachCompanyLetterAsync({ id: user.id, name: user.name, role: user.role }, attachTargetId, companyName, file.name)
      reload()
    } finally {
      setBusyCompanyId(null)
      setAttachTargetId(null)
    }
  }

  return (
    <div className="space-y-6">
      <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={(event) => void handleFileSelected(event)} />

      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/alumno' }, { label: 'Empresas' }]}
        title="Empresas"
        subtitle="Registra las empresas que prospectas, confirma con cuál trabajarás y adjunta la carta firmada."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Registrar empresa
          </Button>
        }
      />

      {isLoading ? (
        <ListSkeleton variant="block" count={2} blockHeight="h-32" />
      ) : companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aún no registras empresas"
          description="Registra al menos una empresa candidata para empezar tu Reporte de Campo."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {companies.map((company) => {
            const isBusy = busyCompanyId === company.id
            return (
              <Card key={company.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{company.name}</h3>
                    {company.sector ? <p className="text-sm text-muted-foreground">{company.sector}</p> : null}
                  </div>
                  <CompanyStatusBadge status={company.status} />
                </div>

                {company.contactName ? (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <User className="size-3.5" />
                    {company.contactName}
                    {company.contactPhone ? ` · ${company.contactPhone}` : ''}
                  </p>
                ) : null}

                {company.notes ? <p className="text-sm text-muted-foreground">{company.notes}</p> : null}

                {company.letter ? (
                  <p className="flex items-center gap-1.5 text-sm text-emerald-700">
                    <Paperclip className="size-3.5" />
                    {company.letter.name}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-2 pt-1">
                  {company.status === 'candidata' ? (
                    <>
                      <Button size="sm" disabled={isBusy} onClick={() => void handleConfirm(company)}>
                        <CheckCircle2 className="size-3.5" />
                        Confirmar
                      </Button>
                      <Button size="sm" variant="outline" disabled={isBusy} onClick={() => void handleReject(company)}>
                        <X className="size-3.5" />
                        Descartar
                      </Button>
                    </>
                  ) : null}
                  {company.status === 'confirmada' ? (
                    <Button size="sm" variant="outline" disabled={isBusy} onClick={() => openAttachDialog(company.id)}>
                      <Paperclip className="size-3.5" />
                      {company.letter ? 'Reemplazar carta' : 'Adjuntar carta firmada'}
                    </Button>
                  ) : null}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <CompanyFormSheet open={formOpen} onOpenChange={setFormOpen} onSubmit={handleRegister} />
    </div>
  )
}
