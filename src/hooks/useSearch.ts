import { useMemo, useState } from 'react'

/**
 * Filtrado de una lista en memoria por texto de búsqueda (cliente).
 * `fields` extrae de cada item las cadenas sobre las que se busca.
 */
export function useSearch<T>(items: T[], fields: (item: T) => string[]) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return items

    return items.filter((item) =>
      fields(item).some((field) => field.toLowerCase().includes(normalized)),
    )
  }, [items, query, fields])

  return { query, setQuery, filtered }
}
