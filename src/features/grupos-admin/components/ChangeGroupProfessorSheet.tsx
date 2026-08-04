import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Group } from '@/types/group'

interface ChangeGroupProfessorSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: Group | null
  onSubmit: (professorName: string) => Promise<void>
}

/** Cambiar el profesor de un grupo (Sprint 13, Parte 4). */
export function ChangeGroupProfessorSheet({ open, onOpenChange, group, onSubmit }: ChangeGroupProfessorSheetProps) {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(group?.professorName ?? '')
  }, [open, group])

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
          <SheetTitle>Cambiar profesor</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="group-new-professor">Nombre del profesor</Label>
            <Input id="group-new-professor" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <Button onClick={() => void handleSubmit()} disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
