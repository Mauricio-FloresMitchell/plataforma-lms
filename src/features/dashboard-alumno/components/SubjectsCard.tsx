import { BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/EmptyState'
import type { StudentSubject } from '@/types/student'

interface SubjectsCardProps {
  subjects: StudentSubject[]
}

/** Listado de materias inscritas con profesor y avance. */
export function SubjectsCard({ subjects }: SubjectsCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Mis materias</CardTitle>
      </CardHeader>

      <CardContent>
        {subjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Sin materias inscritas"
            description="Cuando tengas materias asignadas aparecerán aquí."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {subjects.map((subject) => (
              <li key={subject.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {subject.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {subject.teacherName}
                    </span>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-muted-foreground">
                    {subject.progress}%
                  </span>
                </div>
                <Progress value={subject.progress} className="h-1.5" />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
