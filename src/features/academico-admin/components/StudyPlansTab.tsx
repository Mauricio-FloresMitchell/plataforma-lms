import { useEffect, useState } from 'react'
import { Layers, Plus, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/EmptyState'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getCareersAsync } from '@/services/career.service'
import { createStudyPlanAsync, deleteStudyPlanAsync, getStudyPlansAsync } from '@/services/academicPlan.service'
import type { Career } from '@/types/career'
import type { StudyPlan } from '@/types/academicPlan'

/** Planes de Estudio (Sprint 19, Parte 4): concepto nuevo, un plan agrupa cuántos cuatrimestres tiene una carrera. */
export function StudyPlansTab() {
  const { user } = useAuth()
  const [plans, setPlans] = useState<StudyPlan[]>([])
  const [careers, setCareers] = useState<Career[]>([])
  const [name, setName] = useState('')
  const [careerId, setCareerId] = useState('')
  const [totalTerms, setTotalTerms] = useState('9')
  const [isSaving, setIsSaving] = useState(false)

  const actor = user ? { id: user.id, name: user.name, role: user.role } : null

  function reload() {
    Promise.all([getStudyPlansAsync(), getCareersAsync()]).then(([plansData, careersData]) => {
      setPlans(plansData)
      setCareers(careersData)
      setCareerId((current) => current || careersData[0]?.id || '')
    })
  }

  useEffect(reload, [])

  async function handleCreate() {
    if (!actor || !name.trim() || !careerId) return
    const career = careers.find((item) => item.id === careerId)
    if (!career) return
    setIsSaving(true)
    try {
      await createStudyPlanAsync(actor, { careerId, careerName: career.name, name: name.trim(), totalTerms: Number(totalTerms) || 9 })
      setName('')
      reload()
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(plan: StudyPlan) {
    if (!actor) return
    if (!window.confirm(`¿Eliminar el plan "${plan.name}"?`)) return
    await deleteStudyPlanAsync(actor, plan.id, plan.name)
    reload()
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4 space-y-3">
        <p className="text-sm font-semibold">Nuevo plan de estudios</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="plan-name">Nombre</Label>
            <Input id="plan-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Plan Administración 2026" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Carrera</Label>
            <Select value={careerId} onValueChange={setCareerId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {careers.map((career) => (
                  <SelectItem key={career.id} value={career.id}>{career.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan-terms">Cuatrimestres</Label>
            <Input id="plan-terms" type="number" min={1} max={12} value={totalTerms} onChange={(event) => setTotalTerms(event.target.value)} />
          </div>
        </div>
        <Button size="sm" onClick={() => void handleCreate()} disabled={isSaving || !name.trim() || !careerId}>
          <Plus className="size-4" />
          Crear plan
        </Button>
      </Card>

      {plans.length === 0 ? (
        <EmptyState icon={Layers} title="Sin planes de estudio" description="Todavía no se ha registrado ningún plan." />
      ) : (
        <div className="flex flex-col gap-2">
          {plans.map((plan) => (
            <Card key={plan.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{plan.name}</p>
                <p className="text-xs text-muted-foreground">{plan.careerName} · {plan.totalTerms} cuatrimestres</p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => void handleDelete(plan)} aria-label={`Eliminar ${plan.name}`}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
