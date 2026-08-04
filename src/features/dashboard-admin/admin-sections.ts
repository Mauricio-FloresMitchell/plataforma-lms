import { Database, IdCard, Ticket } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ModuleKey } from '@/types/rbac'

export type AdminSectionKind = 'management' | 'tool'

export interface AdminSection {
  key: string
  label: string
  description: string
  icon: LucideIcon
  to: string
  kind: AdminSectionKind
  /**
   * Módulo RBAC que gobierna el acceso a esta sección (Sprint 20). Se
   * muestra si el Administrador tiene AL MENOS UN permiso de este módulo
   * (`utils/permissions.ts#hasModuleAccess`) — ningún componente decide
   * visibilidad comparando `role === 'administrador'` directamente.
   */
  moduleKey: ModuleKey
}

/**
 * Fuente única de las secciones del Administrador que NO viven en el
 * Sidebar (`routes/navigation.ts`). La consumen tanto el router (para
 * generar los placeholders) como los accesos rápidos del Dashboard.
 *
 * Sprint 20, Parte "Navegación": el Sidebar del Administrador se rediseñó
 * agrupado por categorías e incorpora directamente Usuarios, Administradores,
 * Roles y Permisos, Académico (con Materias/Carreras/Titulación/Cursos/
 * Biblioteca/Evaluaciones), Comunidad (Foro/Leaderboard/Notificaciones/
 * Comunicación), Auditoría, Seguridad y Configuración — por lo que este
 * catálogo quedó reducido a las 3 herramientas que todavía no tienen un
 * punto de entrada fijo (Incidencias, Respaldos, Generador de Matrículas).
 * Ver ADR-014 en `docs/DECISIONS.md`.
 */
export const ADMIN_SECTIONS: AdminSection[] = [
  {
    key: 'incidencias',
    label: 'Centro de Incidencias',
    description: 'Reportes del Foro y solicitudes académicas, técnicas y administrativas con seguimiento.',
    icon: Ticket,
    to: '/admin/incidencias',
    kind: 'management',
    moduleKey: 'incidencias',
  },
  {
    key: 'backups',
    label: 'Respaldos',
    description: 'Exporta e importa respaldos de la plataforma.',
    icon: Database,
    to: '/admin/backups',
    kind: 'tool',
    moduleKey: 'backups',
  },
  {
    key: 'matriculas',
    label: 'Generador de Matrículas',
    description: 'Genera matrículas para nuevos registros.',
    icon: IdCard,
    to: '/admin/matriculas',
    kind: 'tool',
    moduleKey: 'matriculas',
  },
]

export const ADMIN_MANAGEMENT_SECTIONS = ADMIN_SECTIONS.filter(
  (section) => section.kind === 'management',
)

export const ADMIN_TOOL_SECTIONS = ADMIN_SECTIONS.filter((section) => section.kind === 'tool')
