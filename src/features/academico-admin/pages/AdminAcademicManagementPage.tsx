import { useEffect, useState } from 'react'
import { Award, Building2, ClipboardList, FileText, GraduationCap, Layers, ScrollText, Trophy } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { QuickAccessGrid } from '@/components/QuickAccessGrid'
import type { QuickAccessItem } from '@/components/QuickAccessCard'
import { cn } from '@/lib/utils'
import { getAcademicSummaryAsync } from '@/services/admin.service'
import type { AdminKpis } from '@/types/admin'
import { StudyPlansTab } from '../components/StudyPlansTab'
import { AcademicTermsTab } from '../components/AcademicTermsTab'
import { RubricsReferenceTab } from '../components/RubricsReferenceTab'

type Tab = 'resumen' | 'planes' | 'cuatrimestres' | 'rubricas'

const TABS: { id: Tab; label: string }[] = [
  { id: 'resumen', label: 'Resumen y accesos' },
  { id: 'planes', label: 'Planes de Estudio' },
  { id: 'cuatrimestres', label: 'Cuatrimestres' },
  { id: 'rubricas', label: 'Rúbricas' },
]

/**
 * Gestión Académica (Sprint 19, Parte 4): un solo lugar para administrar
 * Carreras, Materias, Planes de Estudio, Cuatrimestres, Grupos, Rúbricas,
 * Evaluaciones, Reportes, Producto de Titulación y Leaderboard.
 *
 * Carreras/Materias/Grupos/Evaluaciones/Reportes/Titulación/Leaderboard ya
 * son módulos completos con su propia pantalla — aquí se resumen con datos
 * en vivo y un acceso directo, en vez de reimplementar su CRUD por segunda
 * vez. Planes de Estudio y Cuatrimestres son conceptos nuevos de este
 * sprint y sí viven nativamente aquí. Ver ADR-013 en `docs/DECISIONS.md`.
 */
export function AdminAcademicManagementPage() {
  const [tab, setTab] = useState<Tab>('resumen')
  const [kpis, setKpis] = useState<AdminKpis | null>(null)

  useEffect(() => {
    getAcademicSummaryAsync().then(setKpis)
  }, [])

  const quickAccess: QuickAccessItem[] = [
    { label: 'Carreras', description: kpis ? `${kpis.careers} registradas` : undefined, icon: Building2, to: '/admin/carreras' },
    { label: 'Materias', description: kpis ? `${kpis.subjects} en el catálogo` : undefined, icon: FileText, to: '/admin/materias' },
    { label: 'Grupos y Asignaciones', description: kpis ? `${kpis.groups} grupos activos` : undefined, icon: Layers, to: '/admin/grupos' },
    { label: 'Evaluaciones', description: kpis ? `${kpis.evaluationsCompleted} publicadas` : undefined, icon: ScrollText, to: '/admin/evaluaciones' },
    { label: 'Reportes semanales', description: kpis ? `${kpis.reportsPending} pendientes de revisar` : undefined, icon: ClipboardList, to: '/admin/reportes' },
    { label: 'Producto de Titulación', description: 'Seguimiento por alumno', icon: GraduationCap, to: '/admin/titulacion' },
    { label: 'Leaderboard y Badges', description: kpis ? `${kpis.badgesAwarded} insignias otorgadas` : undefined, icon: Trophy, to: '/admin/leaderboard' },
    { label: 'Cursos y Certificaciones', description: 'Catálogo institucional', icon: Award, to: '/admin/cursos' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Gestión Académica' }]}
        title="Gestión Académica"
        subtitle="Carreras, materias, planes de estudio, cuatrimestres, grupos, rúbricas y evaluaciones desde un solo lugar."
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              tab === item.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'resumen' ? <QuickAccessGrid items={quickAccess} /> : null}
      {tab === 'planes' ? <StudyPlansTab /> : null}
      {tab === 'cuatrimestres' ? <AcademicTermsTab /> : null}
      {tab === 'rubricas' ? <RubricsReferenceTab /> : null}
    </div>
  )
}
