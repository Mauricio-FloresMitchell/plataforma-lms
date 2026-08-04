/**
 * Motor genérico de publicación/suscripción (Sprint Event Bus).
 *
 * No conoce nada del dominio académico — `EventBus.ts` lo instancia con el
 * mapa de eventos de la plataforma (`AppEventMap`). Se puede reutilizar tal
 * cual para cualquier otro conjunto de eventos tipados en el futuro.
 */

export type Listener<T> = (payload: T) => void

/** Función de baja: al invocarla, quita la suscripción correspondiente. */
export type Unsubscribe = () => void

export class EventEmitter<EventMap extends object> {
  private listeners: { [K in keyof EventMap]?: Set<Listener<EventMap[K]>> } = {}

  /** Suscribe `listener` a `event`. Devuelve una función para darse de baja. */
  subscribe<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): Unsubscribe {
    const set = this.listeners[event] ?? new Set()
    set.add(listener)
    this.listeners[event] = set
    return () => this.unsubscribe(event, listener)
  }

  /** Quita `listener` de `event`. Seguro de llamar aunque ya no esté suscrito. */
  unsubscribe<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): void {
    this.listeners[event]?.delete(listener)
  }

  /** Suscribe `listener` para que se ejecute una única vez y luego se dé de baja solo. */
  once<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): Unsubscribe {
    const unsubscribe = this.subscribe(event, (payload) => {
      unsubscribe()
      listener(payload)
    })
    return unsubscribe
  }

  /**
   * Publica `event` con `payload` a todos los suscriptores actuales.
   * Cada listener corre de forma aislada: si uno lanza una excepción, se
   * reporta en consola pero no interrumpe a los demás ni al emisor original
   * (un módulo que emite un evento nunca debe fallar por culpa de quien escucha).
   */
  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const set = this.listeners[event]
    if (!set) return
    for (const listener of [...set]) {
      try {
        listener(payload)
      } catch (error) {
        console.error(`[EventBus] Listener para "${String(event)}" falló:`, error)
      }
    }
  }

  /** Quita todas las suscripciones. Solo para pruebas/depuración manual. */
  clear(): void {
    this.listeners = {}
  }
}
