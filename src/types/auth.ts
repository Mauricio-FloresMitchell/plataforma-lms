export type Role = 'alumno' | 'profesor' | 'administrador'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  /** Iniciales para el avatar (ej. "MG"). */
  avatarInitials: string
}

export interface AuthSession {
  /** Token opaco. Hoy es un token demo; mañana será un JWT real. */
  token: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

/** Error de dominio para fallos de autenticación (credenciales inválidas, etc.). */
export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}
