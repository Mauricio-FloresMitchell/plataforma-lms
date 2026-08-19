import {
  Award,
  BookOpen,
  Building2,
  ClipboardList,
  FileText,
  GraduationCap,
  Home,
  Library,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Trophy,
  UserCog,
  Users,
} from 'lucide-react'
import type { Role } from '@/types/auth'
import type { NavSection } from '@/types/nav'

/** Ruta de inicio de cada rol. Usada para redirección post-login y guards. */
export const ROLE_HOME: Record<Role, string> = {
  alumno: '/alumno',
  profesor: '/profesor',
  administrador: '/admin',
}

/**
 * Navegación del sidebar por rol.
 * Cada rol suma sus secciones conforme avanzan los sprints.
 *
 * Sprint 17 (Parte 12) agregó "Cursos y Certificaciones", "Biblioteca" y
 * "Producto de Titulación" a los 3 roles. Sprint 20 (RBAC completo,
 * "cierre funcional del MVP") rediseña por completo el Sidebar del
 * Administrador, agrupado por categorías (`NavSection.label`, capacidad ya
 * soportada por `components/layout/Sidebar.tsx` desde el inicio del
 * proyecto, nunca antes usada con más de una sección) — ninguna ruta
 * existente cambió, solo se reorganizó el menú y se incorporaron los
 * accesos que antes solo vivían como tarjetas del Dashboard
 * (`admin-sections.ts`). Alumno y Profesor no se tocaron. Ver ADR-014 en
 * `docs/DECISIONS.md`.
 */
export const ROLE_NAV: Record<Role, NavSection[]> = {
  alumno: [
    {
      items: [
        { label: 'Inicio', to: ROLE_HOME.alumno, icon: Home },
        { label: 'Materias', to: '/alumno/materias', icon: BookOpen },
        { label: 'Cursos y Certificaciones', to: '/alumno/cursos', icon: GraduationCap },
        { label: 'Biblioteca', to: '/alumno/biblioteca', icon: Library },
        { label: 'Producto de Titulación', to: '/alumno/titulacion', icon: Award },
        { label: 'Evaluaciones', to: '/alumno/evaluaciones', icon: Award },
        { label: 'Reportes', to: '/alumno/reportes', icon: FileText },
        { label: 'Empresas', to: '/alumno/empresas', icon: Building2 },
        { label: 'Leaderboard', to: '/alumno/leaderboard', icon: Trophy },
        { label: 'Foro', to: '/foro', icon: MessagesSquare },
        { label: 'Comunicación', to: '/comunicacion', icon: MessageCircle },
      ],
    },
  ],
  profesor: [
    {
      items: [
        { label: 'Inicio', to: ROLE_HOME.profesor, icon: Home },
        { label: 'Materias', to: '/profesor/materias', icon: BookOpen },
        { label: 'Cursos y Certificaciones', to: '/profesor/cursos', icon: GraduationCap },
        { label: 'Biblioteca', to: '/profesor/biblioteca', icon: Library },
        { label: 'Producto de Titulación', to: '/profesor/titulacion', icon: Award },
        { label: 'Evaluaciones', to: '/profesor/evaluaciones', icon: Award },
        { label: 'Reportes', to: '/profesor/reportes', icon: FileText },
        { label: 'Leaderboard', to: '/profesor/leaderboard', icon: Trophy },
        { label: 'Avisos', to: '/profesor/avisos', icon: Megaphone },
        { label: 'Foro', to: '/foro', icon: MessagesSquare },
        { label: 'Comunicación', to: '/comunicacion', icon: MessageCircle },
      ],
    },
  ],
  administrador: [
    {
      items: [{ label: 'Inicio', to: ROLE_HOME.administrador, icon: Home }],
    },
    {
      label: 'Administración',
      items: [
        { label: 'Usuarios', to: '/admin/usuarios', icon: Users },
        { label: 'Administradores', to: '/admin/administradores', icon: UserCog },
        { label: 'Roles y Permisos', to: '/admin/roles', icon: ShieldCheck },
        { label: 'Auditoría', to: '/admin/auditoria', icon: ClipboardList },
        { label: 'Seguridad', to: '/admin/seguridad', icon: ShieldAlert },
        { label: 'Configuración', to: '/admin/institucion', icon: SlidersHorizontal },
      ],
    },
    {
      label: 'Académico',
      items: [
        { label: 'Gestión Académica', to: '/admin/academico', icon: GraduationCap },
        { label: 'Materias', to: '/admin/materias', icon: BookOpen },
        { label: 'Carreras', to: '/admin/carreras', icon: Building2 },
        { label: 'Producto de Titulación', to: '/admin/titulacion', icon: Award },
        { label: 'Cursos y Certificaciones', to: '/admin/cursos', icon: GraduationCap },
        { label: 'Biblioteca', to: '/admin/biblioteca', icon: Library },
        { label: 'Evaluaciones', to: '/admin/evaluaciones', icon: Award },
      ],
    },
    {
      label: 'Comunidad',
      items: [
        { label: 'Foro y Moderación', to: '/foro', icon: MessagesSquare },
        { label: 'Leaderboard', to: '/admin/leaderboard', icon: Trophy },
        { label: 'Notificaciones', to: '/admin/notificaciones', icon: Megaphone },
        { label: 'Comunicación', to: '/comunicacion', icon: MessageCircle },
      ],
    },
  ],
}

export function getRoleHome(role: Role): string {
  return ROLE_HOME[role]
}
