import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { ROLE_COLORS, ROLE_ICON_KEYS } from '@/types/rbac'
import type { RoleDefinition, RoleIconKey } from '@/types/rbac'
import { ROLE_ICON_COMPONENTS } from '../utils/roleIcons'

interface RoleFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: RoleDefinition | null
  onSubmit: (input: { name: string; description: string; color: string; icon: RoleIconKey }) => Promise<void>
}

/** Crear/editar los metadatos de un rol personalizado (Sprint 20) — los permisos se editan aparte, en la matriz de la página de detalle. */
export function RoleFormSheet({ open, onOpenChange, role, onSubmit }: RoleFormSheetProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState<string>(ROLE_COLORS[0])
  const [icon, setIcon] = useState<RoleIconKey>('Shield')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(role?.name ?? '')
    setDescription(role?.description ?? '')
    setColor(role?.color ?? ROLE_COLORS[0])
    setIcon(role?.icon ?? 'Shield')
  }, [open, role])

  async function handleSubmit() {
    if (!name.trim()) return
    setIsSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), color, icon })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>{role ? 'Editar rol' : 'Nuevo rol personalizado'}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role-name">Nombre del rol</Label>
            <Input id="role-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Auxiliar de Titulación" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role-description">Descripción</Label>
            <Textarea id="role-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {ROLE_COLORS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setColor(item)}
                  aria-label={`Color ${item}`}
                  className={cn('size-7 rounded-full border-2', color === item ? 'border-foreground' : 'border-transparent')}
                  style={{ backgroundColor: item }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Ícono</Label>
            <div className="flex flex-wrap gap-2">
              {ROLE_ICON_KEYS.map((key) => {
                const Icon = ROLE_ICON_COMPONENTS[key]
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setIcon(key)}
                    aria-label={key}
                    className={cn(
                      'flex size-9 items-center justify-center rounded-lg border',
                      icon === key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-accent',
                    )}
                  >
                    <Icon className="size-4" />
                  </button>
                )
              })}
            </div>
          </div>
          <Button onClick={() => void handleSubmit()} disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? 'Guardando…' : role ? 'Guardar cambios' : 'Crear rol'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
