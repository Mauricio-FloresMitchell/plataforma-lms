import { useRef, useState } from 'react'
import { Database, Download, RotateCcw, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  exportBackupDatabaseAsync,
  exportBackupExcelAsync,
  exportBackupJsonAsync,
  importBackupAsync,
  simulateRestoreAsync,
} from '@/services/backup.service'

/** Respaldos (Sprint 13, Parte 13): exportar/importar/simular restauración, sin servidores externos. */
export function AdminBackupsPage() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const actor = user ? { id: user.id, name: user.name, role: user.role } : null

  async function handleExportJson() {
    if (!actor) return
    await exportBackupJsonAsync(actor)
    setMessage({ text: 'Respaldo JSON descargado.', isError: false })
  }

  async function handleExportExcel() {
    if (!actor) return
    await exportBackupExcelAsync(actor)
    setMessage({ text: 'Resumen en Excel (CSV) descargado.', isError: false })
  }

  async function handleExportDatabase() {
    if (!actor) return
    await exportBackupDatabaseAsync(actor)
    setMessage({ text: 'Respaldo completo de la base de datos descargado.', isError: false })
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !actor) return
    setIsBusy(true)
    try {
      const result = await importBackupAsync(actor, file)
      setMessage({ text: result.message, isError: !result.isValid })
    } finally {
      setIsBusy(false)
    }
  }

  async function handleSimulateRestore() {
    if (!actor) return
    if (!window.confirm('¿Simular la restauración del último respaldo importado? Esta acción queda registrada en Auditoría.')) return
    setIsBusy(true)
    try {
      await simulateRestoreAsync(actor)
      setMessage({ text: 'Restauración simulada correctamente. Ver detalle en Auditoría.', isError: false })
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Respaldos' }]}
        title="Respaldos"
        subtitle="Exporta e importa respaldos de la plataforma. No hay servidores externos: todo se procesa en el navegador."
      />

      {message ? (
        <Alert variant={message.isError ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Exportar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => void handleExportJson()}>
            <Download className="size-4" />
            Exportar JSON
          </Button>
          <Button variant="outline" onClick={() => void handleExportExcel()}>
            <Download className="size-4" />
            Exportar Excel
          </Button>
          <Button variant="outline" onClick={() => void handleExportDatabase()}>
            <Database className="size-4" />
            Exportar Base de Datos
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Importar y restaurar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={(event) => void handleImport(event)} />
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" disabled={isBusy} onClick={() => fileInputRef.current?.click()}>
              <Upload className="size-4" />
              Importar respaldo
            </Button>
            <Button variant="outline" disabled={isBusy} onClick={() => void handleSimulateRestore()}>
              <RotateCcw className="size-4" />
              Simular restauración
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            La importación valida el archivo y queda registrada en Auditoría. La restauración es simulada — no sobrescribe los
            datos en memoria de la sesión actual.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
