import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AdminSubjectListItem } from '@/types/subject'

interface AssignProfessorSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: AdminSubjectListItem | null
  onSubmit: (professorName: string) => Promise<void>
}

/** Asignar/cambiar profesor titular de una materia (Sprint 13, Parte 3). */
export function AssignProfessorSheet({ open, onOpenChange, subject, onSubmit }: AssignProfessorSheetProps) {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(subject?.professorName ?? '')
  }, [open, subject])

  async function handleSubmit() {
    if (!name.trim()) return
    setIsSubmitting(true)
    try {
      await onSubmit(name.trim())
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>{subject?.professorName ? 'Cambiar profesor' : 'Asignar profesor'}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="professor-name">Nombre del profesor</Label>
            <Input id="professor-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Ing. Carlos Mendoza" />
          </div>
          <Button onClick={() => void handleSubmit()} disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? 'Guardando…' : 'Asignar'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
