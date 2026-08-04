Tipografía

Inter

Paleta

Azul

Blanco

Gris

Iconografía

Lucide

Espaciado

8px

Border Radius

12px

Cards

Sí

Sombras

Suaves

---

# Implementación

Actualizado al cierre del Sprint 1.

## Tokens

Definidos como variables CSS en `src/index.css`.

Tema claro por defecto.

- Border radius base: `--radius: 0.75rem` (12px)
- Color institucional: `--primary` azul, espacio de color oklch
- Superficies: `--background`, `--card`, `--muted`
- Sidebar: `--sidebar`, `--sidebar-accent`, `--sidebar-border`
- Gráficas: `--chart-1` a `--chart-5`

La marca se centraliza en `src/utils/brand.ts`.

## Componentes base

Generados con shadcn/ui en `src/components/ui`.

button, card, input, label, textarea, select, alert, avatar, badge, dropdown-menu, sheet, separator, tooltip, skeleton, scroll-area, progress

## Componentes reutilizables propios

Layout — `src/components/layout` y `src/layouts`

- `Sidebar` — navegación por secciones, recibe la estructura por props
- `Header` — título, botón de navegación móvil y menú de usuario opcional
- `UserMenu` — avatar con menú desplegable y cierre de sesión
- `MainLayout` — estructura visual completa, sidebar fijo en escritorio y desplegable en móvil
- `AppLayout` — resuelve la navegación según el rol y delega en `MainLayout`

Marca

- `SplashScreen` — pantalla de arranque

Formularios — `src/features/auth/components`

- `PasswordInput` — campo de contraseña con mostrar/ocultar

Datos — `src/components`

- `StatCard` — tarjeta de indicador con etiqueta, valor, icono y texto de apoyo (Sprint 2)
- `EmptyState` — estado vacío con icono, título y descripción (Sprint 2)
- `ComingSoonButton` — botón placeholder que muestra "Disponible próximamente" (Sprint 3)

Navegación y placeholders — `src/components`

Agregados en el Sprint 4.

- `QuickAccessCard` — tarjeta de acceso rápido que enlaza a una sección
- `QuickAccessGrid` — retícula responsive de accesos rápidos
- `PlaceholderPage` — pantalla placeholder para módulos aún no implementados, con nota opcional de integraciones futuras

Reportes — `src/components`

Agregados en el Sprint 5. Reutilizables por Alumno y Profesor.

- `BackLink` — enlace "Volver" para páginas de detalle
- `ReportStatusBadge` — insignia de estado del reporte (pendiente / aprobado / correcciones)
- `ReportListItem` — fila de reporte enlazable para listados
- `ReportContentCard` — contenido del reporte con metadatos y evidencias
- `ReportEvaluationSummary` — resumen de una evaluación registrada

Foro — `src/components`

Agregado en el Sprint 6.

- `AuthorRoleBadge` — insignia del rol del autor (Profesor / Administrador)

Materias — `src/components`

Agregado en el Sprint 7.

- `SubjectSectionCard` — contenedor de sección dentro de una materia (Resumen, Actividades, Material, Avisos)
- `ActivityList` — listado de actividades con estado y vencimiento
- `MaterialList` — listado de materiales (documento, video, enlace) con enlace para abrir
- `AnnouncementList` — listado de avisos con autor y fecha
- `StudentList` — listado de estudiantes con progreso y nivel de competencia

Evaluaciones — `src/components`

Agregado en el Sprint 8.

- `CompetencyLevelBadge` — insignia de nivel de competencia con colores por escala (A+ a D)
- `CompetencyEvaluator` — formulario de evaluación de competencias con select de niveles (read-only optional)
- `BadgeList` — listado de insignias con UI seleccionable (opcional) para asignación

## Widgets del Foro

`src/features/foro/components`

- `AuthorLine` — autoría con avatar, nombre, insignia de rol y antigüedad
- `ForumPostCard` — tarjeta de publicación para el feed
- `ForumFilters` — buscador y chips de categoría (cliente)
- `CommentThread` — comentarios con respuestas anidadas
- `PostForm` — formulario de creación de publicación

## Widgets de Dashboard compartidos

`src/components/dashboard`

Presentacionales y agnósticos al rol. Reciben los datos por props y no acceden a la capa de datos. Consumidos por Alumno y Profesor.

- `WelcomeCard` — bienvenida con título, subtítulo y etiquetas de contexto
- `KpiGrid` — retícula responsive de indicadores a partir de una lista
- `RecentActivityCard` — bitácora de movimientos recientes
- `UpcomingActivitiesCard` — entregas próximas con indicador de vencimiento
- `AnnouncementsCard` — avisos institucionales

## Widgets de Dashboard propios por rol

Alumno — `src/features/dashboard-alumno/components`

- `ProgressCard` — avance del periodo y nivel por competencia
- `SubjectsCard` — materias con profesor y avance

