import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AppsScriptApiError } from '../services/api/appsScriptApi'
import { submitEnrollment } from '../services/enrollment.service'
import { EnrollmentForm } from '../components/EnrollmentForm'
import { EnrollmentResult } from '../components/EnrollmentResult'
import type { EnrollmentRequest, EnrollmentResponse } from '../types/enrollment'

interface SubmittedEnrollment {
  request: EnrollmentRequest
  response: EnrollmentResponse
}

const GENERIC_ERROR_MESSAGE = 'No pudimos registrar al alumno. Inténtalo de nuevo.'

/**
 * Generador de Matrículas: formulario en 3 pasos + resultado.
 * Los datos se registran a través de `enrollment.service.ts`, que consume
 * el Apps Script institucional real mediante `appsScriptApi.ts`.
 */
export function EnrollmentGeneratorPage() {
  const [submitted, setSubmitted] = useState<SubmittedEnrollment | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(values: EnrollmentRequest) {
    setError(null)
    try {
      const response = await submitEnrollment(values)
      setSubmitted({ request: values, response })
    } catch (err) {
      setError(err instanceof AppsScriptApiError ? err.message : GENERIC_ERROR_MESSAGE)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Generador de Matrículas' }]}
        backTo="/admin"
        title="Generador de Matrículas"
        subtitle="Registra un nuevo alumno y genera su matrícula institucional."
      />

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {submitted ? (
        <EnrollmentResult
          request={submitted.request}
          response={submitted.response}
          onReset={() => {
            setSubmitted(null)
            setError(null)
          }}
        />
      ) : (
        <EnrollmentForm onSubmit={handleSubmit} />
      )}
    </div>
  )
}
