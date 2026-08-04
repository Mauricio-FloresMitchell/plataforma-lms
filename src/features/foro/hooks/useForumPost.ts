import { useCallback, useEffect, useState } from 'react'
import { getForumPost } from '@/services/forum.service'
import type { ForumPost } from '@/types/forum'

interface UseForumPostResult {
  post: ForumPost | null
  isLoading: boolean
  notFound: boolean
  /** Actualiza el post en memoria tras comentar, responder, reaccionar o destacar. */
  setPost: (post: ForumPost) => void
}

/** Detalle de una publicación del foro con comentarios y respuestas. */
export function useForumPost(postId: string | undefined, viewerId: string | undefined): UseForumPostResult {
  const [post, setPostState] = useState<ForumPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!postId) return

    let active = true
    setIsLoading(true)
    setNotFound(false)

    getForumPost(postId, viewerId)
      .then((data) => {
        if (!active) return
        if (data) setPostState(data)
        else setNotFound(true)
      })
      .catch(() => {
        if (active) setNotFound(true)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [postId, viewerId])

  const setPost = useCallback((next: ForumPost) => setPostState(next), [])

  return { post, isLoading, notFound, setPost }
}
