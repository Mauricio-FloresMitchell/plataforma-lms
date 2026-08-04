import { User } from 'lucide-react'
import type { Announcement } from '@/types/subject'

interface AnnouncementListProps {
  announcements: Announcement[]
}

export function AnnouncementList({ announcements }: AnnouncementListProps) {
  if (announcements.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No hay avisos</p>
  }

  return (
    <div className="space-y-3">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{announcement.author}</p>
              <p className="text-sm mt-1">{announcement.content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(announcement.createdAt).toLocaleDateString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
