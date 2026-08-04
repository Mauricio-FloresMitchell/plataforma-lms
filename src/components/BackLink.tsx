import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BackLinkProps {
  to: string
  children?: React.ReactNode
}

/** Enlace "Volver" reutilizable en las páginas del módulo. */
export function BackLink({ to, children = 'Volver' }: BackLinkProps) {
  return (
    <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground">
      <Link to={to}>
        <ArrowLeft className="size-4" />
        {children}
      </Link>
    </Button>
  )
}
