import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderOpen,
  History,
  Key,
  Lock,
  MoreVertical,
  Pencil,
  Power,
  PowerOff,
  UserPlus,
  Unlock,
  UserCog,
  Users,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { FilterChips, type FilterChipOption } from '@/components/FilterChips'
import { Pagination } from '@/components/Pagination'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useSearch } from '@/hooks/useSearch'
import { usePagination } from '@/hooks/usePagination'
import {
  changeUserCareerAsync,
  changeUserGroupAsync,
  changeUserRoleAsync,
  changeUserSubjectsAsync,
  createManagedUserAsync,
  getManagedUsersAsync,
  resetUserPasswordAsync,
  setUserStatusAsync,
  updateManagedUserAsync,
} from '@/services/userManagement.service'
import type { Role } from '@/types/auth'
import type { ManagedUser, ManagedUserCreateInput, ManagedUserEditInput, ManagedUserStatus } from '@/types/userManagement'
import { UserEditSheet } from '../components/UserEditSheet'
import { UserAssignSheet } from '../components/UserAssignSheet'
import { UserHistorySheet } from '../components/UserHistorySheet'
import { UserCreateSheet } from '../components/UserCreateSheet'

type Tab = 'alumnos' | 'profesores' | 'administradores'

const TABS: { id: Tab; label: string; role: Role }[] = [
  { id: 'alumnos', label: 'Alumnos', role: 'alumno' },
  { id: 'profesores', label: 'Profesores', role: 'profesor' },
  { id: 'administradores', label: 'Administradores', role: 'administrador' },
]

const STATUS_OPTIONS: FilterChipOption[] = [
  { value: 'activo', label: 'Activos' },
  { value: 'inactivo', label: 'Inactivos' },
  { value: 'bloqueado', label: 'Bloqueados' },
]

const STATUS_BADGE: Record<ManagedUserStatus, { label: string; className: string }> = {
  activo: { label: 'Activo', className: 'bg-emerald-100 text-emerald-800' },
  inactivo: { label: 'Inactivo', className: 'bg-slate-200 text-slate-700' },
  bloqueado: { label: 'Bloqueado', className: 'bg-destructive/10 text-destructive' },
}

const searchFields = (user: ManagedUser) => [user.name, user.email, user.groupName ?? '', user.careerName ?? '', user.matricula ?? '']

