import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, MoreVertical, Pencil, Power, PowerOff, Trash2, UserCog } from 'lucide-react'
import {
  assignSubjectProfessorAsync,
  createAdminSubjectAsync,
  deleteAdminSubjectAsync,
  getAdminSubjectsAsync,
  setSubjectActiveAsync,
  updateAdminSubjectAsync,
} from '@/services/subject.service'
import type { AdminSubjectInput, AdminSubjectListItem } from '@/types/subject'
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
import { Pagination } from '@/components/Pagination'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useSearch } from '@/hooks/useSearch'
import { usePagination } from '@/hooks/usePagination'
import { SubjectFormSheet } from '../components/SubjectFormSheet'
import { AssignProfessorSheet } from '../components/AssignProfessorSheet'

const searchFields = (subject: AdminSubjectListItem) => [subject.name, subject.code, subject.careerName ?? '']

export function AdminSubjectsListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<AdminSubjectListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<AdminSubjectListItem | null>(null)
  const [assigningSubject, setAssigningSubject] = useState<AdminSubjectListItem | null>(null)

  const actor = user ? { id: user.id, name: user.name, role: user.role } : null

  const reload = useCallback(() => {
    setIsLoading(true)
    getAdminSubjectsAsync()
      .then(setSubjects)
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(reload, [reload])

  const getFields = useCallback(searchFields, [])
  const { query, setQuery, filtered } = useSearch(subjects, getFields)
  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 8)

  function openCreate() {
    setEditingSubject(null)
    setIsFormOpen(true)
  }

  function openEdit(subject: AdminSubjectListItem) {
    setEditingSubject(subject)
    setIsFormOpen(true)
  }

  function openAssign(subject: AdminSubjectListItem) {
    setAssigningSubject(subject)
    setIsAssignOpen(true)
  }

  async function handleSubmit(input: AdminSubjectInput) {
    if (!actor) return
    if (editingSubject) {
      await updateAdminSubjectAsync(actor, editingSubject.id, input)
    } else {
      await createAdminSubjectAsync(actor, input)
    }
    reload()
  }

  async function handleAssignProfessor(professorName: string) {
    if (!actor || !assigningSubject) return
    await assignSubjectProfessorAsync(actor, assigningSubject.id, `prof-${Date.now()}`, professorName)
    reload()
  }

  async function handleToggleActive(subject: AdminSubjectListItem) {
    if (!actor) return
    await setSubjectActiveAsync(actor, subject.id, !(subject.isActive ?? true))
    reload()
  }

  async function handleDelete(subject: AdminSubjectListItem) {
    if (!actor) return
    if (!window.confirm(`¿Eliminar la materia "${subject.name}"? Esta acción no se puede deshacer.`)) return
    await deleteAdminSubjectAsync(actor, subject.id)
    reload()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Materias' }]}
        title="Materias"
        subtitle={isLoading ? undefined : `${subjects.length} materias en el plan de estudios`}
        actions={<Button onClick={openCreate}>Nueva materia</Button>}
      />

      {isLoading ? (
        <ListSkeleton variant="block" count={7} blockHeight="h-20" />
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Sin materias registradas"
          description="Cuando se registren materias en el plan de estudios aparecerán aquí."
        />
      ) : (
        <>
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por materia, código o carrera…" />

          {filtered.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Sin resultados"
              description="No encontramos materias que coincidan con tu búsqueda."
            />
          ) : (
            <>
              <div className="grid gap-4">
                {pageItems.map((subject) => (
                  <Card
                    key={subject.id}
                    className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/admin/materias/${subject.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <h3 className="text-lg font-semibold">{subject.name}</h3>
                          <Badge variant={subject.isActive === false ? 'outline' : 'secondary'}>
                            {subject.isActive === false ? 'Inactiva' : 'Activa'}
                          </Badge>
                        </div>
                        <p className="mb-3 text-sm text-muted-foreground">
                          {subject.code}
                          {subject.careerName ? ` · ${subject.careerName}` : ''}
                          {subject.term ? ` · Cuatrimestre ${subject.term}` : ''}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span>
                            <span className="text-muted-foreground">Créditos:</span> <span className="font-medium">{subject.credits}</span>
                          </span>
                          <span>
                            <span className="text-muted-foreground">Profesor:</span>{' '}
                            <span className="font-medium">{subject.professorName ?? 'Sin asignar'}</span>
                          </span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="Más opciones" onClick={(event) => event.stopPropagation()}>
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => openEdit(subject)}>
                            <Pencil className="size-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openAssign(subject)}>
                            <UserCog className="size-4" />
                            {subject.professorName ? 'Cambiar profesor' : 'Asignar profesor'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => void handleToggleActive(subject)}>
                            {subject.isActive === false ? <Power className="size-4" /> : <PowerOff className="size-4" />}
                            {subject.isActive === false ? 'Activar' : 'Desactivar'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => void handleDelete(subject)}>
                            <Trash2 className="size-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </>
      )}

      <SubjectFormSheet open={isFormOpen} onOpenChange={setIsFormOpen} subject={editingSubject} onSubmit={handleSubmit} />
      <AssignProfessorSheet open={isAssignOpen} onOpenChange={setIsAssignOpen} subject={assigningSubject} onSubmit={handleAssignProfessor} />
    </div>
  )
}
