import { useCallback, useEffect, useState } from 'react'
import { Building2, MoreVertical, Pencil, Power, PowerOff, Trash2 } from 'lucide-react'
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
import {
  createCareerAsync,
  deleteCareerAsync,
  getCareersAsync,
  setCareerActiveAsync,
  updateCareerAsync,
} from '@/services/career.service'
import type { Career, CareerInput } from '@/types/career'
import { CareerFormSheet } from '../components/CareerFormSheet'

const searchFields = (career: Career) => [career.name, career.code]

/** Gestión de Carreras (Sprint 13, Parte 2): crear, editar, activar/desactivar, eliminar. */
export function AdminCareersListPage() {
  const { user } = useAuth()
  const [careers, setCareers] = useState<Career[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCareer, setEditingCareer] = useState<Career | null>(null)

  const actor = user ? { id: user.id, name: user.name, role: user.role } : null

  const reload = useCallback(() => {
    setIsLoading(true)
    getCareersAsync()
      .then(setCareers)
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(reload, [reload])

  const getFields = useCallback(searchFields, [])
  const { query, setQuery, filtered } = useSearch(careers, getFields)
  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 8)

  function openCreate() {
    setEditingCareer(null)
    setIsFormOpen(true)
  }

  function openEdit(career: Career) {
    setEditingCareer(career)
    setIsFormOpen(true)
  }

  async function handleSubmit(input: CareerInput) {
    if (!actor) return
    if (editingCareer) {
      await updateCareerAsync(actor, editingCareer.id, input)
    } else {
      await createCareerAsync(actor, input)
    }
    reload()
  }

  async function handleToggleActive(career: Career) {
    if (!actor) return
    await setCareerActiveAsync(actor, career.id, !career.isActive)
    reload()
  }

  async function handleDelete(career: Career) {
    if (!actor) return
    if (!window.confirm(`¿Eliminar la carrera "${career.name}"? Esta acción no se puede deshacer.`)) return
    await deleteCareerAsync(actor, career.id)
    reload()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Carreras' }]}
        title="Carreras"
        subtitle={isLoading ? undefined : `${careers.length} carreras registradas`}
        actions={<Button onClick={openCreate}>Nueva carrera</Button>}
      />

      {isLoading ? (
        <ListSkeleton variant="block" count={4} blockHeight="h-28" />
      ) : careers.length === 0 ? (
        <EmptyState icon={Building2} title="Sin carreras registradas" description="Crea la primera carrera para comenzar." />
      ) : (
        <>
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por nombre o clave…" />

          {filtered.length === 0 ? (
            <EmptyState icon={Building2} title="Sin resultados" description="No encontramos carreras que coincidan con tu búsqueda." />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {pageItems.map((career) => (
                  <Card key={career.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Building2 className="mt-0.5 size-4 text-primary" />
                        <div>
                          <h3 className="font-semibold text-foreground">{career.name}</h3>
                          <p className="text-sm text-muted-foreground">{career.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={career.isActive ? 'secondary' : 'outline'}>
                          {career.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label="Más opciones">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => openEdit(career)}>
                              <Pencil className="size-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => void handleToggleActive(career)}>
                              {career.isActive ? <PowerOff className="size-4" /> : <Power className="size-4" />}
                              {career.isActive ? 'Desactivar' : 'Activar'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onSelect={() => void handleDelete(career)}>
                              <Trash2 className="size-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center text-sm">
                      <div>
                        <p className="font-semibold text-foreground">{career.studentsCount}</p>
                        <p className="text-xs text-muted-foreground">Alumnos</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{career.subjectsCount}</p>
                        <p className="text-xs text-muted-foreground">Materias</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{career.professorsCount}</p>
                        <p className="text-xs text-muted-foreground">Profesores</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </>
      )}

      <CareerFormSheet open={isFormOpen} onOpenChange={setIsFormOpen} career={editingCareer} onSubmit={handleSubmit} />
    </div>
  )
}
