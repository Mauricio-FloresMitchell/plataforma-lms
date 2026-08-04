import { Link } from 'react-router-dom'
import { Lock, MessagesSquare, Pin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AuthorLine } from './AuthorLine'
import type { ForumPostSummary } from '@/types/forum'

interface ForumPostCardProps {
  post: ForumPostSummary
}

/** Tarjeta de publicación para el feed del foro. */
export function ForumPostCard({ post }: ForumPostCardProps) {
  return (
    <Link
      to={`/foro/${post.id}`}
      className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <Card className="shadow-sm transition-colors group-hover:border-primary/40 group-hover:bg-accent/40">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                {post.isPinned ? (
                  <Badge className="gap-1 bg-amber-100 text-amber-800">
                    <Pin className="size-3" />
                    Fijada
                  </Badge>
                ) : null}
                {post.isClosed ? (
                  <Badge className="gap-1 bg-slate-200 text-slate-700">
                    <Lock className="size-3" />
                    Cerrada
                  </Badge>
                ) : null}
                <Badge variant="outline">{post.categoryName}</Badge>
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
              <h3 className="truncate text-sm font-semibold text-foreground">{post.title}</h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <MessagesSquare className="size-4" />
              {post.commentCount}
            </span>
          </div>

          <AuthorLine author={post.author} date={post.createdAt} size="sm" />
        </CardContent>
      </Card>
    </Link>
  )
}
