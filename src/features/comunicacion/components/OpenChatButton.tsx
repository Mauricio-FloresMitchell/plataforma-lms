import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Button, type buttonVariants } from '@/components/ui/button'
import type { VariantProps } from 'class-variance-authority'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useChat } from '../hooks/useChat'
import { setDraft } from '../utils/drafts'
import type { ChatContextType } from '@/types/chat'

interface OpenChatButtonProps {
  recipientId: string
  recipientName: string
  label: string
  icon: LucideIcon
  /** Texto sugerido que queda como borrador en el compositor (Parte 14): el usuario lo revisa antes de enviarlo. */
  draftMessage?: string
  contextType?: ChatContextType
  contextId?: string
  contextLabel?: string
  variant?: VariantProps<typeof buttonVariants>['variant']
  size?: VariantProps<typeof buttonVariants>['size']
  className?: string
}

/**
 * Punto de entrada al Chat desde cualquier parte de la plataforma (Parte 14):
 * "Iniciar conversación", "Enviar mensaje", "Solicitar aclaración",
 * "Comentar reporte", "Contactar autor", "Felicitar" son todos instancias de
 * este mismo componente. Reutiliza `createConversation` (valida permisos por
 * rol) y, si ya existe una conversación individual con este destinatario, la
 * reabre en vez de duplicarla.
 */
export function OpenChatButton({
  recipientId,
  recipientName,
  label,
  icon: Icon,
  draftMessage,
  contextType,
  contextId,
  contextLabel,
  variant = 'outline',
  size = 'sm',
  className,
}: OpenChatButtonProps) {
  const { user } = useAuth()
  const { createConversation } = useChat()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user || user.id === recipientId) return null

  async function handleClick() {
    if (!user) return
    setIsLoading(true)
    setError(null)
    try {
      const conversation = await createConversation({
        type: 'individual',
        title: recipientName,
        participantIds: [recipientId],
        contextType,
        contextId,
        contextLabel,
      })
      if (draftMessage) setDraft(user.id, conversation.id, draftMessage)
      navigate(`/comunicacion/${conversation.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos abrir la conversación.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button variant={variant} size={size} className={className} onClick={() => void handleClick()} disabled={isLoading}>
        <Icon className="size-4" />
        {label}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
