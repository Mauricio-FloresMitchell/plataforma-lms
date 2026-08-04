import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROLE_LABELS } from '@/mocks/users'
import type { Role } from '@/types/auth'
import type { ManagedUser } from '@/types/userManagement'

interface UserAssignSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: ManagedUser | null
  onChangeGroup: (groupName: string) => Promise<void>
  onChangeCareer: (careerName: string) => Promise<void>
  onChangeSubjects: (subjectNames: string[]) => Promise<void>
  onChangeRole: (role: Role) => Promise<void>
}

const ROLES: Role[] = ['alumno', 'profesor', 'administrador']

/** Cambiar grupo/carrera/materias/rol de un usuario (Sprint 13, Parte 5). */
export function UserAssignSheet({ open, onOpenChange, user, onChangeGroup, onChangeCareer, onChangeSubjects, onChangeRole }: UserAssignSheetProps) {
  const [groupName, setGroupName] = useState('')
  const [careerName, setCareerName] = useState('')
  const [subjects, setSubjects] = useState('')
  const [role, setRole] = useState<Role>('alumno')
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !user) return
    setGroupName(user.groupName ?? '')
    setCareerName(user.careerName ?? '')
    setSubjects(user.subjectNames.join(', '))
    setRole(user.role)
  }, [open, user])

  async function run(key: string, action: () => Promise<void>) {
    setIsSubmitting(key)
    try {
      await action()
    } finally {
      setIsSubmitting(null)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Cambiar asignaciones — {user?.name}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 pb-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-group">Grupo</Label>
            <div className="flex gap-2">
              <Input id="user-group" value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="Ej. ADM-501" />
              <Button
                variant="outline"
                disabled={isSubmitting === 'group' || !groupName.trim()}
                onClick={() => void run('group', () => onChangeGroup(groupName.trim()))}
              >
                Guardar
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-career">Carrera</Label>
            <div className="flex gap-2">
              <Input id="user-career" value={careerName} onChange={(event) => setCareerName(event.target.value)} placeholder="Ej. Administración" />
              <Button
                variant="outline"
                disabled={isSubmitting === 'career' || !careerName.trim()}
                onClick={() => void run('career', () => onChangeCareer(careerName.trim()))}
              >
                Guardar
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-subjects">Materias (separadas por coma)</Label>
            <div className="flex gap-2">
              <Input id="user-subjects" value={subjects} onChange={(event) => setSubjects(event.target.value)} placeholder="Materia A, Materia B" />
              <Button
                variant="outline"
                disabled={isSubmitting === 'subjects'}
                onClick={() =>
                  void run('subjects', () =>
                    onChangeSubjects(
                      subjects
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean),
                    ),
                  )
                }
              >
                Guardar
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Rol (solo Administradores puede cambiarlo)</Label>
            <div className="flex gap-2">
              <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                <SelectTrigger className="flex-1">
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
              <Button variant="outline" disabled={isSubmitting === 'role'} onClick={() => void run('role', () => onChangeRole(role))}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
