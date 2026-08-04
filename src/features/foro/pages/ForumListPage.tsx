import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, MessagesSquare, Plus, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { Pagination } from '@/components/Pagination'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROLE_HOME } from '@/routes/navigation'
import { usePagination } from '@/hooks/usePagination'
import { ModerationPanel } from '@/features/moderacion-admin/components/ModerationPanel'
import { useForumFeed } from '../hooks/useForumFeed'
import { useForumNotifications } from '../hooks/useForumNotifications'
import { ForumFilters } from '../components/ForumFilters'
import { ForumPostCard } from '../components/ForumPostCard'

type ForumTab = 'publicaciones' | 'moderacion'

/** Feed del foro con buscador y filtro por categoría (lado del cliente). */
export function ForumListPage() {
  const { user } = useAuth()
  const { posts, categories, isLoading, error } = useForumFeed()
  const { unreadCount } = useForumNotifications(user?.id)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [tab, setTab] = useState<ForumTab>('publicaciones')
  const isAdmin = user?.role === 'administrador'

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return posts.filter((post) => {
      const matchesCategory = categoryId === null || post.categoryId === categoryId
      const matchesSearch =
        term === '' ||
        post.title.toLowerCase().includes(term) ||
        post.excerpt.toLowerCase().includes(term) ||
        post.tags.some((tag) => tag.includes(term))
      return matchesCategory && matchesSearch
    })
  }, [posts, search, categoryId])

  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 6)
  const roleHome = user ? ROLE_HOME[user.role] : '/'

  const handleSearchChange = useCallback((value: string) => setSearch(value), [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: roleHome }, { label: 'Foro académico' }]}
        title="Foro académico"
        subtitle="Participa, resuelve dudas y comparte recursos con la comunidad."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" className="h-10">
              <Link to="/foro/notificaciones">
                <Bell className="size-4" />
                Notificaciones
                {unreadCount > 0 ? (
                  <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {unreadCount}
                  </span>
                ) : null}
              </Link>
            </Button>
            <Button asChild className="h-10">
              <Link to="/foro/nuevo">
                <Plus className="size-4" />
                Nueva publicación
              </Link>
            </Button>
          </div>
        }
      />

      {isAdmin ? (
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'publicaciones' as const, label: 'Publicaciones' },
              { id: 'moderacion' as const, label: 'Moderación' },
            ]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                tab === item.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {item.id === 'moderacion' ? <ShieldAlert className="size-3.5" /> : null}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {isAdmin && tab === 'moderacion' ? (
        <ModerationPanel />
      ) : isLoading ? (
        <ListSkeleton variant="row" count={4} />
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <>
          <ForumFilters
            search={search}
            onSearchChange={handleSearchChange}
            categories={categories}
            selectedCategoryId={categoryId}
            onSelectCategory={setCategoryId}
          />

          {filtered.length === 0 ? (
            <EmptyState
              icon={MessagesSquare}
              title="Sin publicaciones"
              description="No encontramos publicaciones con estos filtros."
            />
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {pageItems.map((post) => (
                  <ForumPostCard key={post.id} post={post} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </>
      )}
    </div>
  )
}
