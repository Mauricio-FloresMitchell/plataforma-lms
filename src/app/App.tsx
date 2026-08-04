import { useEffect } from 'react'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { NotificationProvider } from '@/features/notifications/context/NotificationProvider'
import { ChatProvider } from '@/features/comunicacion/context/ChatProvider'
import { registerAllListeners } from '@/core/events/listeners'
import { SplashScreen } from '@/components/SplashScreen'
import { AppRouter } from '@/routes/AppRouter'

/** Muestra el splash mientras se restaura la sesión; luego enruta la app. */
function AppBoot() {
  const { isBootstrapping } = useAuth()
  if (isBootstrapping) {
    return <SplashScreen />
  }
  return <AppRouter />
}

export function App() {
  useEffect(() => registerAllListeners(), [])

  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          <AppBoot />
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}
