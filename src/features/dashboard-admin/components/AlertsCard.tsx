import { Link } from 'react-router-dom'
import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { AdminAlert, AdminAlertLevel } from '@/types/admin'

const LEVEL_STYLE: Record<AdminAlertLevel, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  critical: 'border-destructive/30 bg-destructive/10 text-destructive',
}

/** Alertas del Dashboard Ejecutivo (Sprint 19, Parte 1): condiciones que requieren atención inmediata. */
export function AlertsCard({ alerts }: { alerts: AdminAlert[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Alertas</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-600" />
            Sin alertas activas. Todo en orden.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {alerts.map((alert) => {
              const content = (
                <div className={cn('flex items-start gap-2 rounded-md border p-3 text-sm', LEVEL_STYLE[alert.level])}>
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <span>{alert.message}</span>
                </div>
              )
              return <li key={alert.id}>{alert.to ? <Link to={alert.to}>{content}</Link> : content}</li>
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
