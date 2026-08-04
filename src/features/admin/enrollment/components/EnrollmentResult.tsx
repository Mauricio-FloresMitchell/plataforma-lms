import { Award, Download, KeyRound, UserPlus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { EnrollmentRequest, EnrollmentResponse } from '../types/enrollment'

interface EnrollmentResultProps {
  request: EnrollmentRequest
  response: EnrollmentResponse
  onReset: () => void
}

/** Resultado del registro: matrícula generada, grupo asignado y datos capturados. */
export function EnrollmentResult({ request, response, onReset }: EnrollmentResultProps) {
  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50 p-8 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-green-100">
          <Award className="size-7 text-green-700" />
        </div>
        <h2 className="text-lg font-semibold text-green-900">Matrícula generada</h2>
        <p className="mt-1 text-sm text-green-800">
          {request.nombreCompleto} ha sido registrado correctamente.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-6 text-center">
          <p className="mb-2 text-xs text-muted-foreground">Matrícula</p>
          <p className="font-mono text-xl font-bold">{response.matricula}</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="mb-2 text-xs text-muted-foreground">Grupo</p>
          <p className="text-xl font-bold">{response.grupo}</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="mb-2 text-xs text-muted-foreground">Número de alumno</p>
          <p className="font-mono text-xl font-bold">{response.numeroAlumno}</p>
        </Card>
      </div>

      {response.usuario || response.contrasenaTemporal ? (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Acceso a la plataforma</h3>
          </div>
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Usuario</dt>
              <dd className="mt-0.5 font-mono font-medium">{response.usuario || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Contraseña temporal</dt>
              <dd className="mt-0.5 font-mono font-medium">{response.contrasenaTemporal || '—'}</dd>
            </div>
          </dl>
        </Card>
      ) : null}

      <Card className="p-6">
        <h3 className="mb-4 text-sm font-semibold">Datos registrados</h3>
        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Correo</dt>
            <dd className="mt-0.5 font-medium">{request.correo}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Teléfono</dt>
            <dd className="mt-0.5 font-medium">{request.telefono}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Programa</dt>
            <dd className="mt-0.5 font-medium">{request.programa}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Modalidad</dt>
            <dd className="mt-0.5 font-medium">{request.modalidad}</dd>
          </div>
        </dl>
      </Card>

      <Card className="flex items-center justify-between gap-4 bg-muted/40 p-4">
        <div className="flex items-center gap-3">
          <Download className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Carta de bienvenida</p>
            <p className="text-xs text-muted-foreground">
              {response.pdfUrl
                ? 'Generada automáticamente y almacenada en Google Drive.'
                : 'No se recibió un PDF en la respuesta del servidor.'}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" disabled={!response.pdfUrl} asChild={!!response.pdfUrl}>
          {response.pdfUrl ? (
            <a href={response.pdfUrl} target="_blank" rel="noopener noreferrer">
              Descargar carta
            </a>
          ) : (
            <span>Descargar carta</span>
          )}
        </Button>
      </Card>

      <Button onClick={onReset} className="w-fit">
        <UserPlus className="size-4" />
        Registrar otro alumno
      </Button>
    </div>
  )
}
