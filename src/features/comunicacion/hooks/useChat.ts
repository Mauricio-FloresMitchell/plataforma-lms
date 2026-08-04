import { useContext } from 'react'
import { ChatContext, type ChatContextValue } from '../context/chat-context'

/** Acceso tipado al Centro de Comunicación (conversaciones, filtros, contactos, acciones). */
export function useChat(): ChatContextValue {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat debe usarse dentro de <ChatProvider>.')
  }
  return context
}
