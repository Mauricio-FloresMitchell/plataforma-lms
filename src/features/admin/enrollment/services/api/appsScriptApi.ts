import type {
  AppsScriptEnvelope,
  EnrollmentRequest,
  EnrollmentResponse,
} from '../../types/enrollment'

/**
 * Único archivo del proyecto que conoce la URL del Apps Script institucional
 * (Google Sheets + generación de PDF de la carta de bienvenida).
 *
 * La URL se configura mediante la variable de entorno VITE_APPS_SCRIPT_URL
 * (ver .env.example) y nunca se hardcodea en el código fuente.
 *
 * El cuerpo se envía como `text/plain;charset=utf-8` (no `application/json`)
 * a propósito: Apps Script no responde al preflight CORS (OPTIONS) que el
 * navegador dispararía con un Content-Type "application/json". Apps Script
 * igual interpreta el cuerpo como JSON vía `e.postData.contents`. Mismo
 * patrón ya usado en el dashboard de Alumno original del proyecto.
 */

export class AppsScriptApiError extends Error {}

export interface AppsScriptEnrollmentApi {
  /** Genera matrícula, registra al alumno y genera la carta de bienvenida en PDF. */
  registrarYGenerarPDF(datos: EnrollmentRequest): Promise<EnrollmentResponse>
}

function getBaseUrl(): string {
  const url = import.meta.env.VITE_APPS_SCRIPT_URL

  if (!url) {
    throw new AppsScriptApiError(
      'La URL del Apps Script no está configurada. Define VITE_APPS_SCRIPT_URL en tu archivo .env.local (ver .env.example).',
    )
  }

  return url
}

async function registrarYGenerarPDF(datos: EnrollmentRequest): Promise<EnrollmentResponse> {
  const baseUrl = getBaseUrl()

  let response: Response
  try {
    response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(datos),
    })
  } catch {
    throw new AppsScriptApiError(
      'No se pudo conectar con el servidor de matrículas. Verifica tu conexión e inténtalo de nuevo.',
    )
  }

  if (!response.ok) {
    throw new AppsScriptApiError(
      `El servidor de matrículas respondió con un error (${response.status}).`,
    )
  }

  let envelope: AppsScriptEnvelope<EnrollmentResponse>
  try {
    envelope = await response.json()
  } catch {
    throw new AppsScriptApiError('La respuesta del servidor de matrículas no tiene un formato válido.')
  }

  if (!envelope.success || !envelope.data) {
    throw new AppsScriptApiError(
      envelope.error || envelope.message || 'No se pudo registrar al alumno.',
    )
  }

  return envelope.data
}

export const appsScriptApi: AppsScriptEnrollmentApi = { registrarYGenerarPDF }
