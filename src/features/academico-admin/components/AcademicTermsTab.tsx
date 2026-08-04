import { useEffect, useState } from 'react'
import { CalendarDays, Plus, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/EmptyState'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { createAcademicTermAsync, deleteAcademicTermAsync, getAcademicTermsAsync, getStudyPlansAsync } from '@/services/academicPlan.service'
import type { AcademicTerm, StudyPlan } from '@/types/academicPlan'

/** Cuatrimestres (Sprint 19, Parte 4): materias agrupadas por cuatrimestre dentro de un plan de estudios. */
export function AcademicTermsTab() {
  const { user } = useAuth()
  const [terms, setTerms] = useState<AcademicTerm[]>([])
  const [plans, setPlans] = useState<StudyPlan[]>([])
  const [planId, setPlanId] = useState('')
  const [number, setNumber] = useState('1')
  const [subjects, setSubjects] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const actor = user ? { id: user.id, name: user.name, role: user.role } : null

  function reload() {
    Promise.all([getAcademicTermsAsync(), getStudyPlansAsync()]).then(([termsData, plansData]) => {
      setTerms(termsData)
      setPlans(plansData)
      setPlanId((current) => current || plansData[0]?.id || '')
    })
  }

  useEffect(reload, [])

  async function handleCreate() {
    if (!actor || !planId) return
    setIsSaving(true)
    try {
      await createAcademicTermAsync(actor, {
        planId,
        number: Number(number) || 1,
        subjectNames: subjects.split(',').map((item) => item.trim()).filter(Boolean),
      })
      setSubjects('')
      reload()
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(term: AcademicTerm) {
    if (!actor) return
    if (!window.confirm(`¿Eliminar el cuatrimestre ${term.number} de "${term.planName}"?`)) return
    await deleteAcademicTermAsync(actor, term.id, term.planName, term.number)
    reload()
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4 space-y-3">
        <p className="text-sm font-semibold">Nuevo cuatrimestre</p>
        {plans.length === 0 ? (
          <p className="text-xs text-muted-foreground">Crea primero un plan de estudios en la pestaña "Planes de Estudio".</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>Plan de estudios</Label>
                <Select value={planId} onValueChange={setPlanId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="term-number">Número</Label>
                <Input id="term-number" type="number" min={1} max={12} value={number} onChange={(event) => setNumber(event.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="term-subjects">Materias (separadas por coma)</Label>
                <Input id="term-subjects" value={subjects} onChange={(event) => setSubjects(event.target.value)} placeholder="Materia A, Materia B" />
              </div>
            </div>
            <Button size="sm" onClick={() => void handleCreate()} disabled={isSaving || !planId}>
              <Plus className="size-4" />
              Agregar cuatrimestre
            </Button>
          </>
        )}
      </Card>

      {terms.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Sin cuatrimestres" description="Todavía no se ha registrado ningún cuatrimestre." />
      ) : (
        <div className="flex flex-col gap-2">
          {terms.map((term) => (
            <Card key={term.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{term.planName} — Cuatrimestre {term.number}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {term.subjectNames.length === 0 ? (
                    <span className="text-xs text-muted-foreground">Sin materias asignadas.</span>
                  ) : (
                    term.subjectNames.map((subjectName) => (
                      <Badge key={subjectName} variant="outline" className="text-[10px]">{subjectName}</Badge>
                    ))
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => void handleDelete(term)} aria-label={`Eliminar cuatrimestre ${term.number}`}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
