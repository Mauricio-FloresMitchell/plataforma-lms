import { useCallback, useEffect, useState } from 'react'
import { Layers, Lock, MoreVertical, Pencil, Trash2, Unlock, UserCog, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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
import { Pagination } from '@/components/Pagination'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useSearch } from '@/hooks/useSearch'
import { usePagination } from '@/hooks/usePagination'
import {
  changeGroupProfessorAsync,
  createGroupAsync,
  deleteGroupAsync,
  getGroupsAsync,
  moveStudentsAsync,
  setGroupActiveAsync,
  updateGroupAsync,
} from '@/services/group.service'
import type { Group, GroupInput } from '@/types/group'
import { GroupFormSheet } from '../components/GroupFormSheet'
import { ChangeGroupProfessorSheet } from '../components/ChangeGroupProfessorSheet'
import { MoveStudentsSheet } from '../components/MoveStudentsSheet'

const searchFields = (group: Group) => [group.name, group.subjectName, group.professorName]

/** Gestión de Grupos (Sprint 13, Parte 4). */
export function AdminGroupsListPage() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isProfessorOpen, setIsProfessorOpen] = useState(false)
  const [isMoveOpen, setIsMoveOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [activeGroup, setActiveGroup] = useState<Group | null>(null)

  const actor = user ? { id: user.id, name: user.name, role: user.role } : null

  const reload = useCallback(() => {
    setIsLoading(true)
    getGroupsAsync()
      .then(setGroups)
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(reload, [reload])

  const getFields = useCallback(searchFields, [])
  const { query, setQuery, filtered } = useSearch(groups, getFields)
  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 8)

  function openCreate() {
    setEditingGroup(null)
    setIsFormOpen(true)
  }

  async function handleSubmit(input: GroupInput) {
    if (!actor) return
    if (editingGroup) {
      await updateGroupAsync(actor, editingGroup.id, input)
    } else {
      await createGroupAsync(actor, input)
    }
    reload()
  }

  async function handleToggleActive(group: Group) {
    if (!actor) return
    await setGroupActiveAsync(actor, group.id, !group.isActive)
    reload()
  }

  async function handleChangeProfessor(professorName: string) {
    if (!actor || !activeGroup) return
    await changeGroupProfessorAsync(actor, activeGroup.id, professorName)
    reload()
  }

  async function handleMoveStudents(toGroupId: string, count: number) {
    if (!actor || !activeGroup) return
    await moveStudentsAsync(actor, activeGroup.id, toGroupId, count)
    reload()
  }

  async function handleDelete(group: Group) {
    if (!actor) return
    if (!window.confirm(`¿Eliminar el grupo "${group.name}"? Esta acción no se puede deshacer.`)) return
    await deleteGroupAsync(actor, group.id)
    reload()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Grupos' }]}
        title="Grupos"
        subtitle={isLoading ? undefined : `${groups.length} grupos registrados`}
        actions={<Button onClick={openCreate}>Nuevo grupo</Button>}
      />

      {isLoading ? (
        <ListSkeleton variant="block" count={4} blockHeight="h-32" />
      ) : groups.length === 0 ? (
        <EmptyState icon={Layers} title="Sin grupos registrados" description="Crea el primer grupo para comenzar." />
      ) : (
        <>
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por grupo, materia o profesor…" />

          {filtered.length === 0 ? (
            <EmptyState icon={Layers} title="Sin resultados" description="No encontramos grupos que coincidan con tu búsqueda." />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {pageItems.map((group) => {
                  const occupancy = group.capacity > 0 ? Math.round((group.enrolledCount / group.capacity) * 100) : 0
                  return (
                    <Card key={group.id} className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{group.name}</h3>
                            <Badge variant={group.isActive ? 'secondary' : 'outline'}>{group.isActive ? 'Abierto' : 'Cerrado'}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{group.subjectName}</p>
                          <p className="mt-1 text-xs text-muted-foreground">Profesor: {group.professorName}</p>
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
                                setEditingGroup(group)
                                setIsFormOpen(true)
                              }}
                            >
                              <Pencil className="size-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => {
                                setActiveGroup(group)
                                setIsProfessorOpen(true)
                              }}
                            >
                              <UserCog className="size-4" />
                              Cambiar profesor
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => {
                                setActiveGroup(group)
                                setIsMoveOpen(true)
                              }}
                            >
                              <Users className="size-4" />
                              Mover alumnos
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => void handleToggleActive(group)}>
                              {group.isActive ? <Lock className="size-4" /> : <Unlock className="size-4" />}
                              {group.isActive ? 'Cerrar grupo' : 'Reabrir grupo'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onSelect={() => void handleDelete(group)}>
                              <Trash2 className="size-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-4 border-t border-border pt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Ocupación</span>
                          <span className="font-medium text-foreground">
                            {group.enrolledCount}/{group.capacity} ({occupancy}%)
                          </span>
                        </div>
                        <Progress value={occupancy} className="mt-2 h-2" />
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

      <GroupFormSheet open={isFormOpen} onOpenChange={setIsFormOpen} group={editingGroup} onSubmit={handleSubmit} />
      <ChangeGroupProfessorSheet
        open={isProfessorOpen}
        onOpenChange={setIsProfessorOpen}
        group={activeGroup}
        onSubmit={handleChangeProfessor}
      />
      <MoveStudentsSheet
        open={isMoveOpen}
        onOpenChange={setIsMoveOpen}
        sourceGroup={activeGroup}
        groups={groups}
        onSubmit={handleMoveStudents}
      />
    </div>
  )
}
