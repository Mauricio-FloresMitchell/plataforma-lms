import type { ReportFileKind, ReportLinkPlatform } from '@/types/report'

/** Extensiones de archivo permitidas en Reportes (Sprint 12) y su tipo simulado. */
const FILE_EXTENSION_KIND: Record<string, ReportFileKind> = {
  pdf: 'pdf',
  docx: 'docx',
  xlsx: 'xlsx',
  pptx: 'pptx',
  jpg: 'jpg',
  jpeg: 'jpg',
  png: 'png',
  zip: 'zip',
}

export const REPORT_FILE_ACCEPT = '.pdf,.docx,.xlsx,.pptx,.jpg,.jpeg,.png,.zip'

export const REPORT_FILE_KIND_LABELS: Record<ReportFileKind, string> = {
  pdf: 'PDF',
  docx: 'Word',
  xlsx: 'Excel',
  pptx: 'PowerPoint',
  jpg: 'Imagen (JPG)',
  png: 'Imagen (PNG)',
  zip: 'ZIP',
}

/** Detecta el tipo de archivo a partir de la extensión. `null` si no es una extensión permitida. */
export function detectReportFileKind(fileName: string): ReportFileKind | null {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension ? (FILE_EXTENSION_KIND[extension] ?? null) : null
}

export const REPORT_LINK_PLATFORM_LABELS: Record<ReportLinkPlatform, string> = {
  github: 'GitHub',
  google_drive: 'Google Drive',
  canva: 'Canva',
  figma: 'Figma',
  youtube: 'YouTube',
}

const REPORT_LINK_PLATFORM_PATTERNS: Record<ReportLinkPlatform, RegExp> = {
  github: /^https?:\/\/(www\.)?github\.com\//i,
  google_drive: /^https?:\/\/(drive|docs)\.google\.com\//i,
  canva: /^https?:\/\/(www\.)?canva\.com\//i,
  figma: /^https?:\/\/(www\.)?figma\.com\//i,
  youtube: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i,
}

/** Valida que la URL corresponda al dominio esperado de la plataforma seleccionada. */
export function isValidReportLinkUrl(platform: ReportLinkPlatform, url: string): boolean {
  return REPORT_LINK_PLATFORM_PATTERNS[platform].test(url.trim())
}
