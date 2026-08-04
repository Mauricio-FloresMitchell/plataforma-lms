import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getAdminSubjectsAsync } from '@/services/subject.service'
import type { AdminSubjectListItem } from '@/types/subject'
import type { Group, GroupInput } from '@/types/group'

interface GroupFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: Group | null
  onSubmit: (input: GroupInput) => Promise<void>
}

/** Formulario de alta/edición de Grupo (Sprint 13, Parte 4). */
export function GroupFormSheet({ open, onOpenChange, group, onSubmit }: GroupFormSheetProps) {
  const [subjects, setSubjects] = useState<AdminSubjectListItem[]>([])
  const [name, setName] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [professorName, setProfessorName] = useState('')
  const [capacity, setCapacity] = useState('30')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    getAdminSubjectsAsync().then(setSubjects)
    setName(group?.name ?? '')
    setSubjectId(group?.subjectId ?? '')
    setProfessorName(group?.professorName ?? '')
    setCapacity(String(group?.capacity ?? 30))
  }, [open, group])

  const isValid = name.trim() && subjectId && professorName.trim() && Number(capacity) > 0

  async function handleSubmit() {
    if (!isValid) return
    setIsSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), subjectId, professorName: professorName.trim(), capacity: Number(capacity) })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{group ? 'Editar grupo' : 'Nuevo grupo'}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="group-name">Nombre del grupo</Label>
            <Input id="group-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. ADM-501" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Materia</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una materia" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="group-professor">Profesor</Label>
            <Input
              id="group-professor"
              value={professorName}
              onChange={(event) => setProfessorName(event.target.value)}
              placeholder="Ej. Ing. Carlos Mendoza"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="group-capacity">Capacidad</Label>
            <Input id="group-capacity" type="number" min={1} value={capacity} onChange={(event) => setCapacity(event.target.value)} />
          </div>
          <Button onClick={() => void handleSubmit()} disabled={isSubmitting || !isValid}>
            {isSubmitting ? 'Guardando…' : group ? 'Guardar cambios' : 'Crear grupo'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
