import { Link } from 'react-router-dom'
import { BookOpen, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import type { ProfessorSubject } from '@/types/professor'

interface ProfessorSubjectsCardProps {
  subjects: ProfessorSubject[]
}

/** Materias impartidas por el profesor, con grupo y número de alumnos. */
export function ProfessorSubjectsCard({ subjects }: ProfessorSubjectsCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Materias asignadas</CardTitle>
      </CardHeader>

      <CardContent>
        {subjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Sin materias asignadas"
            description="Cuando tengas materias asignadas aparecerán aquí."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {subjects.map((subject) => (
              <li
                key={subject.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-sm font-medium text-foreground">
                    {subject.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{subject.groupName}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="size-3.5" />
                      {subject.studentsCount} alumnos
                    </span>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/profesor/materias/${subject.id}`}>Ver grupo</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