function formatLastLogin(lastLoginAt?: string): string {
  if (!lastLoginAt) return 'Sin accesos registrados'
  const minutes = Math.round((Date.now() - new Date(lastLoginAt).getTime()) / 60_000)
  if (minutes < 1) return 'Conectado ahora'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`
  const days = Math.round(hours / 24)
  return `Hace ${days} d`
}

interface AdminUsersPageProps {
  defaultTab?: Tab
}

/** Administración de Usuarios (Sprint 13, Parte 5): pestañas Alumnos/Profesores/Administradores. */
export function AdminUsersPage({ defaultTab = 'alumnos' }: AdminUsersPageProps) {
  const { user: currentUser } = useAuth()
  const [tab, setTab] = useState<Tab>(defaultTab)
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)
  const [assigningUser, setAssigningUser] = useState<ManagedUser | null>(null)
  const [historyUser, setHistoryUser] = useState<ManagedUser | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const actor = currentUser ? { id: currentUser.id, name: currentUser.name, role: currentUser.role } : null
  const activeTab = TABS.find((item) => item.id === tab) ?? TABS[0]

  const reload = useCallback(() => {
    setIsLoading(true)
    getManagedUsersAsync(activeTab.role)
      .then(setUsers)
      .finally(() => setIsLoading(false))
  }, [activeTab.role])

  useEffect(reload, [reload])

  const byStatus = status ? users.filter((item) => item.status === status) : users
  const getFields = useCallback(searchFields, [])
  const { query, setQuery, filtered } = useSearch(byStatus, getFields)
  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 8)

  async function handleEditSubmit(input: ManagedUserEditInput) {
    if (!actor || !editingUser) return
    await updateManagedUserAsync(actor, editingUser.id, input)
    reload()
  }

  async function handleSetStatus(user: ManagedUser, newStatus: ManagedUserStatus) {
    if (!actor) return
    await setUserStatusAsync(actor, user.id, newStatus)
    reload()
  }

  async function handleResetPassword(user: ManagedUser) {
    if (!actor) return
    if (!window.confirm(`¿Restablecer la contraseña de ${user.name}? Se le notificará por correo.`)) return
    await resetUserPasswordAsync(actor, user.id)
    reload()
  }

  async function handleCreate(input: ManagedUserCreateInput) {
    if (!actor) return
    await createManagedUserAsync(actor, input)
    reload()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Usuarios' }]}
        title="Usuarios"
        subtitle="Gestión de cuentas de alumnos, profesores y administradores."
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <UserPlus className="size-4" />
            Nuevo usuario
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTab(item.id)
              setStatus(null)
            }}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              tab === item.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <ListSkeleton variant="row" count={5} />
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="Sin usuarios" description="No hay usuarios registrados en esta categoría." />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <SearchInput value={query} onChange={setQuery} placeholder="Buscar por nombre, correo, grupo o carrera…" />
            <FilterChips options={STATUS_OPTIONS} value={status} onChange={setStatus} />
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Users} title="Sin resultados" description="No encontramos usuarios que coincidan con tu búsqueda o filtro." />
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {pageItems.map((user) => {
                  const statusBadge = STATUS_BADGE[user.status]
                  return (
                    <Card key={user.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-foreground">{user.name}</h3>
                            <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                            {user.isRealAccount ? (
                              <Badge variant="outline" className="text-[10px]">
                                Cuenta demo
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {[
                              user.matricula,
                              user.careerName,
                              user.groupName,
                              user.subjectNames.length > 0 ? `${user.subjectNames.length} materias` : null,
                            ]
                              .filter(Boolean)
                              .join(' · ') || 'Sin asignaciones'}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground/80">Último acceso: {formatLastLogin(user.lastLoginAt)}</p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label="Más opciones">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => {
                                setEditingUser(user)
                                setIsEditOpen(true)
                              }}
                            >
                              <Pencil className="size-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => {
                                setAssigningUser(user)
                                setIsAssignOpen(true)
                              }}
                            >
                              <UserCog className="size-4" />
                              Cambiar grupo / carrera / materias / rol
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => {
                                setHistoryUser(user)
                                setIsHistoryOpen(true)
                              }}
                            >
                              <History className="size-4" />
                              Ver historial
                            </DropdownMenuItem>
                            {user.role === 'alumno' ? (
                              <DropdownMenuItem asChild>
                                <Link to={`/admin/alumnos/${user.id}/expediente`}>
                                  <FolderOpen className="size-4" />
                                  Ver expediente académico
                                </Link>
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem onSelect={() => void handleResetPassword(user)}>
                              <Key className="size-4" />
                              Restablecer contraseña
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === 'activo' ? (
                              <DropdownMenuItem onSelect={() => void handleSetStatus(user, 'inactivo')}>
                                <PowerOff className="size-4" />
                                Desactivar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onSelect={() => void handleSetStatus(user, 'activo')}>
                                <Power className="size-4" />
                                Activar
                              </DropdownMenuItem>
                            )}
                            {user.status === 'bloqueado' ? (
                              <DropdownMenuItem onSelect={() => void handleSetStatus(user, 'activo')}>
                                <Unlock className="size-4" />
                                Desbloquear
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem variant="destructive" onSelect={() => void handleSetStatus(user, 'bloqueado')}>
                                <Lock className="size-4" />
                                Bloquear
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  )
                })}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </>
      )}

      <UserEditSheet open={isEditOpen} onOpenChange={setIsEditOpen} user={editingUser} onSubmit={handleEditSubmit} />
      <UserAssignSheet
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
        user={assigningUser}
        onChangeGroup={async (groupName) => {
          if (!actor || !assigningUser) return
          await changeUserGroupAsync(actor, assigningUser.id, groupName)
          reload()
        }}
        onChangeCareer={async (careerName) => {
          if (!actor || !assigningUser) return
          await changeUserCareerAsync(actor, assigningUser.id, careerName)
          reload()
        }}
        onChangeSubjects={async (subjectNames) => {
          if (!actor || !assigningUser) return
          await changeUserSubjectsAsync(actor, assigningUser.id, subjectNames)
          reload()
        }}
        onChangeRole={async (role) => {
          if (!actor || !assigningUser) return
          await changeUserRoleAsync(actor, assigningUser.id, role)
          reload()
        }}
      />
      <UserHistorySheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen} user={historyUser} />
      <UserCreateSheet open={isCreateOpen} onOpenChange={setIsCreateOpen} defaultRole={activeTab.role} onSubmit={handleCreate} />
    </div>
  )
}
