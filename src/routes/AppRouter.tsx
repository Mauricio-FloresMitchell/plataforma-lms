import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { StudentDashboardPage } from '@/features/dashboard-alumno/pages/StudentDashboardPage'
import { ProfessorDashboardPage } from '@/features/dashboard-profesor/pages/ProfessorDashboardPage'
import { AdminDashboardPage } from '@/features/dashboard-admin/pages/AdminDashboardPage'
import { StudentReportsListPage } from '@/features/reportes-alumno/pages/StudentReportsListPage'
import { StudentReportCreatePage } from '@/features/reportes-alumno/pages/StudentReportCreatePage'
import { StudentReportDetailPage } from '@/features/reportes-alumno/pages/StudentReportDetailPage'
import { ProfessorReportsListPage } from '@/features/reportes-profesor/pages/ProfessorReportsListPage'
import { ProfessorReportReviewPage } from '@/features/reportes-profesor/pages/ProfessorReportReviewPage'
import { StudentSubjectsListPage } from '@/features/materias-alumno/pages/StudentSubjectsListPage'
import { StudentSubjectDetailPage } from '@/features/materias-alumno/pages/StudentSubjectDetailPage'
import { StudentActivityDetailPage } from '@/features/materias-alumno/pages/StudentActivityDetailPage'
import { StudentCoursesPage } from '@/features/cursos-alumno/pages/StudentCoursesPage'
import { StudentCertificatesPage } from '@/features/certificaciones-alumno/pages/StudentCertificatesPage'
import { StudentTitulacionPage } from '@/features/titulacion-alumno/pages/StudentTitulacionPage'
import { StudentLibraryPage } from '@/features/biblioteca-alumno/pages/StudentLibraryPage'
import { ProfessorTitulacionPage } from '@/features/titulacion-profesor/pages/ProfessorTitulacionPage'
import { AdminTitulacionPage } from '@/features/titulacion-admin/pages/AdminTitulacionPage'
import { ProfessorCoursesPage } from '@/features/cursos-profesor/pages/ProfessorCoursesPage'
import { AdminCoursesPage } from '@/features/cursos-admin/pages/AdminCoursesPage'
import { ProfessorLibraryPage } from '@/features/biblioteca-profesor/pages/ProfessorLibraryPage'
import { ProfessorSubjectsListPage } from '@/features/materias-profesor/pages/ProfessorSubjectsListPage'
import { ProfessorSubjectDetailPage } from '@/features/materias-profesor/pages/ProfessorSubjectDetailPage'
import { ActivityFormPage } from '@/features/materias-profesor/pages/ActivityFormPage'
import { MaterialFormPage } from '@/features/materias-profesor/pages/MaterialFormPage'
import { AnnouncementsHistoryPage } from '@/features/avisos-profesor/pages/AnnouncementsHistoryPage'
import { AnnouncementCreatePage } from '@/features/avisos-profesor/pages/AnnouncementCreatePage'
import { AdminSubjectsListPage } from '@/features/materias-admin/pages/AdminSubjectsListPage'
import { AdminSubjectDetailPage } from '@/features/materias-admin/pages/AdminSubjectDetailPage'
import { StudentEvaluationsListPage } from '@/features/evaluaciones-alumno/pages/StudentEvaluationsListPage'
import { StudentEvaluationDetailPage } from '@/features/evaluaciones-alumno/pages/StudentEvaluationDetailPage'
import { ProfessorEvaluationsListPage } from '@/features/evaluaciones-profesor/pages/ProfessorEvaluationsListPage'
import { ProfessorEvaluationSubjectStudentsPage } from '@/features/evaluaciones-profesor/pages/ProfessorEvaluationSubjectStudentsPage'
import { ProfessorEvaluateStudentPage } from '@/features/evaluaciones-profesor/pages/ProfessorEvaluateStudentPage'
import { AdminEvaluationsListPage } from '@/features/evaluaciones-admin/pages/AdminEvaluationsListPage'
import { StudentLeaderboardPage } from '@/features/leaderboard-alumno/pages/StudentLeaderboardPage'
import { ProfessorLeaderboardPage } from '@/features/leaderboard-profesor/pages/ProfessorLeaderboardPage'
import { AdminLeaderboardPage } from '@/features/leaderboard-admin/pages/AdminLeaderboardPage'
import { ManagePointsPage } from '@/features/puntos-profesor/pages/ManagePointsPage'
import { StudentProfilePage } from '@/features/profile/pages/StudentProfilePage'
import { ProfessorProfilePage } from '@/features/profile/pages/ProfessorProfilePage'
import { AdminProfilePage } from '@/features/profile/pages/AdminProfilePage'
import { SettingsPage } from '@/features/profile/pages/SettingsPage'
import { EnrollmentGeneratorPage } from '@/features/admin/enrollment/pages/EnrollmentGeneratorPage'
import { ForumListPage } from '@/features/foro/pages/ForumListPage'
import { ForumCreatePage } from '@/features/foro/pages/ForumCreatePage'
import { ForumPostDetailPage } from '@/features/foro/pages/ForumPostDetailPage'
import { ForumNotificationsPage } from '@/features/foro/pages/ForumNotificationsPage'
import { ComunicacionPage } from '@/features/comunicacion/pages/ComunicacionPage'
import { AdminCareersListPage } from '@/features/carreras-admin/pages/AdminCareersListPage'
import { AdminGroupsListPage } from '@/features/grupos-admin/pages/AdminGroupsListPage'
import { AdminUsersPage } from '@/features/usuarios-admin/pages/AdminUsersPage'
import { AdminReportsListPage } from '@/features/reportes-admin/pages/AdminReportsListPage'
import { AdminReportDetailPage } from '@/features/reportes-admin/pages/AdminReportDetailPage'
import { AdminNotificationsPage } from '@/features/notificaciones-admin/pages/AdminNotificationsPage'
import { AdminLibraryPage } from '@/features/biblioteca-admin/pages/AdminLibraryPage'
import { AdminInstitutionSettingsPage } from '@/features/configuracion-admin/pages/AdminInstitutionSettingsPage'
import { AdminAuditPage } from '@/features/auditoria-admin/pages/AdminAuditPage'
import { AdminBackupsPage } from '@/features/backups-admin/pages/AdminBackupsPage'
import { AdminIncidentsPage } from '@/features/incidencias-admin/pages/AdminIncidentsPage'
import { StudentRecordPage } from '@/features/expediente-admin/pages/StudentRecordPage'
import { AdminAcademicManagementPage } from '@/features/academico-admin/pages/AdminAcademicManagementPage'
import { AdminRolesPage } from '@/features/roles-admin/pages/AdminRolesPage'
import { AdminRoleDetailPage } from '@/features/roles-admin/pages/AdminRoleDetailPage'
import { AdminAdministratorsPage } from '@/features/roles-admin/pages/AdminAdministratorsPage'
import { AdminSecurityPage } from '@/features/seguridad-admin/pages/AdminSecurityPage'
import { ADMIN_SECTIONS } from '@/features/dashboard-admin/admin-sections'
import { PlaceholderPage } from '@/components/PlaceholderPage'
import { AppLayout } from '@/layouts/AppLayout'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'
import { getRoleHome } from './navigation'

