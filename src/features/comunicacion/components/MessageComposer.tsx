import { useRef } from 'react'
import { Paperclip, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { MessageWithDetails } from '@/types/chat'
import { resolveAttachmentKind } from '../utils/attachmentKind'

interface MessageComposerProps {
  draft: string
  onDraftChange: (text: string) => void
  onSend: (content: string, replyToId?: string) => Promise<void>
  onShareAttachment: (input: { fileName: string; size: number; kind: ReturnType<typeof resolveAttachmentKind> }) => Promise<void>
  replyTo: MessageWithDetails | null
  onCancelReply: () => void
  disabled?: boolean
}

/** Compositor de mensajes (Parte 3): texto, adjuntos simulados, responder, Enter para enviar. */
export function MessageComposer({ draft, onDraftChange, onSend, onShareAttachment, replyTo, onCancelReply, disabled }: MessageComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSend() {
    if (!draft.trim() || disabled) return
    await onSend(draft, replyTo?.id)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    await onShareAttachment({ fileName: file.name, size: file.size, kind: resolveAttachmentKind(file.name) })
  }

  return (
    <div className="border-t border-border p-4">
      {replyTo ? (
        <div className="mb-2 flex items-center justify-between rounded-lg border border-border bg-muted px-3 py-2 text-xs">
          <div className="min-w-0">
            <p className="font-medium text-foreground">Respondiendo a {replyTo.senderName}</p>
            <p className="truncate text-muted-foreground">{replyTo.deleted ? 'Mensaje eliminado' : replyTo.content}</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onCancelReply} aria-label="Cancelar respuesta">
            <X className="size-3.5" />
          </Button>
        </div>
      ) : null}

      {disabled ? (
        <p className="rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">Esta conversación está cerrada.</p>
      ) : (
        <div className="flex items-end gap-2">
          <input ref={fileInputRef} type="file" className="hidden" onChange={(event) => void handleFileChange(event)} />
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Adjuntar archivo"
          >
            <Paperclip className="size-4" />
          </Button>
          <Textarea
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje… (Enter para enviar, Shift+Enter para salto de línea)"
            rows={1}
            className="max-h-32 min-h-10 flex-1 resize-none"
          />
          <Button size="icon" className="shrink-0" onClick={() => void handleSend()} disabled={!draft.trim()} aria-label="Enviar">
            <Send className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
