import type { AttachmentKind } from '@/types/chat'

/**
 * Tipos de dominio de la Biblioteca Institucional (Sprint 13, Parte 10).
 * Sprint 19, Parte 5 la convierte en un Gestor Documental: categorías
 * ampliadas, etiquetas, versionado, y programación de publicación/vencimiento.
 */

/**
 * Categorías additivas (Sprint 16, Parte 6; Sprint 19, Parte 5) — cada
 * sprint agrega categorías nuevas sin quitar ninguna, para no invalidar los
 * documentos ya sembrados ni los formularios existentes.
 */
export const LIBRARY_CATEGORIES = [
  'Plan de estudios',
  'Material didáctico',
  'Formatos',
  'Normatividad',
  'Otro',
  'Reglamentos',
  'Manuales',
  'Recursos Institucionales',
  'Casos de estudio',
  'Plantillas',
  'Clases grabadas',
  'Material complementario',
  'Biblioteca Digital',
  'Videos',
  'Presentaciones',
  'Archivos de apoyo',
] as const
export type LibraryCategory = (typeof LIBRARY_CATEGORIES)[number]

/** Snapshot de una versión reemplazada (Sprint 19, Parte 5) — nunca se sobrescribe, solo se agrega. */
export interface LibraryVersionEntry {
  version: number
  fileName: string
  size: number
  uploadedByName: string
  uploadedAt: string
}

export interface LibraryDocument {
  id: string
  title: string
  fileName: string
  /** Reutiliza la misma clasificación de archivos que Chat (`types/chat.ts`, `AttachmentKind`). */
  kind: AttachmentKind
  category: LibraryCategory
  careerName?: string
  subjectName?: string
  professorName?: string
  /** Bytes. Simulado — no hay carga real de archivos en el MVP. */
  size: number
  url: string
  uploadedByName: string
  createdAt: string
  updatedAt: string
  /** Solo para `category === 'Clases grabadas'` (Sprint 16, Parte 7). */
  durationMinutes?: number
  /** Etiquetas libres para búsqueda avanzada (Sprint 19, Parte 5). */
  tags: string[]
  /** Versión actual del archivo — se incrementa en cada reemplazo (Sprint 19, Parte 5). */
  version: number
  /** Historial de versiones reemplazadas, más reciente primero. La versión vigente no aparece aquí. */
  versions: LibraryVersionEntry[]
  /** Fecha ISO desde la que el documento es visible fuera de Administración. Ausente = visible de inmediato. */
  publishAt?: string
  /** Fecha ISO a partir de la que el documento deja de ser visible. Ausente = no vence. */
  expiresAt?: string
}

export interface LibraryDocumentInput {
  title: string
  fileName: string
  size: number
  kind: AttachmentKind
  category: LibraryCategory
  careerName?: string
  subjectName?: string
  professorName?: string
  durationMinutes?: number
  tags: string[]
  publishAt?: string
  expiresAt?: string
}

/** Programación de publicación/vencimiento (Sprint 19, Parte 5): un documento solo es visible dentro de su ventana. */
export function isLibraryDocumentPublished(document: LibraryDocument, now: Date = new Date()): boolean {
  if (document.publishAt && new Date(document.publishAt) > now) return false
  if (document.expiresAt && new Date(document.expiresAt) <= now) return false
  return true
}
