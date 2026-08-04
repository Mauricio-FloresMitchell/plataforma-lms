import { useState } from 'react'
import { Link2, User } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { INCIDENT_ORIGIN_LABELS, INCIDENT_STATUS_LABELS } from '@/types/incident'
import type { Incident, IncidentStatus } from '@/types/incident'

const STATUS_COLOR: Record<IncidentStatus, string> = {
  abierto: 'bg-amber-100 text-amber-800',
  en_proceso: 'bg-blue-100 text-blue-800',
  resuelto: 'bg-emerald-100 text-emerald-800',
  cerrado: 'bg-slate-200 text-slate-700',
}

const STATUS_OPTIONS: IncidentStatus[] = ['abierto', 'en_proceso', 'resuelto', 'cerrado']

interface IncidentCardProps {
  incident: Incident
  onSetStatus: (status: IncidentStatus, note?: string) => Promise<void>
  onAssign: (responsibleName: string) => Promise<void>
}

/** Tarjeta de una incidencia (Sprint 19, Parte 8): estado, responsable e historial. */
export function IncidentCard({ incident, onSetStatus, onAssign }: IncidentCardProps) {
  const [note, setNote] = useState('')
  const [responsible, setResponsible] = useState(incident.responsibleName ?? '')
  const [isSaving, setIsSaving] = useState(false)

  async function run(action: () => Promise<void>) {
    setIsSaving(true)
    try {
      await action()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{incident.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{incident.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{INCIDENT_ORIGIN_LABELS[incident.origin]}</Badge>
          <Badge className={STATUS_COLOR[incident.status]}>{INCIDENT_STATUS_LABELS[incident.status]}</Badge>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Reportado por {incident.reportedByName}
        {incident.responsibleName ? ` · Asignado a ${incident.responsibleName}` : ''}
        {incident.relatedLink ? (
          <>
            {' · '}
            <Link2 className="inline size-3" /> <a href={incident.relatedLink} className="text-primary hover:underline">Ver origen</a>
          </>
        ) : null}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={incident.status} onValueChange={(value) => void run(() => onSetStatus(value as IncidentStatus, note || undefined))}>
          <SelectTrigger className="h-8 w-40 text-xs" disabled={isSaving}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>{INCIDENT_STATUS_LABELS[status]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Nota (opcional)" className="h-8 max-w-56 text-xs" />
        <Input value={responsible} onChange={(event) => setResponsible(event.target.value)} placeholder="Responsable" className="h-8 max-w-40 text-xs" />
        <Button size="sm" variant="outline" disabled={isSaving || !responsible.trim()} onClick={() => void run(() => onAssign(responsible.trim()))}>
          <User className="size-3.5" />
          Asignar
        </Button>
      </div>

      {incident.history.length > 0 ? (
        <div className="space-y-1 border-t border-border pt-2">
          {incident.history.map((entry) => (
            <p key={entry.id} className="text-xs text-muted-foreground">
              {new Date(entry.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} · {entry.performedByName} — {entry.action}
              {entry.note ? `: ${entry.note}` : ''}
            </p>
          ))}
        </div>
      ) : null}
    </Card>
  )
}
