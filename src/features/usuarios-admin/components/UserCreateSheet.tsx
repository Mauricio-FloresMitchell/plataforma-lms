import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROLE_LABELS } from '@/mocks/users'
import type { Role } from '@/types/auth'
import type { ManagedUserCreateInput } from '@/types/userManagement'

interface UserCreateSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultRole: Role
  onSubmit: (input: ManagedUserCreateInput) => Promise<void>
}

const ROLES: Role[] = ['alumno', 'profesor', 'administrador']

/** Alta de un usuario nuevo (Sprint 19, Parte 2). */
export function UserCreateSheet({ open, onOpenChange, defaultRole, onSubmit }: UserCreateSheetProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>(defaultRole)
  const [matricula, setMatricula] = useState('')
  const [careerName, setCareerName] = useState('')
  const [groupName, setGroupName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setName('')
    setEmail('')
    setRole(defaultRole)
    setMatricula('')
    setCareerName('')
    setGroupName('')
  }, [open, defaultRole])

  async function handleSubmit() {
    if (!name.trim() || !email.trim()) return
    setIsSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        role,
        matricula: matricula.trim() || undefined,
        careerName: careerName.trim() || undefined,
        groupName: groupName.trim() || undefined,
      })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Nuevo usuario</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-user-name">Nombre</Label>
            <Input id="new-user-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-user-email">Correo</Label>
            <Input id="new-user-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Rol</Label>
            <Select value={role} onValueChange={(value) => setRole(value as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {ROLE_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {role === 'alumno' ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-user-matricula">Matrícula</Label>
              <Input id="new-user-matricula" value={matricula} onChange={(event) => setMatricula(event.target.value)} placeholder="Ej. ADM-2026-0001" />
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-user-career">Carrera (opcional)</Label>
            <Input id="new-user-career" value={careerName} onChange={(event) => setCareerName(event.target.value)} placeholder="Ej. Administración" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-user-group">Grupo (opcional)</Label>
            <Input id="new-user-group" value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="Ej. ADM-501" />
          </div>
          <Button onClick={() => void handleSubmit()} disabled={isSubmitting || !name.trim() || !email.trim()}>
            {isSubmitting ? 'Creando…' : 'Dar de alta'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
