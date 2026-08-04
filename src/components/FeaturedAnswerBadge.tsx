import { CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

/** Distintivo visual de "Respuesta destacada" (Foro, Sprint 13.1). */
export function FeaturedAnswerBadge() {
  return (
    <Badge className="gap-1 bg-emerald-100 text-emerald-800">
      <CheckCircle2 className="size-3.5" />
      Respuesta destacada
    </Badge>
  )
}
