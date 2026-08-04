import { SearchInput } from '@/components/SearchInput'
import { FilterChips } from '@/components/FilterChips'
import type { ForumCategory } from '@/types/forum'

interface ForumFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  categories: ForumCategory[]
  selectedCategoryId: string | null
  onSelectCategory: (categoryId: string | null) => void
}

/** Buscador y filtros por categoría del foro (filtrado del lado del cliente). */
export function ForumFilters({
  search,
  onSearchChange,
  categories,
  selectedCategoryId,
  onSelectCategory,
}: ForumFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <SearchInput value={search} onChange={onSearchChange} placeholder="Buscar publicaciones…" />
      <FilterChips
        options={categories.map((category) => ({ value: category.id, label: category.name }))}
        value={selectedCategoryId}
        onChange={onSelectCategory}
      />
    </div>
  )
}
