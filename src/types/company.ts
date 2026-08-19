/**
 * Tipos de Empresas / Sistema de Prospección Estudiantil (Manual de Mejoras
 * Transversales, Mejora 2). El alumno registra las empresas que prospecta,
 * confirma con cuál trabajará y adjunta la carta firmada; el profesor
 * consulta el banco de empresas de cada alumno desde su roster.
 */

export type CompanyProspectStatus = 'candidata' | 'confirmada' | 'rechazada'

/** Carta de autorización firmada (Semana 3 del Guión de 5 Pasos). Solo se guarda el nombre — sin carga real de archivos, mismo criterio que el resto del MVP. */
export interface CompanyLetterAttachment {
  id: string
  name: string
  uploadedAt: string
}

export interface CompanyProspect {
  id: string
  studentId: string
  studentName: string
  subjectId: string
  name: string
  sector?: string
  contactName?: string
  contactPhone?: string
  notes?: string
  status: CompanyProspectStatus
  letter?: CompanyLetterAttachment
  createdAt: string
  confirmedAt?: string
}

/** Datos capturados por el alumno al registrar una empresa candidata. */
export interface CompanyProspectInput {
  name: string
  sector?: string
  contactName?: string
  contactPhone?: string
  notes?: string
}