Profesor — `src/features/dashboard-profesor/components`

- `ProfessorSubjectsCard` — materias con grupo y número de alumnos
- `PendingReportsCard` — reportes pendientes de revisión

Administrador — `src/features/dashboard-admin/components`

- `IndicatorsCard` — indicadores institucionales como porcentajes
- `ToolsSection` — sección de Herramientas (Generador de Matrículas)

Los tres dashboards comparten el mismo estado de carga: `DashboardSkeleton` (ver "Navegación y consistencia de páginas", Sprint 12). Los esqueletos propios de cada rol (`DashboardSkeleton` de Alumno, `ProfessorDashboardSkeleton`, `AdminDashboardSkeleton`) se retiraron por duplicados.

## Navegación y Perfiles

`src/features/profile/pages` y `src/components/layout`

Agregados en el Sprint 9.

Perfiles

- `StudentProfilePage` — perfil de alumno con información académica
- `ProfessorProfilePage` — perfil de profesor con departamento y asignaciones
- `AdminProfilePage` — perfil de administrador con nivel de acceso

Configuración

- `SettingsPage` — página de configuración (placeholder) con secciones para general, notificaciones, apariencia y seguridad

Navegación

- `UserMenu` — menú desplegable de usuario mejorado con acceso a perfil, configuración (admin) y cierre de sesión
- Enlaces "Volver" en todas las páginas secundarias usando `BackLink` component

## Patrones de Navegación (Sprint 9)

- Botón "Volver" consistente en todas las páginas de detalle
- Menú de usuario centralizado con rutas por rol
- Navegación sidebar con acceso a Materias, Evaluaciones, Reportes y Foro
- Rutas protegidas por rol con redirección automática

## Navegación y consistencia de páginas (Sprint 12)

`src/components`

Componentes reutilizables en toda la plataforma, no específicos de una feature.

- `Breadcrumb` — ruta de navegación (Inicio > Sección > Página actual)
- `PageHeader` — breadcrumb + botón "Volver" (opcional) + título + subtítulo + acción opcional; encabezado estándar de página, usado en la mayoría de los listados, detalles, formularios y perfiles
- `SearchInput` — buscador con ícono
- `FilterChips` — fila de chips de filtro de valor único
- `Pagination` — paginación mock sobre datos ya cargados en memoria
- `ListSkeleton` — estado de carga para listados, variante "row" (tarjeta con líneas) o "block" (bloque simple)
- `DashboardSkeleton` — estado de carga compartido por los tres dashboards, configurable por número de KPIs y tipo de bloque inferior

`src/hooks`

- `useSearch` — filtra una lista en memoria por texto de búsqueda
- `usePagination` — pagina una lista en memoria

Patrón: cada listado de la plataforma (Materias, Evaluaciones, Reportes, Foro) compone `PageHeader` + `SearchInput` (+ `FilterChips` si aplica) + `ListSkeleton` mientras carga + `EmptyState` (sin datos o sin resultados de búsqueda) + `Pagination` al final de la lista.

## Demo Funcional del Módulo Profesor (Sprint Demo Profesor, 2026-07-29)

`src/components`

- `MockFileInput` — input de archivo real oculto disparado por un botón con estilo propio; captura solo el nombre del archivo (sin subir contenido), primer patrón de adjuntos mock del proyecto. Usado en Actividades, Materiales y Avisos.
- `EvaluationStatusBadge` — insignia de estado de evaluación (Borrador / Pendiente / Publicada)

`src/components` — actualizados

- `CompetencyEvaluator` — pasó de select de nivel de letra a captura por porcentaje (0-100) con conversión automática a letra vía `percentageToLevel`; soporta `readOnly` para el estado bloqueado (evaluación publicada)
- `CompetencyLevelBadge` — agregó colores para los niveles C+ y F (escala ahora de 8 niveles) y una prop opcional `percentage` para mostrar el formato "92% · A"
- `ActivityList` — props opcionales `onEdit`/`onDelete` con botones de icono, antes solo de lectura
- `MaterialList` — icono ampliado a 7 tipos (documento, Word, Excel, PowerPoint, imagen, video, enlace) y prop opcional `onDelete`
- `SubjectSectionCard` — prop opcional `actions` para agregar botones (ej. "Nueva actividad") al encabezado de la sección

`src/utils`

- `grade.ts` (`percentageToLevel`) — utilidad pura que convierte un porcentaje a la escala de 8 niveles (A+ a F); ver `docs/PRD-v1.md` §12.5 y ADR-007 en `docs/DECISIONS.md`

## Retícula responsive

- KPIs: 1 columna en móvil, 2 en tablet, 4 en escritorio
- Bloque principal: 1 columna en móvil, 3 en escritorio
- Bloque inferior: 1 columna en móvil, 2 en escritorio
- Perfil: 1 columna en móvil, 2 en tablet y escritorio