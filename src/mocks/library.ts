import type { LibraryDocument, LibraryDocumentInput, LibraryVersionEntry } from '@/types/library'

/**
 * Almacén simulado de la Biblioteca Institucional (Sprint 13, Parte 10).
 * Estado en memoria durante la sesión. No hay carga real de archivos —
 * mismo criterio que `MockAttachment` (`types/subject.ts`) y los adjuntos
 * del Chat (Sprint 12): solo se guardan metadatos.
 */

let DOCUMENTS: LibraryDocument[] = [
  {
    id: 'lib-001',
    title: 'Plan de estudios — Administración',
    fileName: 'plan-administracion.pdf',
    kind: 'pdf',
    category: 'Plan de estudios',
    careerName: 'Administración',
    size: 512_000,
    url: '#',
    uploadedByName: 'Ana Torres Vega',
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
    tags: ['plan de estudios', 'administración'],
    version: 1,
    versions: [],
  },
  {
    id: 'lib-002',
    title: 'Formato de reporte semanal',
    fileName: 'formato-reporte.docx',
    kind: 'word',
    category: 'Formatos',
    size: 84_000,
    url: '#',
    uploadedByName: 'Ana Torres Vega',
    createdAt: '2026-01-12T09:00:00.000Z',
    updatedAt: '2026-01-12T09:00:00.000Z',
    tags: ['formato', 'reportes'],
    version: 2,
    versions: [
      { version: 1, fileName: 'formato-reporte-v1.docx', size: 78_000, uploadedByName: 'Ana Torres Vega', uploadedAt: '2026-01-05T09:00:00.000Z' },
    ],
  },
  {
    id: 'lib-003',
    title: 'Presentación — Clase Modelo 1 y Modelo 2, Unidad 1',
    fileName: 'unidad-1-clase-modelo.pptx',
    kind: 'powerpoint',
    category: 'Presentaciones',
    subjectName: 'Clase Modelo 1 y Modelo 2',
    professorName: 'Lic. Yesus Eleazar González',
    size: 3_400_000,
    url: '#',
    uploadedByName: 'Lic. Yesus Eleazar González',
    createdAt: '2026-02-01T09:00:00.000Z',
    updatedAt: '2026-02-01T09:00:00.000Z',
    tags: ['administración estratégica', 'unidad 1'],
    version: 1,
    versions: [],
  },
  {
    id: 'lib-004',
    title: 'Reglamento académico institucional',
    fileName: 'reglamento-academico.pdf',
    kind: 'pdf',
    category: 'Normatividad',
    size: 980_000,
    url: '#',
    uploadedByName: 'Ana Torres Vega',
    createdAt: '2026-01-05T09:00:00.000Z',
    updatedAt: '2026-01-05T09:00:00.000Z',
    tags: ['reglamento', 'normatividad'],
    version: 1,
    versions: [],
  },
  // Recursos del Alumno (Sprint 16, Parte 6/7) — categorías additivas.
  {
    id: 'lib-005',
    title: 'Reglamento de titulación',
    fileName: 'reglamento-titulacion.pdf',
    kind: 'pdf',
    category: 'Reglamentos',
    size: 610_000,
    url: '#',
    uploadedByName: 'Ana Torres Vega',
    createdAt: '2026-01-08T09:00:00.000Z',
    updatedAt: '2026-01-08T09:00:00.000Z',
    tags: ['titulación', 'reglamento'],
    version: 1,
    versions: [],
  },
  {
    id: 'lib-006',
    title: 'Manual de uso de la plataforma',
    fileName: 'manual-plataforma.pdf',
    kind: 'pdf',
    category: 'Manuales',
    size: 720_000,
    url: '#',
    uploadedByName: 'Ana Torres Vega',
    createdAt: '2026-01-09T09:00:00.000Z',
    updatedAt: '2026-01-09T09:00:00.000Z',
    tags: ['manual', 'plataforma'],
    version: 1,
    versions: [],
  },
  {
    id: 'lib-007',
    title: 'Directorio de servicios institucionales',
    fileName: 'directorio-servicios.pdf',
    kind: 'pdf',
    category: 'Recursos Institucionales',
    size: 340_000,
    url: '#',
    uploadedByName: 'Ana Torres Vega',
    createdAt: '2026-01-11T09:00:00.000Z',
    updatedAt: '2026-01-11T09:00:00.000Z',
    tags: ['directorio', 'servicios'],
    version: 1,
    versions: [],
  },
  {
    id: 'lib-008',
    title: 'Caso de estudio: expansión regional de Grupo Bimbo',
    fileName: 'caso-grupo-bimbo.pdf',
    kind: 'pdf',
    category: 'Casos de estudio',
    subjectName: 'Clase Modelo 1 y Modelo 2',
    professorName: 'Lic. Yesus Eleazar González',
    size: 1_200_000,
    url: '#',
    uploadedByName: 'Lic. Yesus Eleazar González',
    createdAt: '2026-02-05T09:00:00.000Z',
    updatedAt: '2026-02-05T09:00:00.000Z',
    tags: ['caso real', 'estrategia'],
    version: 1,
    versions: [],
  },
  {
    id: 'lib-009',
    title: 'Plantilla de reporte semanal',
    fileName: 'plantilla-reporte-semanal.docx',
    kind: 'word',
    category: 'Plantillas',
    size: 60_000,
    url: '#',
    uploadedByName: 'Ana Torres Vega',
    createdAt: '2026-01-13T09:00:00.000Z',
    updatedAt: '2026-01-13T09:00:00.000Z',
    tags: ['plantilla', 'reportes'],
    version: 1,
    versions: [],
  },
  {
    id: 'lib-010',
    title: 'Clase grabada — Clase Modelo 1 y Modelo 2, sesión 4',
    fileName: 'clase-modelo-s4.mp4',
    kind: 'otro',
    category: 'Clases grabadas',
    subjectName: 'Clase Modelo 1 y Modelo 2',
    professorName: 'Lic. Yesus Eleazar González',
    size: 180_000_000,
    url: '#',
    uploadedByName: 'Lic. Yesus Eleazar González',
    createdAt: '2026-07-10T09:00:00.000Z',
    updatedAt: '2026-07-10T09:00:00.000Z',
    durationMinutes: 52,
    tags: ['clase grabada', 'clase modelo'],
    version: 1,
    versions: [],
  },
  {
    id: 'lib-012',
    title: 'Guía de citas y referencias APA',
    fileName: 'guia-apa.pdf',
    kind: 'pdf',
    category: 'Archivos de apoyo',
    size: 280_000,
    url: '#',
    uploadedByName: 'Ana Torres Vega',
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-01-15T09:00:00.000Z',
    tags: ['apa', 'citas', 'guía'],
    version: 1,
    versions: [],
  },
  {
    id: 'lib-013',
    title: 'Convocatoria — Ciclo de conferencias 2026-2',
    fileName: 'convocatoria-conferencias-2026-2.pdf',
    kind: 'pdf',
    category: 'Biblioteca Digital',
    size: 210_000,
    url: '#',
    uploadedByName: 'Ana Torres Vega',
    createdAt: '2026-07-20T09:00:00.000Z',
    updatedAt: '2026-07-20T09:00:00.000Z',
    tags: ['convocatoria', 'conferencias'],
    version: 1,
    versions: [],
    // Ejemplo de publicación programada (Sprint 19, Parte 5): todavía no visible fuera de Administración.
    publishAt: '2026-09-01T00:00:00.000Z',
  },
]

