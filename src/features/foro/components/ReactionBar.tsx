import { cn } from '@/lib/utils'
import type { ForumReactionEmoji, ForumReactionSummary } from '@/types/forum'

interface ReactionBarProps {
  reactions: ForumReactionSummary[]
  onToggle: (emoji: ForumReactionEmoji) => void
  disabled?: boolean
}

/** Barra de reacciones fijas (👍 ❤️ 💡) de un comentario o respuesta. */
export function ReactionBar({ reactions, onToggle, disabled = false }: ReactionBarProps) {
  return (
    <div className="flex items-center gap-1.5">
      {reactions.map((item) => (
        <button
          key={item.emoji}
          type="button"
          disabled={disabled}
          onClick={() => onToggle(item.emoji)}
          className={cn(
            'flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors',
            item.reactedByMe
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:bg-muted',
          )}
        >
          <span>{item.emoji}</span>
          {item.count > 0 ? <span>{item.count}</span> : null}
        </button>
      ))}
    </div>
  )
}
