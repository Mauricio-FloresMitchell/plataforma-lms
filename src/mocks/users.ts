import type { Role, User } from '@/types/auth'

/**
 * Usuario mock: extiende User con la contraseña simulada.
 * La contraseña NUNCA sale de esta capa mock ni del auth.service.
 */
export interface MockUser extends User {
  password: string
}

/**
 * Credenciales demo (una por rol). Contraseña única para facilitar la demo.
 * Sustituir esta fuente por la API real no afecta a los componentes.
 */
export const MOCK_PASSWORD = 'demo1234'

export const MOCK_USERS: MockUser[] = [
  {
    id: 'usr-alumno-001',
    name: 'Andrea Guadalupe Mendez Guzman',
    email: 'alumno@ludiclass.com',
    role: 'alumno',
    avatarInitials: 'AM',
    password: MOCK_PASSWORD,
  },
  {
    id: 'usr-profesor-001',
    name: 'Lic. Yesus Eleazar González',
    email: 'profesor@ludiclass.com',
    role: 'profesor',
    avatarInitials: 'YG',
    password: MOCK_PASSWORD,
  },
  {
    id: 'usr-admin-001',
    name: 'Ana Torres Vega',
    email: 'admin@ludiclass.com',
    role: 'administrador',
    avatarInitials: 'AT',
    password: MOCK_PASSWORD,
  },
]

/** Etiquetas legibles por rol para la UI. */
export const ROLE_LABELS: Record<Role, string> = {
  alumno: 'Alumno',
  profesor: 'Profesor',
  administrador: 'Administrador',
}
