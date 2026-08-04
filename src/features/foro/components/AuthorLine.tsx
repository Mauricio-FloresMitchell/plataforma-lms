import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AuthorRoleBadge } from '@/components/AuthorRoleBadge'
import { formatRelativeToNow } from '@/utils/date'
import { cn } from '@/lib/utils'
import type { ForumAuthor } from '@/types/forum'

interface AuthorLineProps {
  author: ForumAuthor
  date: string
  size?: 'sm' | 'md'
}

/** Línea de autoría: avatar, nombre, insignia de rol y antigüedad. */
export function AuthorLine({ author, date, size = 'md' }: AuthorLineProps) {
  const avatarSize = size === 'sm' ? 'size-6' : 'size-8'

  return (
    <div className="flex items-center gap-2">
      <Avatar className={avatarSize}>
        <AvatarFallback className="bg-accent text-xs font-medium text-accent-foreground">
          {author.initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className={cn('font-medium text-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {author.name}
        </span>
        <AuthorRoleBadge role={author.role} />
        <span className="text-xs text-muted-foreground/80">{formatRelativeToNow(date)}</span>
      </div>
    </div>
  )
}
