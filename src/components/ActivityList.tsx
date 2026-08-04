import { CheckCircle2, Clock, AlertCircle, Copy, Eye, EyeOff, Paperclip, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Activity } from '@/types/subject'

interface ActivityListProps {
  activities: Activity[]
  onEdit?: (activity: Activity) => void
  onDelete?: (activity: Activity) => void
  /** Navega al detalle de la actividad (Sprint 16, vista del alumno). No se usa junto con onEdit/onDelete. */
  onSelect?: (activity: Activity) => void
  /** Duplicar/ocultar (Sprint 17, Parte 2 — Gestión de Actividades del profesor). */
  onDuplicate?: (activity: Activity) => void
  onToggleHidden?: (activity: Activity) => void
}

const statusConfig = {
  completada: { icon: CheckCircle2, color: 'bg-green-100 text-green-800', label: 'Completada' },
  pendiente: { icon: Clock, color: 'bg-blue-100 text-blue-800', label: 'Pendiente' },
  atrasada: { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Atrasada' },
}

export function ActivityList({ activities, onEdit, onDelete, onSelect, onDuplicate, onToggleHidden }: ActivityListProps) {
  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No hay actividades</p>
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const config = statusConfig[activity.status]
        const StatusIcon = config.icon

        return (
          <div
            key={activity.id}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            onClick={onSelect ? () => onSelect(activity) : undefined}
            onKeyDown={
              onSelect
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onSelect(activity)
                    }
                  }
                : undefined
            }
            className={`flex items-start gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors ${onSelect ? 'cursor-pointer' : ''}`}
          >
            <StatusIcon className="w-5 h-5 mt-1 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium text-sm">{activity.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {activity.isHidden ? <Badge variant="secondary">Oculta</Badge> : null}
                  <Badge className={config.color}>{config.label}</Badge>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <p className="text-xs text-muted-foreground">
                  Vencimiento: {new Date(activity.dueDate).toLocaleDateString('es-ES')}
                </p>
                {activity.attachments && activity.attachments.length > 0 ? (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Paperclip className="size-3" />
                    {activity.attachments.length} adjunto{activity.attachments.length > 1 ? 's' : ''}
                  </span>
                ) : null}
              </div>
            </div>
            {(onEdit || onDelete || onDuplicate || onToggleHidden) && (
              <div className="flex shrink-0 items-center gap-1">
                {onEdit ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 p-0"
                    aria-label={`Editar ${activity.title}`}
                    onClick={() => onEdit(activity)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                ) : null}
                {onDuplicate ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 p-0"
                    aria-label={`Duplicar ${activity.title}`}
                    onClick={() => onDuplicate(activity)}
                  >
                    <Copy className="size-4" />
                  </Button>
                ) : null}
                {onToggleHidden ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 p-0"
                    aria-label={activity.isHidden ? `Mostrar ${activity.title}` : `Ocultar ${activity.title}`}
                    onClick={() => onToggleHidden(activity)}
                  >
                    {activity.isHidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </Button>
                ) : null}
                {onDelete ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 p-0 text-destructive hover:text-destructive"
                    aria-label={`Eliminar ${activity.title}`}
                    onClick={() => onDelete(activity)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
