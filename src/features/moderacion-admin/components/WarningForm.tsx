import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface WarningFormProps {
  onSubmit: (message: string) => Promise<void> | void
  onCancel: () => void
}

/** Formulario inline para redactar el mensaje de una advertencia antes de enviarla. */
export function WarningForm({ onSubmit, onCancel }: WarningFormProps) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (message.trim().length < 5) {
      setError('Escribe el mensaje de la advertencia (mínimo 5 caracteres).')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit(message.trim())
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3">
      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Mensaje de la advertencia para el usuario…"
        rows={2}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="h-8 bg-amber-600 hover:bg-amber-700" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <AlertTriangle className="size-3.5" />}
          Enviar advertencia
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-8" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
