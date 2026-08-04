import type { Group, GroupInput } from '@/types/group'

/**
 * Almacén simulado de Grupos (Sprint 13). Estado en memoria durante la
 * sesión. Los nombres de grupo coinciden a propósito con los ya usados en
 * `mocks/subjects.ts` (`PROFESSOR_SUBJECTS`, campo `groupName`) — mismo
 * criterio de "datos duplicados por feature" ya documentado en el proyecto.
 */

let GROUPS: Group[] = [
  {
    id: 'grp-001',
    name: 'ADM-501',
    subjectId: 'sub-001',
    subjectName: 'Administración Estratégica',
    professorName: 'Ing. Carlos Mendoza',
    capacity: 30,
    enrolledCount: 28,
    isActive: true,
    createdAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'grp-002',
    name: 'MKT-401',
    subjectId: 'sub-002',
    subjectName: 'Mercadotecnia Digital',
    professorName: 'Lic. Sandra Ruiz',
    capacity: 25,
    enrolledCount: 22,
    isActive: true,
    createdAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'grp-003',
    name: 'RH-301',
    subjectId: 'sub-006',
    subjectName: 'Gestión del Talento',
    professorName: 'Lic. Patricia López',
    capacity: 28,
    enrolledCount: 25,
    isActive: true,
    createdAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'grp-004',
    name: 'SIS-401-A',
    subjectId: 'sub-007',
    subjectName: 'Sistemas de Información',
    professorName: 'Dr. Juan Pérez',
    capacity: 32,
    enrolledCount: 30,
    isActive: true,
    createdAt: '2026-01-15T09:00:00.000Z',
  },
]

let sequence = 100

export function listGroups(): Group[] {
  return GROUPS
}

export function findGroup(groupId: string): Group | null {
  return GROUPS.find((group) => group.id === groupId) ?? null
}

export function insertGroup(input: GroupInput, subjectName: string): Group {
  sequence += 1
  const group: Group = {
    id: `grp-${sequence}`,
    name: input.name,
    subjectId: input.subjectId,
    subjectName,
    professorName: input.professorName,
    capacity: input.capacity,
    enrolledCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  }
  GROUPS = [...GROUPS, group]
  return group
}

export function updateGroup(groupId: string, input: GroupInput, subjectName: string): Group | null {
  const group = GROUPS.find((item) => item.id === groupId)
  if (!group) return null
  group.name = input.name
  group.subjectId = input.subjectId
  group.subjectName = subjectName
  group.professorName = input.professorName
  group.capacity = input.capacity
  return group
}

export function setGroupActive(groupId: string, isActive: boolean): Group | null {
  const group = GROUPS.find((item) => item.id === groupId)
  if (!group) return null
  group.isActive = isActive
  return group
}

export function changeGroupProfessor(groupId: string, professorName: string): Group | null {
  const group = GROUPS.find((item) => item.id === groupId)
  if (!group) return null
  group.professorName = professorName
  return group
}

/** Mueve un número de alumnos de un grupo a otro (Sprint 13, Parte 4). No excede capacidad ni deja negativos. */
export function moveStudentsBetweenGroups(fromGroupId: string, toGroupId: string, count: number): { from: Group; to: Group } | null {
  const from = GROUPS.find((item) => item.id === fromGroupId)
  const to = GROUPS.find((item) => item.id === toGroupId)
  if (!from || !to || from.id === to.id) return null

  const movable = Math.min(count, from.enrolledCount, to.capacity - to.enrolledCount)
  if (movable <= 0) return null

  from.enrolledCount -= movable
  to.enrolledCount += movable
  return { from, to }
}

export function deleteGroup(groupId: string): boolean {
  const next = GROUPS.filter((item) => item.id !== groupId)
  const removed = next.length !== GROUPS.length
  GROUPS = next
  return removed
}
