import { Eye, EyeOff, FileText, FileType2, Sheet, Presentation, Image, Video, Link as LinkIcon, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Material } from '@/types/subject'

interface MaterialListProps {
  materials: Material[]
  onDelete?: (material: Material) => void
  /** Ocultar/mostrar (Sprint 17, Parte 3 — Gestión de Materiales del profesor). */
  onToggleHidden?: (material: Material) => void
}

const typeConfig = {
  pdf: { icon: FileText, label: 'PDF' },
  word: { icon: FileType2, label: 'Word' },
  excel: { icon: Sheet, label: 'Excel' },
  powerpoint: { icon: Presentation, label: 'PowerPoint' },
  imagen: { icon: Image, label: 'Imagen' },
  video: { icon: Video, label: 'Video' },
  enlace: { icon: LinkIcon, label: 'Enlace' },
}

export function MaterialList({ materials, onDelete, onToggleHidden }: MaterialListProps) {
  if (materials.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No hay materiales</p>
  }

  return (
    <div className="space-y-2">
      {materials.map((material) => {
        const config = typeConfig[material.type]
        const Icon = config.icon

        return (
          <div
            key={material.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-medium truncate">{material.title}</p>
                  {material.category ? <Badge variant="outline">{material.category}</Badge> : null}
                  {material.isHidden ? <Badge variant="secondary">Oculto</Badge> : null}
                </div>
                {material.description ? <p className="text-xs text-muted-foreground mt-0.5">{material.description}</p> : null}
                <p className="text-xs text-muted-foreground">
                  {config.label} • {new Date(material.uploadedAt).toLocaleDateString('es-ES')}
                  {material.tags && material.tags.length > 0 ? ` • ${material.tags.join(', ')}` : ''}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <a href={material.url} target="_blank" rel="noopener noreferrer">
                  Abrir
                </a>
              </Button>
              {onToggleHidden ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-8 p-0"
                  aria-label={material.isHidden ? `Mostrar ${material.title}` : `Ocultar ${material.title}`}
                  onClick={() => onToggleHidden(material)}
                >
                  {material.isHidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </Button>
              ) : null}
              {onDelete ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-8 p-0 text-destructive hover:text-destructive"
                  aria-label={`Eliminar ${material.title}`}
                  onClick={() => onDelete(material)}
                >
                  <Trash2 className="size-4" />
                </Button>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
