import type { ForumAttachmentKind } from '@/types/forum'

const EXTENSION_KIND: Record<string, ForumAttachmentKind> = {
  png: 'imagen',
  jpg: 'imagen',
  jpeg: 'imagen',
  gif: 'imagen',
  webp: 'imagen',
  pdf: 'pdf',
  doc: 'word',
  docx: 'word',
  xls: 'excel',
  xlsx: 'excel',
  ppt: 'powerpoint',
  pptx: 'powerpoint',
  zip: 'zip',
  rar: 'zip',
  mp4: 'video',
  mov: 'video',
  webm: 'video',
}

/** Deriva el tipo de adjunto del Foro a partir del nombre de archivo (mock: no hay `mimeType` real). */
export function resolveForumAttachmentKind(fileName: string): ForumAttachmentKind {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? ''
  return EXTENSION_KIND[extension] ?? 'pdf'
}
