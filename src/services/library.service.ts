import { deleteDocument, findDocument, insertDocument, listDocuments, replaceDocumentFile, updateDocument } from '@/mocks/library'
import { recordAudit, type AuditActor } from '@/services/audit.service'
import type { LibraryDocument, LibraryDocumentInput } from '@/types/library'

/**
 * Capa de acceso a datos de la Biblioteca Institucional (Sprint 13, Parte 10).
 * Único archivo que conoce el origen de los datos.
 */

const NETWORK_DELAY_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getLibraryDocumentsAsync(): Promise<LibraryDocument[]> {
  await delay(NETWORK_DELAY_MS)
  return listDocuments()
}

export async function uploadLibraryDocumentAsync(actor: AuditActor, input: LibraryDocumentInput): Promise<LibraryDocument> {
  await delay(NETWORK_DELAY_MS)
  const document = insertDocument(input, actor.name)
  recordAudit(actor, 'Biblioteca', `Subió "${document.title}"`, undefined, document)
  return document
}

export async function updateLibraryDocumentAsync(
  actor: AuditActor,
  documentId: string,
  input: LibraryDocumentInput,
): Promise<LibraryDocument | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findDocument(documentId)
  const document = updateDocument(documentId, input)
  if (document) recordAudit(actor, 'Biblioteca', `Editó "${document.title}"`, before, document)
  return document
}

export async function deleteLibraryDocumentAsync(actor: AuditActor, documentId: string): Promise<boolean> {
  await delay(NETWORK_DELAY_MS)
  const before = findDocument(documentId)
  const removed = deleteDocument(documentId)
  if (removed && before) recordAudit(actor, 'Biblioteca', `Eliminó "${before.title}"`, before, undefined)
  return removed
}

/** Reemplaza el archivo de un documento, versionando el anterior (Sprint 19, Parte 5: "Versionar"). */
export async function replaceLibraryDocumentFileAsync(
  actor: AuditActor,
  documentId: string,
  fileName: string,
  size: number,
): Promise<LibraryDocument | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findDocument(documentId)
  const document = replaceDocumentFile(documentId, fileName, size, actor.name)
  if (document) recordAudit(actor, 'Biblioteca', `Subió una nueva versión (v${document.version}) de "${document.title}"`, before, document)
  return document
}

/** Registra la descarga de un documento (Sprint 19, Parte 6: "Descargas" en Auditoría). */
export async function recordLibraryDownloadAsync(actor: AuditActor, documentId: string): Promise<void> {
  const document = findDocument(documentId)
  if (document) recordAudit(actor, 'Biblioteca', `Descargó "${document.title}"`)
}
