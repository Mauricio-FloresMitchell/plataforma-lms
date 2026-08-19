import type { Career, CareerInput } from '@/types/career'

/**
 * Almacén simulado de Carreras (Sprint 13). Estado en memoria durante la
 * sesión. Los 8 nombres coinciden a propósito con el catálogo de carreras ya
 * usado en Gamificación (`mocks/evaluations.ts`, `GAMIFICATION_CAREERS`) —
 * mismo criterio de "datos duplicados por feature" ya documentado ahí.
 */

let CAREERS: Career[] = [
  { id: 'car-001', name: 'Administración', code: 'ADM', isActive: true, studentsCount: 16, subjectsCount: 1, professorsCount: 1, createdAt: '2024-08-01T09:00:00.000Z' },
  { id: 'car-002', name: 'Ingeniería en Sistemas', code: 'SIS', isActive: true, studentsCount: 0, subjectsCount: 0, professorsCount: 0, createdAt: '2024-08-01T09:00:00.000Z' },
  { id: 'car-003', name: 'Negocios Internacionales', code: 'NEG', isActive: true, studentsCount: 0, subjectsCount: 0, professorsCount: 0, createdAt: '2024-08-01T09:00:00.000Z' },
  { id: 'car-004', name: 'Contabilidad', code: 'CON', isActive: true, studentsCount: 0, subjectsCount: 0, professorsCount: 0, createdAt: '2024-08-01T09:00:00.000Z' },
  { id: 'car-005', name: 'Derecho', code: 'DER', isActive: true, studentsCount: 0, subjectsCount: 0, professorsCount: 0, createdAt: '2024-08-01T09:00:00.000Z' },
  { id: 'car-006', name: 'Mercadotecnia', code: 'MKT', isActive: true, studentsCount: 0, subjectsCount: 0, professorsCount: 0, createdAt: '2024-08-01T09:00:00.000Z' },
  { id: 'car-007', name: 'Pedagogía', code: 'PED', isActive: false, studentsCount: 0, subjectsCount: 0, professorsCount: 0, createdAt: '2024-08-01T09:00:00.000Z' },
  { id: 'car-008', name: 'Psicología', code: 'PSI', isActive: true, studentsCount: 0, subjectsCount: 0, professorsCount: 0, createdAt: '2024-08-01T09:00:00.000Z' },
]

let sequence = 100

export function listCareers(): Career[] {
  return CAREERS
}

export function findCareer(careerId: string): Career | null {
  return CAREERS.find((career) => career.id === careerId) ?? null
}

export function insertCareer(input: CareerInput): Career {
  sequence += 1
  const career: Career = {
    id: `car-${sequence}`,
    name: input.name,
    code: input.code,
    isActive: true,
    studentsCount: 0,
    subjectsCount: 0,
    professorsCount: 0,
    createdAt: new Date().toISOString(),
  }
  CAREERS = [...CAREERS, career]
  return career
}

export function updateCareer(careerId: string, input: CareerInput): Career | null {
  const career = CAREERS.find((item) => item.id === careerId)
  if (!career) return null
  career.name = input.name
  career.code = input.code
  return career
}

export function setCareerActive(careerId: string, isActive: boolean): Career | null {
  const career = CAREERS.find((item) => item.id === careerId)
  if (!career) return null
  career.isActive = isActive
  return career
}

export function deleteCareer(careerId: string): boolean {
  const next = CAREERS.filter((item) => item.id !== careerId)
  const removed = next.length !== CAREERS.length
  CAREERS = next
  return removed
}
