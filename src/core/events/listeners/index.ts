import { registerAnalyticsListener } from './AnalyticsListener'
import { registerAuditListener } from './AuditListener'
import { registerBadgeListener } from './BadgeListener'
import { registerChatListener } from './ChatListener'
import { registerIncidentSyncListener } from './IncidentSyncListener'
import { registerLeaderboardListener } from './LeaderboardListener'
import { registerNotificationListener } from './NotificationListener'
import { registerTitulacionSyncListener } from './TitulacionSyncListener'
import type { Unsubscribe } from '../EventEmitter'

/**
 * Registra todos los listeners de la plataforma (Sprint Event Bus). Se llama
 * una sola vez al arrancar la app (`App.tsx`). Cada listener solo reacciona a
 * los eventos que le corresponden — agregar un listener nuevo (ej. un futuro
 * `EmailListener`) es sumar una línea aquí, sin tocar los módulos que emiten.
 */
export function registerAllListeners(): Unsubscribe {
  const unsubscribers = [
    registerNotificationListener(),
    registerLeaderboardListener(),
    registerBadgeListener(),
    registerAnalyticsListener(),
    registerChatListener(),
    registerTitulacionSyncListener(),
    registerAuditListener(),
    registerIncidentSyncListener(),
  ]

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
}
