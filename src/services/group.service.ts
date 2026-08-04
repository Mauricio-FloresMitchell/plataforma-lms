import {
  changeGroupProfessor,
  deleteGroup,
  findGroup,
  insertGroup,
  listGroups,
  moveStudentsBetweenGroups,
  setGroupActive,
  updateGroup,
} from '@/mocks/groups'
import { getAdminSubjects } from '@/mocks/subjects'
import { recordAudit, type AuditActor } from '@/services/audit.service'
import type { Group, GroupInput } from '@/types/group'

/**
 * Capa de acceso a datos del módulo de Grupos (Sprint 13, Parte 4).
 * Único archivo que conoce el origen de los datos.
 */

const NETWORK_DELAY_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function resolveSubjectName(subjectId: string): string {
  return getAdminSubjects().find((subject) => subject.id === subjectId)?.name ?? ''
}

export async function getGroupsAsync(): Promise<Group[]> {
  await delay(NETWORK_DELAY_MS)
  return listGroups()
}

export async function createGroupAsync(actor: AuditActor, input: GroupInput): Promise<Group> {
  await delay(NETWORK_DELAY_MS)
  const group = insertGroup(input, resolveSubjectName(input.subjectId))
  recordAudit(actor, 'Grupos', `Creó el grupo "${group.name}"`, undefined, group)
  return group
}

export async function updateGroupAsync(actor: AuditActor, groupId: string, input: GroupInput): Promise<Group | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findGroup(groupId)
  const group = updateGroup(groupId, input, resolveSubjectName(input.subjectId))
  if (group) recordAudit(actor, 'Grupos', `Editó el grupo "${group.name}"`, before, group)
  return group
}

export async function setGroupActiveAsync(actor: AuditActor, groupId: string, isActive: boolean): Promise<Group | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findGroup(groupId)
  const group = setGroupActive(groupId, isActive)
  if (group) {
    recordAudit(actor, 'Grupos', isActive ? `Reabrió el grupo "${group.name}"` : `Cerró el grupo "${group.name}"`, before, group)
  }
  return group
}

export async function changeGroupProfessorAsync(actor: AuditActor, groupId: string, professorName: string): Promise<Group | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findGroup(groupId)
  const group = changeGroupProfessor(groupId, professorName)
  if (group) recordAudit(actor, 'Grupos', `Cambió el profesor del grupo "${group.name}" a ${professorName}`, before, group)
  return group
}

export async function moveStudentsAsync(
  actor: AuditActor,
  fromGroupId: string,
  toGroupId: string,
  count: number,
): Promise<{ from: Group; to: Group } | null> {
  await delay(NETWORK_DELAY_MS)
  const before = { from: findGroup(fromGroupId), to: findGroup(toGroupId) }
  const result = moveStudentsBetweenGroups(fromGroupId, toGroupId, count)
  if (result) {
    recordAudit(
      actor,
      'Grupos',
      `Movió ${count} alumno(s) de "${result.from.name}" a "${result.to.name}"`,
      before,
      result,
    )
  }
  return result
}

export async function deleteGroupAsync(actor: AuditActor, groupId: string): Promise<boolean> {
  await delay(NETWORK_DELAY_MS)
  const before = findGroup(groupId)
  const removed = deleteGroup(groupId)
  if (removed && before) recordAudit(actor, 'Grupos', `Eliminó el grupo "${before.name}"`, before, undefined)
  return removed
}
