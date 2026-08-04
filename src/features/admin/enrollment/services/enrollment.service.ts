import { appsScriptApi } from './api/appsScriptApi'
import type { EnrollmentRequest, EnrollmentResponse } from '../types/enrollment'

/**
 * Capa de acceso a datos del Generador de Matrículas.
 *
 * A partir del Sprint 11 consume el Apps Script institucional real a
 * través de `appsScriptApi` (services/api/appsScriptApi.ts), que es el
 * único archivo que conoce la URL del backend. El mock en memoria del
 * Sprint 10 fue retirado; la firma pública de `submitEnrollment` y el
 * contrato EnrollmentRequest/EnrollmentResponse no cambiaron, por lo que
 * la UI (EnrollmentForm, EnrollmentResult, EnrollmentGeneratorPage) no
 * requirió modificaciones para esta migración.
 */
export async function submitEnrollment(datos: EnrollmentRequest): Promise<EnrollmentResponse> {
  return appsScriptApi.registrarYGenerarPDF(datos)
}
