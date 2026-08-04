import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Career, CareerInput } from '@/types/career'

interface CareerFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  career: Career | null
  onSubmit: (input: CareerInput) => Promise<void>
}

/** Formulario de alta/edición de Carrera (Sprint 13, Parte 2). */
export function CareerFormSheet({ open, onOpenChange, career, onSubmit }: CareerFormSheetProps) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(career?.name ?? '')
    setCode(career?.code ?? '')
  }, [open, career])

  async function handleSubmit() {
    if (!name.trim() || !code.trim()) return
    setIsSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), code: code.trim().toUpperCase() })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{career ? 'Editar carrera' : 'Nueva carrera'}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="career-name">Nombre</Label>
            <Input id="career-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Administración" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="career-code">Clave</Label>
            <Input id="career-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Ej. ADM" maxLength={6} />
          </div>
          <Button onClick={() => void handleSubmit()} disabled={isSubmitting || !name.trim() || !code.trim()}>
            {isSubmitting ? 'Guardando…' : career ? 'Guardar cambios' : 'Crear carrera'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