/**
 * Secciones del Administrador que ya cuentan con un módulo real y no deben
 * generar una ruta placeholder (además de las que no empiezan con /admin,
 * como Foro).
 */
const IMPLEMENTED_ADMIN_SECTIONS = new Set([
  'matriculas',
  'backups',
  'incidencias',
])

/**
 * Placeholders de las secciones del Administrador, generados desde la config.
 * Se excluyen las secciones que ya cuentan con un módulo real.
 */
const adminPlaceholderRoutes = ADMIN_SECTIONS.filter(
  (section) => section.to.startsWith('/admin') && !IMPLEMENTED_ADMIN_SECTIONS.has(section.key),
).map((section) => ({
  path: section.to,
  element: (
    <PlaceholderPage
      title={section.label}
      description={section.description}
      icon={section.icon}
      backTo="/admin"
      breadcrumb={[{ label: 'Inicio', to: '/admin' }, { label: section.label }]}
      futureNote={
        section.kind === 'tool'
          ? 'Preparada para futuras integraciones. Aún no conecta con servicios externos.'
          : undefined
      }
    />
  ),
}))

/** Redirección de la raíz: al inicio del rol si hay sesión, si no a /login. */
function RootRedirect() {
  const { isAuthenticated, user } = useAuth()
  return <Navigate to={isAuthenticated && user ? getRoleHome(user.role) : '/login'} replace />
}

