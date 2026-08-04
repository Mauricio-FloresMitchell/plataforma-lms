import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ManagedUser, ManagedUserEditInput } from '@/types/userManagement'

interface UserEditSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: ManagedUser | null
  onSubmit: (input: ManagedUserEditInput) => Promise<void>
}

/** Editar nombre/correo/matrícula de un usuario (Sprint 13, Parte 5; matrícula agregada en Sprint 19, Parte 2). */
export function UserEditSheet({ open, onOpenChange, user, onSubmit }: UserEditSheetProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [matricula, setMatricula] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(user?.name ?? '')
    setEmail(user?.email ?? '')
    setMatricula(user?.matricula ?? '')
  }, [open, user])

  async function handleSubmit() {
    if (!name.trim() || !email.trim()) return
    setIsSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), email: email.trim(), matricula: matricula.trim() || undefined })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Editar usuario</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-name">Nombre</Label>
            <Input id="user-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-email">Correo</Label>
            <Input id="user-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          {user?.role === 'alumno' ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-matricula">Matrícula</Label>
              <Input id="user-matricula" value={matricula} onChange={(event) => setMatricula(event.target.value)} placeholder="Ej. ADM-2026-0001" />
            </div>
          ) : null}
          <Button onClick={() => void handleSubmit()} disabled={isSubmitting || !name.trim() || !email.trim()}>
            {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
