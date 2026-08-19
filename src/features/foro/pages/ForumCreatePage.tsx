import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROLE_HOME } from '@/routes/navigation'
import { buildForumAuthor, createForumPost, getForumCategories } from '@/services/forum.service'
import type { ForumAttachment, ForumCategory } from '@/types/forum'
import { PostForm } from '../components/PostForm'
import type { PostFormValues } from '../schemas/post-schema'

/** Página de creación de publicación del foro. */
export function ForumCreatePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getForumCategories()
      .then((data) => {
        if (active) setCategories(data)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(values: PostFormValues, attachments: ForumAttachment[]) {
    if (!user) return
    setError(null)
    const author = buildForumAuthor(user)
    try {
      const created = await createForumPost(author, { ...values, attachments })
      navigate(`/foro/${created.id}`)
    } catch {
      setError('No pudimos publicar. Inténtalo de nuevo.')
    }
  }

  const roleHome = user ? ROLE_HOME[user.role] : '/'

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader
        breadcrumb={[
          { label: 'Inicio', to: roleHome },
          { label: 'Foro académico', to: '/foro' },
          { label: 'Nueva publicación' },
        ]}
        backTo="/foro"
        title="Nueva publicación"
        subtitle="Comparte una duda, un recurso o una propuesta con la comunidad."
      />

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="shadow-sm">
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <PostForm categories={categories} onSubmit={handleSubmit} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
