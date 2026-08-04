import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { SubjectStudent } from '@/types/subject'

interface StudentListProps {
  students: SubjectStudent[]
}

const competencyColors: Record<string, string> = {
  'A+': 'bg-green-100 text-green-800',
  A: 'bg-green-100 text-green-800',
  'B+': 'bg-blue-100 text-blue-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-yellow-100 text-yellow-800',
  D: 'bg-red-100 text-red-800',
}

export function StudentList({ students }: StudentListProps) {
  if (students.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No hay estudiantes</p>
  }

  return (
    <div className="space-y-3">
      {students.map((student) => (
        <div key={student.id} className="p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">{student.name}</h4>
            <Badge className={competencyColors[student.competencyLevel]}>
              {student.competencyLevel}
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progreso</span>
              <span>{student.progress}%</span>
            </div>
            <Progress value={student.progress} className="h-2" />
          </div>
        </div>
      ))}
    </div>
  )
}
