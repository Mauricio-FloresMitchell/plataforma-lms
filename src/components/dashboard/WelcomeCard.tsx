import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface WelcomeCardProps {
  title: string
  subtitle: string
  /** Etiquetas de contexto (carrera, grupo, departamento, periodo…). */
  badges: string[]
}

/** Tarjeta de bienvenida reutilizable por cualquier rol. */
export function WelcomeCard({ title, subtitle, badges }: WelcomeCardProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {badges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <Badge key={badge} variant="secondary">
                {badge}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