const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  {
    element: <PublicOnlyRoute />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute allow={['alumno']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/alumno', element: <StudentDashboardPage /> },
          { path: '/alumno/materias', element: <StudentSubjectsListPage /> },
          { path: '/alumno/materias/:subjectId', element: <StudentSubjectDetailPage /> },
          {
            path: '/alumno/materias/:subjectId/actividades/:activityId',
            element: <StudentActivityDetailPage />,
          },
          { path: '/alumno/evaluaciones', element: <StudentEvaluationsListPage /> },
          { path: '/alumno/evaluaciones/:evaluationId', element: <StudentEvaluationDetailPage /> },
          { path: '/alumno/reportes', element: <StudentReportsListPage /> },
          { path: '/alumno/reportes/nuevo', element: <StudentReportCreatePage /> },
          { path: '/alumno/reportes/:reportId', element: <StudentReportDetailPage /> },
          { path: '/alumno/leaderboard', element: <StudentLeaderboardPage /> },
          { path: '/alumno/cursos', element: <StudentCoursesPage /> },
          { path: '/alumno/certificaciones', element: <StudentCertificatesPage /> },
          { path: '/alumno/titulacion', element: <StudentTitulacionPage /> },
          { path: '/alumno/biblioteca', element: <StudentLibraryPage /> },
          { path: '/alumno/perfil', element: <StudentProfilePage /> },
          { path: '/alumno/configuracion', element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allow={['profesor']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/profesor', element: <ProfessorDashboardPage /> },
          { path: '/profesor/materias', element: <ProfessorSubjectsListPage /> },
          { path: '/profesor/materias/:subjectId', element: <ProfessorSubjectDetailPage /> },
          { path: '/profesor/materias/:subjectId/actividades/nueva', element: <ActivityFormPage /> },
          {
            path: '/profesor/materias/:subjectId/actividades/:activityId/editar',
            element: <ActivityFormPage />,
          },
          { path: '/profesor/materias/:subjectId/materiales/nuevo', element: <MaterialFormPage /> },
          { path: '/profesor/evaluaciones', element: <ProfessorEvaluationsListPage /> },
          { path: '/profesor/evaluaciones/:subjectId', element: <ProfessorEvaluationSubjectStudentsPage /> },
          { path: '/profesor/evaluaciones/:subjectId/:studentId', element: <ProfessorEvaluateStudentPage /> },
          { path: '/profesor/reportes', element: <ProfessorReportsListPage /> },
          { path: '/profesor/reportes/:reportId', element: <ProfessorReportReviewPage /> },
          { path: '/profesor/avisos', element: <AnnouncementsHistoryPage /> },
          { path: '/profesor/avisos/nuevo', element: <AnnouncementCreatePage /> },
          { path: '/profesor/leaderboard', element: <ProfessorLeaderboardPage /> },
          { path: '/profesor/puntos', element: <ManagePointsPage /> },
          { path: '/profesor/titulacion', element: <ProfessorTitulacionPage /> },
          { path: '/profesor/cursos', element: <ProfessorCoursesPage /> },
          { path: '/profesor/biblioteca', element: <ProfessorLibraryPage /> },
          { path: '/profesor/perfil', element: <ProfessorProfilePage /> },
          { path: '/profesor/configuracion', element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allow={['administrador']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/admin', element: <AdminDashboardPage /> },
          { path: '/admin/materias', element: <AdminSubjectsListPage /> },
          { path: '/admin/materias/:subjectId', element: <AdminSubjectDetailPage /> },
          { path: '/admin/carreras', element: <AdminCareersListPage /> },
          { path: '/admin/grupos', element: <AdminGroupsListPage /> },
          { path: '/admin/usuarios', element: <AdminUsersPage defaultTab="alumnos" /> },
          { path: '/admin/alumnos', element: <AdminUsersPage defaultTab="alumnos" /> },
          { path: '/admin/alumnos/:studentId/expediente', element: <StudentRecordPage /> },
          { path: '/admin/profesores', element: <AdminUsersPage defaultTab="profesores" /> },
          { path: '/admin/incidencias', element: <AdminIncidentsPage /> },
          { path: '/admin/academico', element: <AdminAcademicManagementPage /> },
          { path: '/admin/administradores', element: <AdminAdministratorsPage /> },
          { path: '/admin/roles', element: <AdminRolesPage /> },
          { path: '/admin/roles/:roleId', element: <AdminRoleDetailPage /> },
          { path: '/admin/seguridad', element: <AdminSecurityPage /> },
          { path: '/admin/evaluaciones', element: <AdminEvaluationsListPage /> },
          { path: '/admin/reportes', element: <AdminReportsListPage /> },
          { path: '/admin/reportes/:reportId', element: <AdminReportDetailPage /> },
          { path: '/admin/leaderboard', element: <AdminLeaderboardPage /> },
          { path: '/admin/notificaciones', element: <AdminNotificationsPage /> },
          { path: '/admin/biblioteca', element: <AdminLibraryPage /> },
          { path: '/admin/institucion', element: <AdminInstitutionSettingsPage /> },
          { path: '/admin/auditoria', element: <AdminAuditPage /> },
          { path: '/admin/backups', element: <AdminBackupsPage /> },
          { path: '/admin/titulacion', element: <AdminTitulacionPage /> },
          { path: '/admin/cursos', element: <AdminCoursesPage /> },
          { path: '/admin/perfil', element: <AdminProfilePage /> },
          { path: '/admin/configuracion', element: <SettingsPage /> },
          { path: '/admin/matriculas', element: <EnrollmentGeneratorPage /> },
          ...adminPlaceholderRoutes,
        ],
      },
    ],
  },
  {
    // Foro académico: transversal a los tres roles.
    element: <ProtectedRoute allow={['alumno', 'profesor', 'administrador']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/foro', element: <ForumListPage /> },
          { path: '/foro/nuevo', element: <ForumCreatePage /> },
          { path: '/foro/notificaciones', element: <ForumNotificationsPage /> },
          { path: '/foro/:postId', element: <ForumPostDetailPage /> },
          { path: '/comunicacion', element: <ComunicacionPage /> },
          { path: '/comunicacion/:conversationId', element: <ComunicacionPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <RootRedirect /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
