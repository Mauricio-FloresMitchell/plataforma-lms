import { PageHeader } from '@/components/PageHeader'
import { CursosCertificacionesPanel } from '@/components/CursosCertificacionesPanel'

/** Cursos y Certificaciones — Alumno (Sprint 17, Parte 12: módulo fusionado). */
export function StudentCoursesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/alumno' }, { label: 'Cursos y Certificaciones' }]}
        title="Cursos y Certificaciones"
        subtitle="Tus cursos complementarios y los certificados que has obtenido."
      />
      <CursosCertificacionesPanel canManage initialTab="activos" />
    </div>
  )
}