let sequence = 100

export function listDocuments(): LibraryDocument[] {
  return DOCUMENTS
}

export function findDocument(documentId: string): LibraryDocument | null {
  return DOCUMENTS.find((item) => item.id === documentId) ?? null
}

export function insertDocument(input: LibraryDocumentInput, uploadedByName: string): LibraryDocument {
  sequence += 1
  const now = new Date().toISOString()
  const document: LibraryDocument = {
    id: `lib-${sequence}`,
    ...input,
    url: '#',
    uploadedByName,
    createdAt: now,
    updatedAt: now,
    version: 1,
    versions: [],
  }
  DOCUMENTS = [document, ...DOCUMENTS]
  return document
}

export function updateDocument(documentId: string, input: LibraryDocumentInput): LibraryDocument | null {
  const document = DOCUMENTS.find((item) => item.id === documentId)
  if (!document) return null
  document.title = input.title
  document.category = input.category
  document.careerName = input.careerName
  document.subjectName = input.subjectName
  document.professorName = input.professorName
  document.tags = input.tags
  document.publishAt = input.publishAt
  document.expiresAt = input.expiresAt
  document.updatedAt = new Date().toISOString()
  return document
}

/** Reemplaza el archivo del documento, versionando el anterior (Sprint 19, Parte 5) — nunca se sobrescribe, solo se agrega al historial. */
export function replaceDocumentFile(documentId: string, fileName: string, size: number, uploadedByName: string): LibraryDocument | null {
  const document = DOCUMENTS.find((item) => item.id === documentId)
  if (!document) return null
  const previousVersion: LibraryVersionEntry = {
    version: document.version,
    fileName: document.fileName,
    size: document.size,
    uploadedByName: document.uploadedByName,
    uploadedAt: document.updatedAt,
  }
  document.versions = [previousVersion, ...document.versions]
  document.version += 1
  document.fileName = fileName
  document.size = size
  document.uploadedByName = uploadedByName
  document.updatedAt = new Date().toISOString()
  return document
}

export function deleteDocument(documentId: string): boolean {
  const next = DOCUMENTS.filter((item) => item.id !== documentId)
  const removed = next.length !== DOCUMENTS.length
  DOCUMENTS = next
  return removed
}
