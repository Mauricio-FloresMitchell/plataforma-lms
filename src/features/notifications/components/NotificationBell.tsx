import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotifications } from '../hooks/useNotifications'
import { NotificationDrawer } from './NotificationDrawer'

/** Campana del Header (Parte 1): contador de no leídas, abre la bandeja lateral. */
export function NotificationBell() {
  const { unreadCount } = useNotifications()
  const [open, setOpen] = useState(false)
  const [isRinging, setIsRinging] = useState(false)
  const previousCount = useRef(unreadCount)

  useEffect(() => {
    if (unreadCount > previousCount.current) {
      setIsRinging(true)
      const timeout = setTimeout(() => setIsRinging(false), 700)
      previousCount.current = unreadCount
      return () => clearTimeout(timeout)
    }
    previousCount.current = unreadCount
  }, [unreadCount])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label={unreadCount > 0 ? `Notificaciones, ${unreadCount} sin leer` : 'Notificaciones'}
      >
        <Bell className={cn('size-5', isRinging && 'animate-bounce')} />
        {unreadCount > 0 ? (
          <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      <NotificationDrawer open={open} onOpenChange={setOpen} />
    </>
  )
}
