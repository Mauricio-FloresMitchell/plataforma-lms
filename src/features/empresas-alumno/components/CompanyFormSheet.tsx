import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { CompanyProspectInput } from '@/types/company'

interface CompanyFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CompanyProspectInput) => Promise<void>
}

/** Registro de una empresa candidata (Guión de 5 Pasos, Semana 1: "Identificar 5 empresas candidatas"). */
export function CompanyFormSheet({ open, onOpenChange, onSubmit }: CompanyFormSheetProps) {
  const [name, setName] = useState('')
  const [sector, setSector] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName('')
    setSector('')
    setContactName('')
    setContactPhone('')
    setNotes('')
  }, [open])

  const isValid = name.trim().length > 0

  async function handleSubmit() {
    if (!isValid) return
    setIsSaving(true)
    try {
      await onSubmit({
        name: name.trim(),
        sector: sector.trim() || undefined,
        contactName: contactName.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Registrar empresa candidata</SheetTitle>
          <SheetDescription>
            Guarda los datos de la empresa que quieres prospectar. Podrás confirmarla más adelante
            y adjuntar la carta firmada.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="company-name">Nombre de la empresa u organización *</Label>
            <Input id="company-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Restaurante La Sazón de Mamá" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="company-sector">Giro</Label>
            <Input id="company-sector" value={sector} onChange={(event) => setSector(event.target.value)} placeholder="Ej. Restaurantero" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-contact-name">Contacto</Label>
              <Input id="company-contact-name" value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Nombre" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-contact-phone">Teléfono</Label>
              <Input id="company-contact-phone" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="Opcional" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="company-notes">Notas</Label>
            <Textarea id="company-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ej. Disponibilidad, cómo la contactaste, etc." rows={3} />
          </div>
        </div>

        <SheetFooter>
          <Button onClick={() => void handleSubmit()} disabled={!isValid || isSaving} className="h-10">
            Registrar empresa
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
