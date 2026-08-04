import { eventBus } from '../EventBus'
import type { Unsubscribe } from '../EventEmitter'

/**
 * Escucha exclusivamente eventos de insignias (Sprint Event Bus). Hoy solo
 * lleva una bitácora en memoria (`getBadgesAwardedThisSession`); es el punto
 * de extensión natural para reglas futuras (ej. otorgar una insignia
 * compuesta tras acumular varias) sin tocar quien emite `BADGE_GRANTED`
 * (`evaluation.service.ts`).
 */
let badgesAwardedThisSession = 0
let unsubscribeAll: Unsubscribe | null = null

export function registerBadgeListener(): Unsubscribe {
  if (unsubscribeAll) return unsubscribeAll

  const subscriptions: Unsubscribe[] = [
    eventBus.subscribe('BADGE_GRANTED', (payload) => {
      badgesAwardedThisSession += 1
      console.info(
        `[BadgeListener] ${payload.studentName} obtuvo "${payload.badgeName}" (#${badgesAwardedThisSession} esta sesión).`,
      )
    }),
    eventBus.subscribe('BADGE_REVOKED', (payload) => {
      console.info(`[BadgeListener] Se revocó "${payload.badgeName}" a ${payload.studentName}.`)
    }),
  ]

  unsubscribeAll = () => {
    subscriptions.forEach((unsubscribe) => unsubscribe())
    unsubscribeAll = null
  }
  return unsubscribeAll
}

export function getBadgesAwardedThisSession(): number {
  return badgesAwardedThisSession
}
