import { PageHeader } from '@/components/PageHeader'
import { CursosCertificacionesPanel } from '@/components/CursosCertificacionesPanel'

/**
 * Ruta histórica `/alumno/certificaciones` (Sprint 16). Se conserva para no
 * romper enlaces existentes; ahora renderiza el mismo módulo fusionado
 * (Sprint 17, Parte 12) con la pestaña de certificados abierta de entrada.
 */
export function StudentCertificatesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: '/alumno' }, { label: 'Cursos y Certificaciones' }]}
        title="Cursos y Certificaciones"
        subtitle="Tus cursos complementarios y los certificados que has obtenido."
      />
      <CursosCertificacionesPanel canManage initialTab="certificados" />
    </div>
  )
}
