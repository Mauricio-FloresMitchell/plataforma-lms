import { Building2, Paperclip, User } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/EmptyState'
import { CompanyStatusBadge } from '@/components/CompanyStatusBadge'
import { formatDateTime } from '@/utils/date'
import type { CompanyProspect } from '@/types/company'

interface StudentCompaniesSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentName: string
  companies: CompanyProspect[]
}

/**
 * Banco de empresas de un alumno (Mejora 2), vista de solo lectura del
 * Profesor — el registro y confirmación son responsabilidad del alumno
 * desde `/alumno/empresas`.
 */
export function StudentCompaniesSheet({ open, onOpenChange, studentName, companies }: StudentCompaniesSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Empresas de {studentName}</SheetTitle>
          <SheetDescription>Banco de prospección del alumno — candidatas, confirmada y carta firmada.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4">
          {companies.length === 0 ? (
            <EmptyState icon={Building2} title="Sin empresas registradas" description="El alumno aún no registra ninguna empresa candidata." />
          ) : (
            companies.map((company) => (
              <Card key={company.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{company.name}</p>
                    {company.sector ? <p className="text-xs text-muted-foreground">{company.sector}</p> : null}
                  </div>
                  <CompanyStatusBadge status={company.status} />
                </div>
                {company.contactName ? (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="size-3.5" />
                    {company.contactName}
                    {company.contactPhone ? ` · ${company.contactPhone}` : ''}
                  </p>
                ) : null}
                {company.notes ? <p className="text-xs text-muted-foreground">{company.notes}</p> : null}
                {company.letter ? (
                  <p className="flex items-center gap-1.5 text-xs text-emerald-700">
                    <Paperclip className="size-3.5" />
                    {company.letter.name} · {formatDateTime(company.letter.uploadedAt)}
                  </p>
                ) : company.status === 'confirmada' ? (
                  <p className="text-xs text-amber-700">Sin carta firmada adjunta todavía.</p>
                ) : null}
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
