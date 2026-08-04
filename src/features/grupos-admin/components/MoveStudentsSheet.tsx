import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Group } from '@/types/group'

interface MoveStudentsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceGroup: Group | null
  groups: Group[]
  onSubmit: (toGroupId: string, count: number) => Promise<void>
}

/** Mover alumnos entre grupos (Sprint 13, Parte 4). */
export function MoveStudentsSheet({ open, onOpenChange, sourceGroup, groups, onSubmit }: MoveStudentsSheetProps) {
  const [toGroupId, setToGroupId] = useState('')
  const [count, setCount] = useState('1')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setToGroupId('')
    setCount('1')
  }, [open])

  const targets = groups.filter((group) => group.id !== sourceGroup?.id)
  const isValid = sourceGroup && toGroupId && Number(count) > 0 && Number(count) <= sourceGroup.enrolledCount

  async function handleSubmit() {
    if (!isValid) return
    setIsSubmitting(true)
    try {
      await onSubmit(toGroupId, Number(count))
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Mover alumnos</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          <p className="text-sm text-muted-foreground">
            Desde <span className="font-medium text-foreground">{sourceGroup?.name}</span> ({sourceGroup?.enrolledCount} inscritos)
          </p>
          <div className="flex flex-col gap-1.5">
            <Label>Grupo destino</Label>
            <Select value={toGroupId} onValueChange={setToGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un grupo" />
              </SelectTrigger>
              <SelectContent>
                {targets.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name} ({group.enrolledCount}/{group.capacity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="move-count">Número de alumnos</Label>
            <Input
              id="move-count"
              type="number"
              min={1}
              max={sourceGroup?.enrolledCount ?? 1}
              value={count}
              onChange={(event) => setCount(event.target.value)}
            />
          </div>
          <Button onClick={() => void handleSubmit()} disabled={isSubmitting || !isValid}>
            {isSubmitting ? 'Moviendo…' : 'Mover alumnos'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
