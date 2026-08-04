import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getCareersAsync } from '@/services/career.service'
import type { Career } from '@/types/career'
import type { AdminSubjectInput, AdminSubjectListItem } from '@/types/subject'

interface SubjectFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: AdminSubjectListItem | null
  onSubmit: (input: AdminSubjectInput) => Promise<void>
}

const TERMS = Array.from({ length: 9 }, (_, index) => index + 1)

/** Formulario de alta/edición de Materia (Sprint 13, Parte 3). */
export function SubjectFormSheet({ open, onOpenChange, subject, onSubmit }: SubjectFormSheetProps) {
  const [careers, setCareers] = useState<Career[]>([])
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [credits, setCredits] = useState('4')
  const [careerId, setCareerId] = useState('')
  const [term, setTerm] = useState('1')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    getCareersAsync().then(setCareers)
    setName(subject?.name ?? '')
    setCode(subject?.code ?? '')
    setCredits(String(subject?.credits ?? 4))
    setCareerId(subject?.careerId ?? '')
    setTerm(String(subject?.term ?? 1))
  }, [open, subject])

  const isValid = name.trim() && code.trim() && careerId && Number(credits) > 0

  async function handleSubmit() {
    if (!isValid) return
    setIsSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), code: code.trim(), credits: Number(credits), careerId, term: Number(term) })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{subject ? 'Editar materia' : 'Nueva materia'}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subject-name">Nombre</Label>
            <Input id="subject-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Administración Estratégica" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subject-code">Clave</Label>
            <Input id="subject-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Ej. ADM-501" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Carrera</Label>
            <Select value={careerId} onValueChange={setCareerId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una carrera" />
              </SelectTrigger>
              <SelectContent>
                {careers.map((career) => (
                  <SelectItem key={career.id} value={career.id}>
                    {career.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Cuatrimestre</Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TERMS.map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="subject-credits">Créditos</Label>
              <Input
                id="subject-credits"
                type="number"
                min={1}
                value={credits}
                onChange={(event) => setCredits(event.target.value)}
              />
            </div>
          </div>
          <Button onClick={() => void handleSubmit()} disabled={isSubmitting || !isValid}>
            {isSubmitting ? 'Guardando…' : subject ? 'Guardar cambios' : 'Crear materia'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
