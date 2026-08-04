import { PageHeader } from '@/components/PageHeader'
import { CursosCertificacionesPanel } from '@/components/CursosCertificacionesPanel'

/** Cursos y Certificaciones — Administrador (Sprint 17, Parte 12): consulta de solo lectura. */
export function AdminCoursesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: 'Cursos y Certificaciones' }]}
        title="Cursos y Certificaciones"
        subtitle="Catálogo institucional de cursos complementarios y certificados — solo lectura."
      />
      <CursosCertificacionesPanel initialTab="activos" />
    </div>
  )
}
