import { useEffect, useMemo, useState } from 'react'

/**
 * Paginación de una lista ya cargada en memoria (mock/cliente).
 * Vuelve a la página 1 automáticamente cuando cambia el tamaño de la lista
 * (por ejemplo, al aplicar un filtro de búsqueda).
 */
export function usePagination<T>(items: T[], pageSize = 6) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  useEffect(() => {
    setPage(1)
  }, [items.length, pageSize])

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  return { page, setPage, totalPages, pageItems }
}
