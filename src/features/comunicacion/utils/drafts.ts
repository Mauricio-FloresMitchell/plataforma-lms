/**
 * Borradores de mensajes (mejora "conversaciones con borradores", Sprint 12).
 *
 * A diferencia del resto del estado de la plataforma (en memoria, se pierde
 * al recargar), los borradores usan `localStorage` a propósito: el pedido
 * explícito es que sobrevivan a un cambio de conversación o a recargar la
 * página, igual que ya hace `auth.service.ts` con la sesión.
 */

const PREFIX = 'ludiclass.chat.draft'

function storageKey(userId: string, conversationId: string): string {
  return `${PREFIX}.${userId}.${conversationId}`
}

export function getDraft(userId: string, conversationId: string): string {
  try {
    return localStorage.getItem(storageKey(userId, conversationId)) ?? ''
  } catch {
    return ''
  }
}

export function setDraft(userId: string, conversationId: string, text: string): void {
  try {
    if (text) {
      localStorage.setItem(storageKey(userId, conversationId), text)
    } else {
      localStorage.removeItem(storageKey(userId, conversationId))
    }
  } catch {
    // Almacenamiento no disponible (modo privado, cuota excedida, etc.) — el borrador simplemente no persiste.
  }
}

export function clearDraft(userId: string, conversationId: string): void {
  setDraft(userId, conversationId, '')
}
