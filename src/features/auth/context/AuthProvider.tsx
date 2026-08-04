import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LoginCredentials, User } from '@/types/auth'
import * as authService from '@/services/auth.service'
import { emitAppEvent } from '@/core/events/EventBus'
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context'

/** Tiempo mínimo del splash para evitar parpadeos al restaurar sesión. */
const MIN_SPLASH_MS = 900

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('bootstrapping')
  const [user, setUser] = useState<User | null>(null)
  const userRef = useRef<User | null>(null)
  userRef.current = user

  // Restaura la sesión persistida al montar la aplicación.
  useEffect(() => {
    let active = true

    async function bootstrap() {
      const [session] = await Promise.all([authService.getStoredSession(), wait(MIN_SPLASH_MS)])
      if (!active) return
      if (session) {
        setUser(session.user)
        setStatus('authenticated')
      } else {
        setStatus('unauthenticated')
      }
    }

    void bootstrap()
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    const session = await authService.login(credentials)
    setUser(session.user)
    setStatus('authenticated')
    emitAppEvent('USER_LOGIN', {
      userId: session.user.id,
      userName: session.user.name,
      role: session.user.role,
    })
    return session.user
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    const loggedOutUser = userRef.current
    await authService.logout()
    setUser(null)
    setStatus('unauthenticated')
    if (loggedOutUser) {
      emitAppEvent('USER_LOGOUT', {
        userId: loggedOutUser.id,
        userName: loggedOutUser.name,
        role: loggedOutUser.role,
      })
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isBootstrapping: status === 'bootstrapping',
      isAuthenticated: status === 'authenticated',
      login,
      logout,
    }),
    [status, user, login, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
