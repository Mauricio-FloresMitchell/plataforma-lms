import { MOCK_USERS } from '@/mocks/users'
import { AuthError, type AuthSession, type LoginCredentials, type User } from '@/types/auth'

/**
 * Capa de acceso a datos de autenticación.
 *
 * Es el ÚNICO archivo que conoce el origen de los datos (hoy: mocks + LocalStorage).
 * Para migrar a un backend JWT real basta con reemplazar el cuerpo de estas
 * funciones por llamadas HTTP; la firma pública se mantiene y ni el AuthContext
 * ni los componentes visuales necesitan cambios.
 */

const STORAGE_KEY = 'ludiclass.auth.session'
const NETWORK_DELAY_MS = 700

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Genera un token demo. En producción lo emitirá el backend. */
function createDemoToken(userId: string): string {
  return `demo.${userId}.${Date.now().toString(36)}`
}

/**
 * Autentica credenciales contra la fuente de datos.
 * @throws {AuthError} si las credenciales no son válidas.
 */
export async function login({ email, password }: LoginCredentials): Promise<AuthSession> {
  await delay(NETWORK_DELAY_MS)

  const match = MOCK_USERS.find(
    (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase(),
  )

  if (!match || match.password !== password) {
    throw new AuthError('Correo o contraseña incorrectos.')
  }

  // Nunca exponemos la contraseña fuera de esta capa.
  const { password: _omit, ...user } = match
  const session: AuthSession = {
    token: createDemoToken(user.id),
    user: user as User,
  }

  persistSession(session)
  return session
}

/** Recupera la sesión persistida (equivalente a validar el token guardado). */
export async function getStoredSession(): Promise<AuthSession | null> {
  const raw = readRawSession()
  if (!raw) return null
  return raw
}

/** Persiste la sesión activa. */
export function persistSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

/** Cierra la sesión eliminando el rastro persistido. */
export async function logout(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY)
}

function readRawSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthSession
    if (!parsed?.token || !parsed?.user?.role) return null
    return parsed
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}
