import {
  changeManagedUserCareer,
  changeManagedUserGroup,
  changeManagedUserRole,
  changeManagedUserSubjects,
  createManagedUser,
  findManagedUser,
  listManagedUsers,
  recordManagedUserLogin,
  resetManagedUserPassword,
  setManagedUserStatus,
  updateManagedUser,
} from '@/mocks/userManagement'
import { recordAudit, type AuditActor } from '@/services/audit.service'
import { ensureDefaultAssignment } from '@/services/rbac.service'
import type { Role } from '@/types/auth'
import type { ManagedUser, ManagedUserCreateInput, ManagedUserEditInput, ManagedUserStatus } from '@/types/userManagement'

/**
 * Capa de acceso a datos de Administración de Usuarios (Sprint 13, Parte 5).
 * Nunca elimina físicamente: solo desactiva/bloquea (`setUserStatusAsync`).
 */

const NETWORK_DELAY_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getManagedUsersAsync(role?: Role): Promise<ManagedUser[]> {
  await delay(NETWORK_DELAY_MS)
  return listManagedUsers(role)
}

/** Usado por el Expediente Académico (Sprint 19, Parte 3). */
export async function getManagedUserAsync(userId: string): Promise<ManagedUser | null> {
  await delay(NETWORK_DELAY_MS)
  return findManagedUser(userId)
}

export async function updateManagedUserAsync(actor: AuditActor, userId: string, input: ManagedUserEditInput): Promise<ManagedUser | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findManagedUser(userId)
  const user = updateManagedUser(userId, input, actor.name)
  if (user) recordAudit(actor, 'Usuarios', `Editó los datos de ${user.name}`, before, user)
  return user
}

export async function setUserStatusAsync(actor: AuditActor, userId: string, status: ManagedUserStatus): Promise<ManagedUser | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findManagedUser(userId)
  const user = setManagedUserStatus(userId, status, actor.name)
  if (user) recordAudit(actor, 'Usuarios', `Cambió el estado de ${user.name} a "${status}"`, before, user)
  return user
}

export async function resetUserPasswordAsync(actor: AuditActor, userId: string): Promise<ManagedUser | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findManagedUser(userId)
  const user = resetManagedUserPassword(userId, actor.name)
  if (user) recordAudit(actor, 'Usuarios', `Restableció la contraseña de ${user.name}`, before, user)
  return user
}

export async function changeUserGroupAsync(actor: AuditActor, userId: string, groupName: string): Promise<ManagedUser | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findManagedUser(userId)
  const user = changeManagedUserGroup(userId, groupName, actor.name)
  if (user) recordAudit(actor, 'Usuarios', `Cambió el grupo de ${user.name} a "${groupName}"`, before, user)
  return user
}

export async function changeUserCareerAsync(actor: AuditActor, userId: string, careerName: string): Promise<ManagedUser | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findManagedUser(userId)
  const user = changeManagedUserCareer(userId, careerName, actor.name)
  if (user) recordAudit(actor, 'Usuarios', `Cambió la carrera de ${user.name} a "${careerName}"`, before, user)
  return user
}

export async function changeUserSubjectsAsync(actor: AuditActor, userId: string, subjectNames: string[]): Promise<ManagedUser | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findManagedUser(userId)
  const user = changeManagedUserSubjects(userId, subjectNames, actor.name)
  if (user) recordAudit(actor, 'Usuarios', `Actualizó las materias de ${user.name}`, before, user)
  return user
}

export async function changeUserRoleAsync(actor: AuditActor, userId: string, role: Role): Promise<ManagedUser | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findManagedUser(userId)
  const user = changeManagedUserRole(userId, role, actor.name)
  if (user && role === 'administrador') ensureDefaultAssignment(user.id)
  if (user) recordAudit(actor, 'Usuarios', `Cambió el rol de ${user.name} a "${role}"`, before, user)
  return user
}

/** Alta de usuario (Sprint 19, Parte 2). */
export async function createManagedUserAsync(actor: AuditActor, input: ManagedUserCreateInput): Promise<ManagedUser> {
  await delay(NETWORK_DELAY_MS)
  const user = createManagedUser(input, actor.name)
  if (user.role === 'administrador') ensureDefaultAssignment(user.id)
  recordAudit(actor, 'Usuarios', `Dio de alta a ${user.name} (${user.role})`, undefined, user)
  return user
}

/** Actualiza el último acceso — lo llama `AuditListener` al reaccionar a `USER_LOGIN`, nunca directamente desde la UI. */
export async function recordUserLoginAsync(userId: string): Promise<void> {
  recordManagedUserLogin(userId)
}
