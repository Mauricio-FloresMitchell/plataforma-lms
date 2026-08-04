import { createContext } from 'react'
import type { LoginCredentials, User } from '@/types/auth'

export type AuthStatus = 'bootstrapping' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  status: AuthStatus
  user: User | null
  /** true mientras se restaura la sesión al arrancar la app. */
  isBootstrapping: boolean
  isAuthenticated: boolean
  /** Autentica y persiste la sesión. Lanza AuthError si falla. */
  login: (credentials: LoginCredentials) => Promise<User>
  /** Cierra la sesión y limpia el estado. */
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
