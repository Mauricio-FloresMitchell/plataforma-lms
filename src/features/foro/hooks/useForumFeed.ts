import { useEffect, useState } from 'react'
import { getForumCategories, getForumPosts } from '@/services/forum.service'
import type { ForumCategory, ForumPostSummary } from '@/types/forum'

interface UseForumFeedResult {
  posts: ForumPostSummary[]
  categories: ForumCategory[]
  isLoading: boolean
  error: string | null
}

/** Feed de publicaciones y catálogo de categorías del foro. */
export function useForumFeed(): UseForumFeedResult {
  const [posts, setPosts] = useState<ForumPostSummary[]>([])
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)

    Promise.all([getForumPosts(), getForumCategories()])
      .then(([postsData, categoriesData]) => {
        if (!active) return
        setPosts(postsData)
        setCategories(categoriesData)
      })
      .catch(() => {
        if (active) setError('No pudimos cargar el foro. Inténtalo de nuevo.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { posts, categories, isLoading, error }
}
