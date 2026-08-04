import { Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/EmptyState'
import type { StudentProgress } from '@/types/student'

interface ProgressCardProps {
  progress: StudentProgress
}

/** Avance del periodo y nivel alcanzado por competencia. */
export function ProgressCard({ progress }: ProgressCardProps) {
  const hasCompetencies = progress.competencies.length > 0

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Mi progreso</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm text-muted-foreground">Avance del periodo</span>
            <span className="text-sm font-semibold text-foreground">{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} />
          <span className="text-xs text-muted-foreground">
            {progress.completedActivities} de {progress.totalActivities} actividades cubiertas
          </span>
        </div>

        {hasCompetencies ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Competencias</span>
            <ul className="flex flex-col gap-2">
              {progress.competencies.map((competency) => (
                <li key={competency.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm text-muted-foreground">
                    {competency.name}
                  </span>
                  <Badge variant="secondary">{competency.level}</Badge>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <EmptyState
            icon={Target}
            title="Sin competencias evaluadas"
            description="Aquí verás tu nivel cuando tu profesor registre evaluaciones."
          />
        )}
      </CardContent>
    </Card>
  )
}
