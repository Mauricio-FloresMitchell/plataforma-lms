import { useContext } from 'react'
import { NotificationContext, type NotificationContextValue } from '../context/notification-context'

/** Acceso tipado al Centro de Notificaciones (contador, lista, filtros, acciones). */
export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de <NotificationProvider>.')
  }
  return context
}
