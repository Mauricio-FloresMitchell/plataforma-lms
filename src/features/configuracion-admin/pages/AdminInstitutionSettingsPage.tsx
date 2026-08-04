import { useEffect, useState } from 'react'
import { Braces, Calendar, Database, HardDrive, KeyRound, Mail, Plug, Plus, Server, ShieldCheck, Sparkles, Trash2, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/PageHeader'
import { formatDateTime } from '@/utils/date'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getInstitutionSettingsAsync, updateInstitutionSettingsAsync } from '@/services/institution.service'
import type { InstitutionSettings, InstitutionVariable } from '@/types/institution'

/** Configuración Institucional (Sprint 13, Parte 11): nueva ruta, no toca /admin/configuracion (ajustes de cuenta, compartidos). */
export function AdminInstitutionSettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<InstitutionSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  const actor = user ? { id: user.id, name: user.name, role: user.role } : null

  useEffect(() => {
    getInstitutionSettingsAsync()
      .then(setSettings)
      .finally(() => setIsLoading(false))
  }, [])

  function update<K extends keyof InstitutionSettings>(key: K, value: InstitutionSettings[K]) {
    setSettings((current) => (current ? { ...current, [key]: value } : current))
  }

  function updateVariable(index: number, field: keyof InstitutionVariable, value: string) {
    setSettings((current) => {
      if (!current) return current
      const variables = current.variables.map((item, i) => (i === index ? { ...item, [field]: value } : item))
      return { ...current, variables }
    })
  }

  function addVariable() {
    setSettings((current) => (current ? { ...current, variables: [...current.variables, { key: '', value: '' }] } : current))
  }

  function removeVariable(index: number) {
    setSettings((current) => (current ? { ...current, variables: current.variables.filter((_, i) => i !== index) } : current))
  }

  async function handleSave() {
    if (!actor || !settings) return
    setIsSaving(true)
    try {
      const updated = await updateInstitutionSettingsAsync(actor, settings)
      setSettings(updated)
      setSavedAt(updated.updatedAt)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Configuración Institucional' }]}
        title="Configuración Institucional"
        subtitle="Ajustes generales de Universidad Imperalianz, almacenados con el sistema de persistencia existente."
      />

      {isLoading || !settings ? (
        <div className="space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : (
        <>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Identidad</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="inst-name">Nombre de la universidad</Label>
                <Input id="inst-name" value={settings.universityName} onChange={(event) => update('universityName', event.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="inst-logo">URL del logotipo</Label>
                <Input id="inst-logo" value={settings.logoUrl} onChange={(event) => update('logoUrl', event.target.value)} placeholder="https://…" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="inst-color">Color principal (dato administrable — no cambia el tema visual actual)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="inst-color"
                    type="color"
                    value={settings.primaryColor}
                    onChange={(event) => update('primaryColor', event.target.value)}
                    className="h-10 w-16 p-1"
                  />
                  <Input value={settings.primaryColor} onChange={(event) => update('primaryColor', event.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Periodo</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="inst-period">Periodo activo</Label>
                <Input id="inst-period" value={settings.activePeriod} onChange={(event) => update('activePeriod', event.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="inst-cycle">Ciclo escolar</Label>
                <Input id="inst-cycle" value={settings.schoolCycle} onChange={(event) => update('schoolCycle', event.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Evaluación, Leaderboard y Badges</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="inst-scale">Escala de evaluación</Label>
                <Textarea id="inst-scale" value={settings.evaluationScaleNote} onChange={(event) => update('evaluationScaleNote', event.target.value)} rows={2} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Leaderboard habilitado</p>
                  <p className="text-xs text-muted-foreground">No modifica el algoritmo de ranking, solo su visibilidad institucional.</p>
                </div>
                <Switch checked={settings.leaderboardEnabled} onCheckedChange={(checked) => update('leaderboardEnabled', checked)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Badges habilitados</p>
                </div>
                <Switch checked={settings.badgesEnabled} onCheckedChange={(checked) => update('badgesEnabled', checked)} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Plantillas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="inst-pdf">Plantilla PDF</Label>
                <Textarea id="inst-pdf" value={settings.pdfTemplateNote} onChange={(event) => update('pdfTemplateNote', event.target.value)} rows={2} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="inst-email">Plantilla de correo</Label>
                <Textarea id="inst-email" value={settings.emailTemplateNote} onChange={(event) => update('emailTemplateNote', event.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Variables institucionales</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {settings.variables.map((variable, index) => (
                <div key={index} className="flex gap-2">
                  <Input value={variable.key} onChange={(event) => updateVariable(index, 'key', event.target.value)} placeholder="clave" className="w-1/3" />
                  <Input value={variable.value} onChange={(event) => updateVariable(index, 'value', event.target.value)} placeholder="valor" className="flex-1" />
                  <Button variant="ghost" size="icon-sm" aria-label="Eliminar variable" onClick={() => removeVariable(index)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="self-start" onClick={addVariable}>
                <Plus className="size-3.5" />
                Agregar variable
              </Button>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button onClick={() => void handleSave()} disabled={isSaving}>
              {isSaving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
            {savedAt ? <p className="text-xs text-muted-foreground">Guardado {formatDateTime(savedAt)}</p> : null}
          </div>

          <Card className="shadow-sm border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Configuración General
                <Badge variant="outline" className="text-[10px]">Próximamente</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-xs text-muted-foreground">
                Arquitectura preparada para la Fase Backend (Sprint 20): la interfaz existe, sin conectar todavía ningún servicio externo ni backend real.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 opacity-70">
                  <Label className="flex items-center gap-1.5"><Mail className="size-3.5" />Correo institucional (SMTP)</Label>
                  <Input disabled placeholder="smtp.imperalianz.edu.mx" />
                </div>
                <div className="flex flex-col gap-1.5 opacity-70">
                  <Label className="flex items-center gap-1.5"><Video className="size-3.5" />Zoom</Label>
                  <Input disabled placeholder="Client ID de la integración" />
                </div>
                <div className="flex flex-col gap-1.5 opacity-70">
                  <Label className="flex items-center gap-1.5"><Plug className="size-3.5" />Google Workspace</Label>
                  <Input disabled placeholder="Cuenta de servicio" />
                </div>
                <div className="flex flex-col gap-1.5 opacity-70">
                  <Label className="flex items-center gap-1.5"><HardDrive className="size-3.5" />Google Drive</Label>
                  <Input disabled placeholder="Carpeta raíz institucional" />
                </div>
                <div className="flex flex-col gap-1.5 opacity-70">
                  <Label className="flex items-center gap-1.5"><Calendar className="size-3.5" />Google Calendar</Label>
                  <Input disabled placeholder="Calendario institucional" />
                </div>
                <div className="flex flex-col gap-1.5 opacity-70">
                  <Label className="flex items-center gap-1.5"><Sparkles className="size-3.5" />OpenAI</Label>
                  <Input disabled placeholder="API key" />
                </div>
                <div className="flex flex-col gap-1.5 opacity-70">
                  <Label className="flex items-center gap-1.5"><Server className="size-3.5" />Spring Boot Backend</Label>
                  <Input disabled placeholder="https://api.imperalianz.edu.mx" />
                </div>
                <div className="flex flex-col gap-1.5 opacity-70">
                  <Label className="flex items-center gap-1.5"><Database className="size-3.5" />Base de Datos</Label>
                  <Input disabled placeholder="Cadena de conexión" />
                </div>
                <div className="flex flex-col gap-1.5 opacity-70">
                  <Label className="flex items-center gap-1.5"><KeyRound className="size-3.5" />API Keys</Label>
                  <Input disabled placeholder="Administrar claves de acceso" />
                </div>
                <div className="flex flex-col gap-1.5 opacity-70">
                  <Label className="flex items-center gap-1.5"><Braces className="size-3.5" />Variables del sistema</Label>
                  <Input disabled placeholder="Variables globales de entorno" />
                </div>
                <div className="flex flex-col gap-1.5 opacity-70">
                  <Label className="flex items-center gap-1.5"><Plug className="size-3.5" />Otras integraciones</Label>
                  <Input disabled placeholder="Webhook / API key" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-dashed border-border p-3 opacity-70">
                <div>
                  <p className="text-sm font-medium text-foreground">Notificaciones push por correo</p>
                  <p className="text-xs text-muted-foreground">Distinto del Centro de Notificaciones (ya funcional) — esto es el canal de envío.</p>
                </div>
                <Switch disabled checked={false} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-dashed border-border p-3 opacity-70">
                <div>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1.5"><ShieldCheck className="size-3.5" />Seguridad — autenticación de dos factores</p>
                  <p className="text-xs text-muted-foreground">El RBAC (roles y permisos) ya está implementado — 2FA queda preparado para la Fase Backend.</p>
                </div>
                <Switch disabled checked={false} />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
