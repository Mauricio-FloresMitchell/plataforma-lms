import type { AttachmentKind, MessageType } from '@/types/chat'

const EXTENSION_KIND: Record<string, AttachmentKind> = {
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
  mp3: 'audio',
  wav: 'audio',
  m4a: 'audio',
  ogg: 'audio',
}

/** Deriva el tipo de adjunto a partir del nombre de archivo (mock: no hay `mimeType` real de por medio). */
export function resolveAttachmentKind(fileName: string): AttachmentKind {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? ''
  return EXTENSION_KIND[extension] ?? 'otro'
}

const KIND_MESSAGE_TYPE: Record<AttachmentKind, MessageType> = {
  imagen: 'imagen',
  pdf: 'pdf',
  word: 'word',
  excel: 'excel',
  powerpoint: 'powerpoint',
  zip: 'zip',
  audio: 'audio',
  otro: 'enlace',
}

/** El tipo de mensaje refleja el adjunto que lo originó (Parte 3: imágenes, PDF, Word, Excel, PPT, ZIP, audio). */
export function messageTypeForAttachment(kind: AttachmentKind): MessageType {
  return KIND_MESSAGE_TYPE[kind]
}

const KIND_EVENT = {
  imagen: 'IMAGE_SHARED',
  audio: 'AUDIO_SHARED',
} as const

/** `IMAGE_SHARED`/`AUDIO_SHARED` para esos dos tipos; el resto son `DOCUMENT_SHARED` (Parte 9). */
export function eventNameForAttachment(kind: AttachmentKind): 'IMAGE_SHARED' | 'AUDIO_SHARED' | 'DOCUMENT_SHARED' {
  return KIND_EVENT[kind as 'imagen' | 'audio'] ?? 'DOCUMENT_SHARED'
}
