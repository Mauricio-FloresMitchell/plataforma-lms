import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  /** Página actual, 1-indexada. */
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

const MAX_VISIBLE_PAGES = 5

function getVisiblePages(page: number, totalPages: number): number[] {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const half = Math.floor(MAX_VISIBLE_PAGES / 2)
  let start = Math.max(1, page - half)
  const end = Math.min(totalPages, start + MAX_VISIBLE_PAGES - 1)
  start = Math.max(1, end - MAX_VISIBLE_PAGES + 1)

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/** Paginación reutilizable sobre datos ya cargados en memoria (mock/cliente). */
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const visiblePages = getVisiblePages(page, totalPages)

  return (
    <nav
      aria-label="Paginación"
      className="flex items-center justify-between gap-4 pt-2 sm:justify-center"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="size-4" />
        <span className="hidden sm:inline">Anterior</span>
      </Button>

      <div className="flex items-center gap-1">
        {visiblePages[0] > 1 ? (
          <>
            <PageButton value={1} active={page === 1} onClick={onPageChange} />
            {visiblePages[0] > 2 ? <span className="px-1 text-muted-foreground">…</span> : null}
          </>
        ) : null}

        {visiblePages.map((p) => (
          <PageButton key={p} value={p} active={p === page} onClick={onPageChange} />
        ))}

        {visiblePages[visiblePages.length - 1] < totalPages ? (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 ? (
              <span className="px-1 text-muted-foreground">…</span>
            ) : null}
            <PageButton value={totalPages} active={page === totalPages} onClick={onPageChange} />
          </>
        ) : null}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  )
}

interface PageButtonProps {
  value: number
  active: boolean
  onClick: (page: number) => void
}

function PageButton({ value, active, onClick }: PageButtonProps) {
  return (
    <Button
      type="button"
      variant={active ? 'default' : 'ghost'}
      size="sm"
      className="size-9 p-0"
      aria-current={active ? 'page' : undefined}
      onClick={() => onClick(value)}
    >
      {value}
    </Button>
  )
}
