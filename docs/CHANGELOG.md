# Changelog

## v1.18.0

Fecha

2026-08-04

Release

1.15.0 — RBAC Completo (Administrador Maestro)

Sprint

Sprint 20 — RBAC Completo (Administrador Maestro) + Arquitectura de Permisos

Alcance

Este sprint reemplaza el rol único "Administrador" por una jerarquía completa de control de acceso: Administrador Maestro → Administradores → Roles → Permisos → Módulos. Introduce 6 roles predefinidos con capacidades explícitas, una matriz de permisos independiente por módulo (20 módulos, ampliando aditivamente los 10 que detalla el sprint para cubrir todo el panel ya construido), roles personalizados, herencia de permisos (rol + personalizados, unión pura), una pantalla de Gestión de Administradores, un Panel de Seguridad nuevo, placeholders ampliados de Configuración General para la Fase Backend, y un Sidebar del Administrador completamente reagrupado por categorías. Descrito por el propio sprint como "el cierre funcional del MVP". No se modificó el diseño general, no se rompió ningún módulo existente, no se cambió ninguna ruta existente (solo se agregaron rutas nuevas) y se mantuvo compatibilidad con los Sprints 1–19. Ver ADR-014 (`docs/DECISIONS.md`), `docs/RBAC.md` y `docs/PERMISSIONS.md`.

### Agregado

- **Modelo de datos RBAC** (`types/rbac.ts`, nuevo): `PERMISSION_MODULES` (20 módulos, cada uno con sus propias acciones — ej. `usuarios.reiniciar_contrasena`, `carreras.gestionar_titulacion`), `PermissionKey` (`"modulo.accion"`), `RoleDefinition` (nombre/descripción/color/ícono/`isSystem`/estado/permisos), `AdminRoleAssignment` (rol + permisos personalizados)
- **6 roles predefinidos** (`mocks/rbac.ts`): Administrador Maestro (todos los permisos, irrestricto), Soporte Técnico, Control Escolar, Coordinador Académico, Finanzas (permisos preparados sin módulo de Finanzas construido, ver ADR-014) y Atención Estudiantil — sembrados como `isSystem: true` (no editables ni eliminables)
- **Capa de servicio RBAC** (`services/rbac.service.ts`, nuevo): CRUD de roles (bloqueado para roles de sistema), asignación de rol por administrador, permisos personalizados, y `getEffectivePermissionsAsync` — unión pura de permisos del rol + personalizados, nunca resta (ver ADR-014). Cada mutación registra auditoría (`recordAudit(actor, 'Roles y Permisos', …)`)
- **`utils/permissions.ts` reescrito**: `hasPermission`/`hasModuleAccess`/`isValidPermission`, funciones puras sobre un arreglo de permisos efectivos ya resuelto — reemplaza el stub del Sprint 19 que siempre devolvía `true`
- **Pantalla Roles y Permisos** (`/admin/roles`, `/admin/roles/:roleId`, nuevas): lista de roles con conteo de permisos, matriz de permisos por módulo (`PermissionMatrix`, reutilizable), creación de roles personalizados (nombre/descripción/color/ícono), matriz de solo lectura para roles de sistema
- **Pantalla Gestión de Administradores** (`/admin/administradores`, nueva): nombre/correo/rol/estado/último acceso/permisos heredados/personalizados por administrador; hoja de asignación (`AdminAssignSheet`) con selector de rol (autoguardado) y matriz de permisos personalizados con permisos heredados marcados y bloqueados; Editar/Suspender/Reactivar/Dar de baja, todo deshabilitado para el Administrador Maestro (irrestricto)
- **Panel de Seguridad** (`/admin/seguridad`, nuevo): administradores activos, sesiones abiertas (misma ventana de 15 min que "conectados" del Dashboard), intentos fallidos, usuarios bloqueados, contraseñas reiniciadas, cambios críticos y actividad reciente — íntegramente derivado de Usuarios y Auditoría (`admin.service.ts#getSecurityOverviewAsync`), sin un store de sesiones nuevo
- **Cuentas de Administrador con roles distintos** (`mocks/userManagement.ts`): 3 administradores nuevos (`adm-003`/`adm-004`/`adm-005`, cuentas demo sin credenciales reales) sumados a los 2 ya existentes, cada uno con un rol y — en dos casos — un permiso personalizado, para poblar la pantalla con variedad realista
- **`ensureDefaultAssignment`**: al crear un administrador o cambiar el rol de un usuario a `administrador`, se le asigna automáticamente el rol `role-atencion` (rol por defecto de menor privilegio) si no tiene ya una asignación — nunca sobrescribe una asignación real existente
- **Placeholders de Configuración ampliados**: 7 campos deshabilitados nuevos dentro de "Configuración General" (Google Drive, Google Calendar, OpenAI, Spring Boot Backend, Base de Datos, API Keys, Variables del sistema) — arquitectura preparada para la Fase Backend, sin servicio real conectado

### Cambiado

- `routes/navigation.ts`: `ROLE_NAV.administrador` reestructurado de 1 sección plana (8 accesos) a 4 secciones agrupadas — Inicio, Administración (Usuarios/Administradores/Roles y Permisos/Auditoría/Seguridad/Configuración), Académico (Gestión Académica/Materias/Carreras/Producto de Titulación/Cursos y Certificaciones/Biblioteca/Evaluaciones) y Comunidad (Foro y Moderación/Leaderboard/Notificaciones/Comunicación) — ninguna ruta existente cambió, ver ADR-014. Alumno y Profesor no se modificaron
- `types/admin.ts`/`services/admin.service.ts`: `AdminDashboard` gana `effectivePermissions: PermissionKey[]` (resuelto vía `getEffectivePermissionsAsync` en `getAdminDashboard`); nuevo `SecurityOverview` y `getSecurityOverviewAsync`
- `features/dashboard-admin/admin-sections.ts`: de 9 a 3 entradas (Centro de Incidencias, Respaldos, Generador de Matrículas) — el resto de los accesos que antes vivían como tarjetas del Dashboard ahora tienen entrada directa en el Sidebar rediseñado; `AdminSection.permission` (tipo `PermissionKey` del Sprint 19) se renombra a `moduleKey` (tipo `ModuleKey`)
- `features/dashboard-admin/pages/AdminDashboardPage.tsx`: `buildQuickAccess` pasa a recibir `effectivePermissions` y filtrar con `hasModuleAccess`, en vez de recibir `role` y llamar al `hasPermission(role, permission)` del Sprint 19 (que siempre devolvía `true`)
- `types/audit.ts`: `AuditModule` gana `'Roles y Permisos'`
- `services/userManagement.service.ts`: `createManagedUserAsync`/`changeUserRoleAsync` llaman a `ensureDefaultAssignment` cuando el usuario resultante es `administrador`
- `routes/AppRouter.tsx`: 4 rutas nuevas (`/admin/administradores`, `/admin/roles`, `/admin/roles/:roleId`, `/admin/seguridad`); `IMPLEMENTED_ADMIN_SECTIONS` recortado de 9 a 3 claves para reflejar el nuevo `admin-sections.ts`

### Eliminado

- `types/permissions.ts` (Sprint 19): el `PermissionKey` de 9 valores fijos se reemplaza por el catálogo real de `types/rbac.ts`

### Notas

- El rol Finanzas tiene permisos modelados sin una feature de Finanzas construida — preparación de arquitectura explícita, no una funcionalidad simulada (ADR-014)
- "Suspender" en Gestión de Administradores reutiliza el estado `bloqueado` ya existente en `ManagedUserStatus`, no introduce un cuarto valor
- No se modificó autenticación, backend real, ni diseño general; toda la arquitectura queda preparada para la Fase Backend, por instrucción explícita del sprint

---

## v1.17.0

Fecha

2026-08-04

Release

1.14.0 — Centro de Gestión Universitaria

Sprint

Sprint 19 — Administrador (Rediseño Completo del Panel Administrativo)

Alcance

Este sprint convierte el panel del Administrador en un verdadero Centro de Gestión Universitaria: rediseña el Dashboard con indicadores curados y dinámicos, transforma la Gestión de Usuarios y la Biblioteca en herramientas realmente funcionales, agrega un Expediente Académico y un Centro de Incidencias nuevos, consolida Carreras/Materias/Grupos/Planes de Estudio/Cuatrimestres/Rúbricas/Evaluaciones/Reportes/Titulación/Leaderboard bajo un solo hub de Gestión Académica, fusiona Moderación dentro de Foro, amplía Auditoría a cobertura real (sesión, descargas, moderación), agrega placeholders de Configuración General sin backend, y prepara — sin implementar — la arquitectura de permisos para el Administrador Maestro del Sprint 20. No se modificó autenticación, backend real, ni el estilo visual del proyecto; el Sidebar (`navigation.ts`) tampoco se tocó.

### Agregado

- **Dashboard Ejecutivo curado** (`AdminDashboardPage`): 9 indicadores calculados en vivo (usuarios activos, alumnos/profesores conectados, solicitudes pendientes, reportes por revisar, evaluaciones pendientes, titulación pendiente, tickets abiertos, estado de la plataforma) + tarjeta de Alertas (cuentas bloqueadas, incidencias de prioridad alta, reportes acumulados) — reemplaza el `KpiGrid` de 18 tarjetas, el grid de 14 accesos rápidos y el Centro de Reportes como acceso separado
- **Gestión de Usuarios completa**: alta de usuarios (`createManagedUserAsync`, antes no existía), campo `matricula`, "Último acceso" (`lastLoginAt`, actualizado automáticamente vía `AuditListener` al reaccionar a `USER_LOGIN`) y enlace directo "Ver expediente académico" por alumno
- **Expediente Académico** (`/admin/alumnos/:studentId/expediente`, nuevo): agrega en una sola pantalla datos personales, carrera/materias, kardex y evaluaciones, reportes semanales, Producto de Titulación, cursos y certificaciones, Leaderboard y badges, y actividad/incidencias del alumno — reutiliza cada servicio existente, no duplica ningún dato. Pensado para uso futuro de Control Escolar, Servicios Escolares y Atención Estudiantil
- **Gestión Académica** (`/admin/academico`, nuevo hub): reúne Carreras, Materias, Grupos, Evaluaciones, Reportes, Producto de Titulación, Leaderboard y Cursos como resumen con datos en vivo y acceso directo, más dos conceptos nuevos con CRUD nativo — **Planes de Estudio** y **Cuatrimestres** (`types/academicPlan.ts`, `services/academicPlan.service.ts`) — y una pestaña de referencia de **Rúbricas** (Rúbrica A/B y escala de niveles del Sprint 17, sin duplicar el motor de cálculo)
- **Biblioteca como Gestor Documental**: 4 categorías nuevas (Biblioteca Digital, Videos, Presentaciones, Archivos de apoyo, sumadas a las 12 ya existentes), etiquetas (`tags`) con búsqueda avanzada, **versionado** de archivos (`replaceLibraryDocumentFileAsync`, nunca sobrescribe — agrega al historial `versions[]`) y **programación de publicación/vencimiento** (`publishAt`/`expiresAt`, `isLibraryDocumentPublished()`) — la vista de solo lectura de Alumno/Profesor ya filtra documentos programados o vencidos
- **Centro de Incidencias** (`/admin/incidencias`, nuevo): bandeja única para reportes del Foro (recibidos automáticamente vía `IncidentSyncListener`, nuevo) y solicitudes académicas/técnicas/administrativas, con estado, prioridad, responsable e historial
- **Auditoría ampliada**: nuevos módulos `Sesión`/`Foro`/`Incidencias`/`Gestión Académica`; inicio y cierre de sesión ahora se registran automáticamente (`AuditListener`, nuevo, reacciona a `USER_LOGIN`/`USER_LOGOUT` — no se tocó `auth.service.ts`); intentos de inicio de sesión fallidos (`recordAnonymousAudit`, sin actor autenticado); descargas de Biblioteca; moderación del Foro (eliminar/restaurar/advertir/resolver reportes); campos `browserSimulated`/`osSimulated`/`locationSimulated` (antes solo `device`), preparación explícita para IP/SO/navegador/ubicación/dispositivo reales
- **Foro + Moderación fusionados**: se eliminó la ruta y sección independientes `/admin/moderacion`; su contenido (`ModerationPanel`, extraído de la antigua `ModerationCenterPage`) ahora es una pestaña "Moderación" visible solo para el Administrador dentro de `/foro`, sin afectar la vista de Alumno/Profesor
- **Configuración General (placeholders)**: nueva sección "Próximamente" dentro de Configuración Institucional con campos deshabilitados para correo (SMTP), Zoom, Google Workspace, otras integraciones, notificaciones push y seguridad (2FA) — interfaz preparada, sin backend ni servicio real conectado, explícitamente para el Administrador Maestro del Sprint 20
- **Preparación de arquitectura RBAC** (`types/permissions.ts`, `utils/permissions.ts#hasPermission`, nuevo): cada sección de `admin-sections.ts` declara un `permission` (`PermissionKey`); el Dashboard filtra sus accesos rápidos llamando siempre a `hasPermission(role, permission)`, nunca comparando `role === 'administrador'` directamente — hoy concede todo al rol único Administrador, pero el Sprint 20 puede introducir niveles reales sin tocar ningún componente

### Cambiado

- `features/dashboard-admin/admin-sections.ts`: de 17 a 9 secciones — se retiraron las que duplicaban un acceso ya existente en el Sidebar (Materias, Cursos, Biblioteca, Titulación, Evaluaciones, Foro) o que ahora viven dentro de un hub (Carreras/Grupos/Reportes/Rúbricas → Gestión Académica; Moderación → Foro; Configuración de cuenta ya accesible desde el Header)
- `types/admin.ts`/`services/admin.service.ts`: nuevo `AdminExecutiveIndicators`/`AdminAlert` y `computeExecutiveIndicators()`/`computeAlerts()`; `AdminKpis`/`computeKpis()` se conservan intactos y ahora se reutilizan también desde `getAcademicSummaryAsync()` (hub de Gestión Académica)
- `types/userManagement.ts`: `ManagedUser` gana `matricula?`/`lastLoginAt?`; `ManagedUserEditInput` gana `matricula?`; nuevo `ManagedUserCreateInput`
- `types/audit.ts`: `AuditModule` gana 4 valores nuevos; `role` pasa a opcional (entradas anónimas); `AuditLogEntry` gana `browserSimulated`/`osSimulated`/`locationSimulated` (`device` se conserva por compatibilidad)
- `types/library.ts`: `LibraryDocument` gana `tags`/`version`/`versions`/`publishAt`/`expiresAt`; `LIBRARY_CATEGORIES` pasa de 12 a 16 valores
- `services/forum.service.ts`: `reviewForumReport`/`deleteForumPost`/`deleteForumComment`/`restoreForumContent`/`issueForumWarning` ahora llaman a `recordAudit(actor, 'Foro', …)`, antes no auditaban ninguna acción de moderación
- `services/course.service.ts`: sin cambios funcionales en este sprint (ya emitía `COURSE_COMPLETED` desde el Sprint 18)

### Eliminado

- `features/moderacion-admin/pages/ModerationCenterPage.tsx` y la ruta `/admin/moderacion`: su lógica se conserva íntegra en `features/moderacion-admin/components/ModerationPanel.tsx`, montada dentro de `/foro`
- `features/dashboard-admin/components/ToolsSection.tsx` e `IndicatorsCard.tsx`: reemplazados por el Dashboard Ejecutivo consolidado (un solo `QuickAccessGrid` con las 9 secciones, en vez de dos grids separados)

### Notas

- "Solicitudes pendientes" y "Tickets abiertos" se derivan ambos de Incidencias (`abierto` vs. `abierto`+`en_proceso`) por ser la única fuente de datos real disponible para ese concepto en este sprint — no existe todavía un formulario de Alumno/Profesor para generar solicitudes directamente; el Centro de Incidencias se puebla automáticamente desde reportes del Foro y manualmente por el Administrador. Alcance deliberadamente reducido, ver ADR-013
- "Alumnos/Profesores conectados" es una aproximación por `lastLoginAt` (ventana de 15 minutos) — no hay presencia en tiempo real en este MVP
- El comparador de versiones de Biblioteca (como en Titulación, Sprint 18) no reconstruye el contenido íntegro de versiones pasadas de un archivo, solo su metadato (nombre, tamaño, fecha, autor)
- No se modificó autenticación, backend real, diseño general, ni el Sidebar (`navigation.ts`), por instrucción explícita del sprint

---

## v1.16.0

Fecha

2026-08-03

Release

1.13.0 — Producto de Titulación (Core Académico)

Sprint

Sprint 18 — Producto de Titulación (Core Académico)

Alcance

Este sprint convierte el Producto de Titulación en el núcleo del modelo académico: cada alumno tiene un único producto con versionado completo (nunca se sobrescribe información), retroalimentación por fase, archivos tipados y versionados, historial de auditoría completo, sincronización automática desde el resto de la plataforma y capacidades ampliadas para los 3 roles. Se preparó además la capa de backend (repositorio + adaptador) sin conectar todavía una base de datos real. No se modificó autenticación, diseño general ni navegación existente más allá de lo ya agregado en el Sprint 17.

### Agregado

- **Modelo de datos completo** (`types/titulacion.ts`, reescrito): `TitulacionProduct` (renombra a `TitulacionProject` del Sprint 17) con Información general (objetivo, estado, carrera, materia, profesor, versión, fechas, % de avance, competencias), `TitulacionPhase` con versionado (`versions: TitulacionVersionSnapshot[]`, nunca se sobrescribe), `TitulacionFile` con 9 tipos (PDF/Word/Excel/PowerPoint/ZIP/Imagen/Video/Audio/Enlace) y número de versión propio, `TitulacionFeedbackEntry` con 5 tipos (comentario/aprobación/rechazo/solicitud de cambios/observación) y `TitulacionHistoryEntry` con 14 acciones distintas (quién/qué/cuándo/desde dónde)
- **Capa de repositorio/adaptador** (`repositories/titulacion.repository.ts`, `repositories/adapters/titulacion.mock-adapter.ts`): interfaz `TitulacionRepository` con 13 operaciones + `TitulacionMockAdapter` (implementación en memoria) — `services/titulacion.service.ts` ya no importa datos mock directamente, solo el repositorio; ver ADR-012
- **Versionado y borradores**: el alumno guarda borradores (`saveDeliverableDraft`, no versiona), duplica una versión anterior como nuevo borrador editable (`duplicatePhaseVersion`), publica la versión final de una fase (`publishPhase`, incrementa versión y agrega snapshot) y compara dos versiones lado a lado (`TitulacionPhaseCard`, selector de Versión A/Versión B)
- **Retroalimentación por fase ampliada**: el profesor puede comentar, solicitar cambios y agregar observaciones (además de aprobar/rechazar, ya existentes desde el Sprint 17), cada una tipada y con autor/fecha
- **Archivos versionados**: selector de 9 tipos de archivo al adjuntar (`TitulacionFileUploader`); un archivo con el mismo nombre nunca sobrescribe al anterior, agrega una nueva versión
- **Historial completo** (`TitulacionHistoryPanel`): registro de quién/qué/cuándo/desde dónde para crear/modificar/comentar/aprobar/rechazar/descargar/publicar/subir archivo/sincronizar/reasignar profesor/desbloquear fase/editar estado/cerrar producto/exportar
- **Sincronización automática** (`core/events/listeners/TitulacionSyncListener.ts`, nuevo): escucha `REPORT_SUBMITTED`, `GRADE_UPDATED` (publicada), `ACTIVITY_SUBMITTED`, `BADGE_GRANTED`, `LEADERBOARD_UPDATED` (Top 3) y el evento nuevo `COURSE_COMPLETED` — adjunta evidencia automáticamente vía `attachTitulacionEvidenceAsync`, sin que ningún módulo fuente conozca Titulación
- **Avance automático**: `recomputeProduct()` recalcula siempre `progressPercentage` (fases aprobadas / total), `completedDeliverables`/`pendingDeliverables` y agrega competencias derivadas de evidencia sincronizada (evaluaciones/badges) — nunca se captura a mano
- **Dashboard del módulo**: barra de progreso, ficha de información general, últimas modificaciones, archivos recientes y timeline de historial, visibles en el mismo panel para los 3 roles
- **Capacidades del Administrador** (`/admin/titulacion`): reasignar profesor (selector con el directorio real de profesores), desbloquear fases bloqueadas, editar el estado del producto, cerrar el producto y un botón de exportar (arquitectura preparada, ver abajo)
- **Arquitectura de exportación** (`services/export/titulacionExport.adapter.ts`, nuevo): `TitulacionExportAdapter` con un adaptador stub (`exportProduct` devuelve `{ ready: false, message }`) — preparado para conectar generación real de PDF/Word/repositorio institucional sin tocar los llamadores
- Componentes nuevos: `TitulacionFileUploader`, `TitulacionPhaseCard`, `TitulacionHistoryPanel` (extraídos de `TitulacionProjectPanel` para mantener cada componente enfocado y bajo el límite de líneas del proyecto)

### Cambiado

- `types/titulacion.ts`: reescrito completo — `TitulacionProject` → `TitulacionProduct` (ruptura deliberada, ver ADR-012); todos los consumidores se actualizaron en el mismo sprint
- `services/titulacion.service.ts`: reescrito para depender de `getTitulacionRepository()` en vez de `mocks/titulacion.ts` (retirado); gana funciones nuevas (`publishTitulacionPhaseAsync`, `duplicateTitulacionPhaseVersionAsync`, `addTitulacionPhaseFeedbackAsync`, `recordTitulacionFileDownloadAsync`, `reassignTitulacionProfessorAsync`, `unlockTitulacionPhaseAsync`, `setTitulacionProductStatusAsync`, `closeTitulacionProductAsync`, `attachTitulacionEvidenceAsync`)
- `components/TitulacionProjectPanel.tsx`: reescrito sobre el nuevo modelo — orquesta `TitulacionPhaseCard` (por fase) y `TitulacionHistoryPanel` (historial global), agrega la ficha de dashboard
- `StudentTitulacionPage`/`ProfessorTitulacionPage`/`AdminTitulacionPage`: reescritas para el nuevo modelo y las nuevas capacidades por rol
- `features/materias-profesor/components/SubjectInlinePanel.tsx`: pestaña "Titulación" actualizada al tipo `TitulacionProduct`/`listTitulacionProductsAsync` (sin cambios de comportamiento)
- `core/events/EventTypes.ts`: agrega el evento `COURSE_COMPLETED` (`CourseCompletedPayload`)
- `services/course.service.ts`: `markCourseCompletedAsync` emite `COURSE_COMPLETED` la primera vez que un curso pasa a "finalizado" (asociado a la única cuenta real de Alumno del MVP, `usr-alumno-001`, ya que el catálogo de cursos no distingue alumno)
- `core/events/listeners/index.ts`: registra `TitulacionSyncListener`

### Eliminado

- `mocks/titulacion.ts` (Sprint 16/17): su lógica quedó absorbida por `repositories/adapters/titulacion.mock-adapter.ts`

### Notas

- Cada alumno sigue teniendo un único Producto de Titulación (seed para `usr-alumno-001`, la única cuenta real de Alumno del MVP), consistente con el patrón de cuenta única usado en el resto de la plataforma
- El comparador de versiones muestra comentario/resumen de cambios/autor/fecha lado a lado; no reconstruye el contenido íntegro de cada entregable en versiones pasadas (documentado como limitación del MVP en `duplicatePhaseVersion`)
- No se modificó autenticación, backend real, diseño general, ni se eliminó ninguna funcionalidad existente, por instrucción explícita del sprint

---

## v1.15.0

Fecha

2026-08-03

Release

1.12.0 — Modelo Académico Imperalianz

Sprint

Sprint 17 — Modelo Académico Imperalianz

Alcance

Este sprint convierte el panel del Profesor en el centro de seguimiento académico institucional y reconstruye el sistema de Evaluación según el Modelo Educativo Imperalianz, sin romper ningún sprint anterior. Se agregaron explícitamente al menú lateral de los 3 roles "Cursos y Certificaciones", "Biblioteca" y "Producto de Titulación" (única excepción autorizada por el propio sprint a "no cambiar navegación") y se implementó la primera versión funcional (no solo de lectura) del Producto de Titulación, cruzando Alumno, Profesor y Administrador.

### Agregado

- **Dashboard Docente plegable** (`/profesor/materias`): cada materia se expande in-line (sin navegar a otra pantalla) con pestañas Alumnos/Actividades/Materiales/Reportes/Evaluaciones/Leaderboard/Producto de Titulación — cada pestaña carga su propia fuente de datos la primera vez que se abre. El acceso a la pantalla de detalle completa se conserva vía "Ver detalle completo"
- **Sistema de Rúbricas dinámicas** (`types/rubric.ts`, `utils/rubric.ts`): criterios con nombre y peso, calificados por nivel (Excelente/Bueno/Suficiente/Insuficiente) con comentario; el % final y la letra se calculan siempre automáticamente, reutilizando la escala de 5 niveles ya construida para Reportes (ADR-008) en vez de inventar una tercera
- **Evaluación reconstruida** (`ProfessorEvaluateStudentPage`, `StudentEvaluationDetailPage`): cada evaluación captura ahora Rúbrica A (70%, dominio académico) + Rúbrica B (30%, desempeño/actitud) + bonificación → % final y letra automáticos (visibles ambos siempre, la letra nunca sustituye al %), Observaciones internas (distintas de la Retroalimentación dirigida al alumno), Intentos (se incrementa en cada guardado) y Profesor evaluador — además de lo ya existente (competencias, badges, estado, fecha). Cada guardado del profesor queda auditado
- **Gestión de Actividades ampliada**: nuevas acciones Duplicar (crea copia oculta) y Ocultar/Mostrar sin eliminar; el formulario captura instrucciones, fecha de apertura, porcentaje de evaluación y rúbrica editable (agregar/quitar criterios); nuevos tipos de adjunto audio, video y enlace
- **Gestión de Materiales ampliada**: descripción, categoría, etiquetas, ocultar/mostrar y programar visibilidad por fecha — el alumno nunca ve materiales ocultos ni programados a futuro
- **Producto de Titulación, primera versión funcional** (`/alumno/titulacion`, `/profesor/titulacion`, `/admin/titulacion`): el alumno redacta borradores por entregable, sube archivos y envía cada fase a revisión; el profesor ve el avance, aprueba o rechaza cada fase (con retroalimentación obligatoria), agrega observaciones generales y consulta el historial completo; el Administrador consulta de forma agregada y de solo lectura. El % de avance se deriva de fases aprobadas / total de fases — sin fórmula oculta
- **Cursos y Certificaciones fusionados** (`CursosCertificacionesPanel`, un solo componente con pestañas Activos/Finalizados/Certificados) en los 3 perfiles — Alumno puede marcar cursos como completados, Profesor/Administrador consultan en solo lectura. Las rutas anteriores del Alumno (`/alumno/cursos`, `/alumno/certificaciones`, Sprint 16) se conservan sin romperse
- **Biblioteca del Profesor** (`/profesor/biblioteca`, solo lectura): mismo componente de solo lectura ya usado por el Alumno (`LibraryReadOnlyView`), la del Administrador sigue con gestión completa sin cambios
- **Comunicación — grupos privados del Profesor**: el profesor ahora puede crear un grupo privado eligiendo alumnos específicos de su directorio (antes solo podía crear conversaciones individuales o de materia completa); permanece como moderador por ser quien lo crea
- **Menú lateral** (`navigation.ts`, los 3 roles): se agregaron "Cursos y Certificaciones", "Biblioteca" y "Producto de Titulación" junto a "Materias" — el resto de las secciones ya existentes se conserva íntegro
- Componente `Checkbox` (`components/ui/checkbox.tsx`) agregado siguiendo el mismo patrón que `Switch` — usado para seleccionar alumnos al crear un grupo privado

### Cambiado

- `types/evaluation.ts`: `StudentEvaluation`/`StudentEvaluationDetail` ganan `rubricA`, `rubricB`, `observations`, `attempts`, `evaluatedByName`, `bonus`, `finalPercentage`, `finalLetter` (todos opcionales, no rompe evaluaciones ya sembradas sin esos campos)
- `mocks/evaluations.ts`: `recordEvaluation` acepta un parámetro `extra` opcional con las puntuaciones de Rúbrica A/B; sin ese parámetro se comporta exactamente igual que antes (usado por la edición del Administrador, Sprint 13)
- `services/evaluation.service.ts`: `recordEvaluationAsync` gana parámetros `actor`/`extra` opcionales y ahora audita cada guardado del profesor (antes solo auditaba la edición del Administrador)
- `services/gamification.service.ts`: `recordPointMovementAsync` gana un parámetro `actor` opcional y audita el movimiento cuando se provee
- `core/events/listeners/LeaderboardListener.ts`: además de `POINTS_GRANTED`/`POINTS_REMOVED`, ahora también recalcula y notifica ante `REPORT_SUBMITTED` y `GRADE_UPDATED` (publicada) — el ranking siempre se deriva en vivo, esto solo amplía cuándo se notifica el cambio
- `mocks/gamification.ts`: la acción del catálogo `empresa_nueva` se relabeló a "Convenio" para alinear la terminología oficial del Modelo Educativo (el id interno no cambió, para no romper los movimientos ya sembrados)
- `types/subject.ts`: `Activity` gana `openDate`/`isHidden`; `MockAttachment.kind` se amplía con `audio`/`video`/`enlace`; `Material` gana `description`/`category`/`tags`/`isHidden`/`scheduledAt`
- `types/audit.ts`: `AuditModule` gana `'Producto de Titulación'`

### Notas

- La escala de 8 niveles de Evaluaciones por competencia (RN-005/ADR-007, A+ a F por competencia individual) **no se modificó**: la Rúbrica A/B reconstruida convive con ella como una segunda capa de calificación (el % final oficial de la evaluación), igual que Reportes ya convive con Evaluaciones desde ADR-008. Ver ADR-011 en `DECISIONS.md`
- "Cursos y Certificaciones" y "Biblioteca" para Profesor/Administrador muestran el mismo catálogo institucional que el Alumno en modo solo lectura — el mock del MVP no modela inscripciones por alumno individuales, así que no existe todavía una vista "mis cursos" distinta por cada profesor/administrador
- El Producto de Titulación calcula el avance como fases aprobadas / total de fases; los entregables pueden enlazar evidencia de otros módulos (`TitulacionEvidenceRef`) pero el sprint no implementó cálculo automático de avance a partir de reportes/evaluaciones reales — se documenta como alcance deliberadamente reducido, igual que Sprint 16 con el mismo módulo
- No se modificó autenticación, backend, ni se eliminó ningún componente o funcionalidad existente, por instrucción explícita del sprint

---

## v1.14.0

Fecha

2026-08-03

Release

1.11.0 — Perfil Alumno (UX Final del MVP)

Sprint

Sprint 16 — Perfil Alumno (UX Final del MVP)

Alcance

Se completaron las funcionalidades pendientes del perfil Alumno y se dejó listo para la demostración del MVP: flujo completo de entrega de actividades, restricción de Comunicación a roles institucionales con solicitud de grupo mediada por el profesor, adjuntos en el Foro, dos módulos nuevos (Cursos Asignados/Certificaciones y Producto de Titulación) y una Biblioteca/Recursos de solo lectura para el alumno. Todo se integró sin modificar diseño, Sidebar/`navigation.ts`, componentes existentes ni lógica de otros perfiles — únicamente se amplió lo ya construido.

### Agregado

- **Materias — detalle de actividad** (`/alumno/materias/:subjectId/actividades/:activityId`, nueva página `StudentActivityDetailPage`): título, descripción, instrucciones, fecha de entrega, profesor, porcentaje de evaluación, rúbrica, archivos del profesor y material complementario de la materia; el alumno sube/reemplaza archivos, agrega comentario de entrega y envía — con confirmación visible y detección de entrega fuera de tiempo. Una vez evaluada la entrega (motivo/percentage/feedback/insignias/observaciones capturados por el profesor) queda bloqueada para edición y muestra retroalimentación, porcentaje, insignias obtenidas, observaciones e historial de entregas previas
- **Comunicación — contactos institucionales** (`chat.service.ts`): el alumno ahora ve 5 contactos institucionales (Área Académica, Sistemas, Control Escolar, Finanzas, Soporte) además de su profesor — todos resuelven a la única cuenta demo de Administración, diferenciados solo por `subtitle`; el alumno nunca ve a otros alumnos en su directorio
- **Comunicación — Solicitar grupo de conversación**: nuevo botón para el alumno (`RequestGroupSheet`) que envía una solicitud al profesor con materia y motivo; el profesor la ve en un panel nuevo (`GroupRequestsSheet`) y puede **aceptar** (elige compañeros de su roster y crea el grupo, quedando como moderador) o **rechazar** — nueva infraestructura: `GroupConversationRequest` (tipos/mocks/servicio) y eventos `GROUP_REQUEST_CREATED`/`GROUP_REQUEST_RESOLVED` con notificación para ambas partes
- **Foro — adjuntos**: las publicaciones aceptan imágenes, PDF, Word, Excel, PowerPoint, ZIP, video o enlace (`PostForm` + `ForumAttachmentPicker`); comentarios y respuestas solo aceptan imágenes (`CommentForm`) — tipo propio `ForumAttachmentKind` (no se extendió `AttachmentKind` de Chat, que no maneja video/enlace)
- **Cursos Asignados** (`/alumno/cursos`, módulo nuevo): cursos activos y finalizados con progreso, fechas de inicio/límite; al marcar un curso como completado aparece automáticamente en Certificaciones
- **Certificaciones** (`/alumno/certificaciones`, módulo nuevo): se derivan en vivo de los cursos finalizados — certificado, fecha de emisión, estatus y botón "Descargar certificado" (HTML imprimible, mismo criterio que "Exportar PDF" del resto de la plataforma)
- **Producto de Titulación** (`/alumno/titulacion`, módulo nuevo, placeholder funcional): porcentaje de avance general, fases con sus entregables (estado y fecha), observaciones del asesor — estructura lista para que reportes semanales/evaluaciones/entregables la alimenten automáticamente en una futura integración; sin automatización todavía
- **Biblioteca / Recursos del Alumno** (`/alumno/biblioteca`, nueva página de solo lectura): reutiliza `library.service.ts` (Biblioteca Institucional, Sprint 13) — buscar, filtrar, descargar y vista previa, sin subir/editar/eliminar; sección propia "Clases grabadas" con materia, profesor, fecha, duración y botón "Reproducir"
- Accesos rápidos nuevos en el Dashboard del Alumno (`QuickAccessGrid`, mismo componente reutilizado del Centro de Control del Administrador) hacia Cursos Asignados, Certificaciones, Producto de Titulación y Biblioteca/Recursos — aditivo, no toca Sidebar/`navigation.ts`

### Cambiado

- `types/subject.ts`: `Activity` gana `instructions`, `weightPercentage`, `rubric` (opcionales); nuevo `ActivitySubmission`/`ActivitySubmissionInput`/`SubmissionVersion`; `mocks/subjects.ts` gana el store de entregas y `subject.service.ts` gana `submitActivityAsync`/`getActivitySubmissionAsync`
- `components/ActivityList.tsx`: gana prop opcional `onSelect` para navegar al detalle (uso del alumno); no afecta el uso existente con `onEdit`/`onDelete` (Profesor)
- `types/library.ts`: `LIBRARY_CATEGORIES` gana 7 categorías nuevas (Reglamentos, Manuales, Recursos Institucionales, Casos de estudio, Plantillas, Clases grabadas, Material complementario) de forma aditiva; `LibraryDocument`/`LibraryDocumentInput` ganan `durationMinutes` opcional
- `core/events/EventTypes.ts`: eventos nuevos `ACTIVITY_SUBMITTED`, `ACTIVITY_EVALUATED`, `GROUP_REQUEST_CREATED`, `GROUP_REQUEST_RESOLVED`; `types/notification.ts` gana los tipos `entrega_recibida`, `entrega_evaluada`, `solicitud_grupo`, `solicitud_grupo_resuelta` (reutilizan íconos ya existentes)
- `components/ui/checkbox.tsx` agregado (mismo patrón shadcn/radix-ui que `switch.tsx`) — usado por `GroupRequestsSheet` para elegir compañeros al aceptar una solicitud de grupo

### Notas

- El "Marcar como completado" de Cursos Asignados es una acción de autoservicio del alumno (no hay contraparte de administración de cursos en este MVP) pensada para poder demostrar en vivo que Certificaciones se actualiza automáticamente
- La entrega de actividades se bloquea para edición solo cuando el profesor la evalúa (no existe todavía una pantalla de evaluación de entregas para el Profesor en este sprint, fuera de alcance por instrucción explícita de trabajar únicamente el perfil Alumno); se sembró una entrega ya evaluada (`act-102`) para poder mostrar ese estado en la demo
- No se modificó Sidebar, Navbar, tema, diseño general ni ningún componente/ruta de los perfiles Profesor o Administrador, por instrucción explícita del sprint

---

## v1.13.0

Fecha

2026-07-30

Release

1.10.0 — Centro de Control Administrativo

Sprint

Sprint 13 — Centro de Control Administrativo

Alcance

Se convirtió el panel del Administrador en un Centro de Control completo de la universidad: 13 módulos nuevos o ampliados (Dashboard Ejecutivo, Carreras, Materias, Grupos, Usuarios, Centro de Reportes, Centro de Evaluaciones, Administración del Leaderboard, Centro de Notificaciones, Biblioteca Institucional, Configuración Institucional, Auditoría, Respaldos), todos integrados sin modificar Sidebar, Navbar, colores, tema, responsive, dark mode ni ningún componente o ruta ya existente. Varias rutas del Administrador (`/admin/usuarios`, `/admin/profesores`, `/admin/alumnos`, `/admin/grupos`, `/admin/carreras`) ya existían apuntando a un `PlaceholderPage` genérico — este sprint las reemplaza por módulos reales sin tocar la navegación que ya las exponía.

### Agregado

- **Auditoría transversal** (`services/audit.service.ts`, `mocks/audit.ts`, `/admin/auditoria`): toda acción administrativa de este sprint queda registrada automáticamente (usuario, rol, fecha/hora, módulo, acción, valor anterior/nuevo, IP simulada, dispositivo) — ninguna mutación de los módulos nuevos ocurre sin su entrada correspondiente
- **Dashboard Ejecutivo**: los 4 KPIs existentes se ampliaron a 18, todos calculados en vivo componiendo los módulos de este sprint (alumnos/profesores/administradores/carreras/materias/grupos reales, reportes entregados/pendientes, evaluaciones publicadas, promedio institucional, usuarios activos, nuevos registros, publicaciones/comentarios del foro, insignias y puntos otorgados, alumnos Élite, estado del sistema) — misma `KpiGrid`/`StatCard` de siempre, sin rediseño
- **Gestión de Carreras** (`/admin/carreras`): crear, editar, activar/desactivar, eliminar (con confirmación); cada carrera muestra alumnos/materias/profesores
- **Gestión de Materias** ampliada (`/admin/materias`, antes solo lectura): crear, editar, asignar/cambiar profesor, activar/desactivar, eliminar; cada materia gana carrera, cuatrimestre y profesor titular
- **Gestión de Grupos** (`/admin/grupos`, entidad nueva): crear, editar, cerrar/reabrir, cambiar profesor, mover alumnos entre grupos, ver capacidad/ocupación
- **Administración de Usuarios** (`/admin/usuarios`, `/admin/profesores`, `/admin/alumnos` — mismas 3 rutas ya existentes, ahora un solo componente con pestañas Alumnos/Profesores/Administradores): buscar, filtrar, editar, bloquear/desbloquear, activar/desactivar, restablecer contraseña, ver historial, cambiar grupo/carrera/materias/rol — nunca elimina físicamente, solo desactiva/bloquea
- **Centro de Reportes** (`/admin/reportes`): todos los reportes del sistema con filtros (carrera/materia/profesor/semana/estado), abrir/descargar PDF/aprobar/rechazar/devolver, exportar Excel
- **Centro de Evaluaciones** ampliado (`/admin/evaluaciones`): edición de cualquier evaluación con motivo obligatorio, siempre auditada (profesor/administrador, valor anterior, valor nuevo, fecha, motivo) — nunca elimina evaluaciones
- **Administración del Leaderboard** (`/admin/leaderboard`, pestaña "Administrar" nueva): recalcular ranking, reiniciar temporada, asignar/restar puntos, otorgar/quitar insignias manualmente, ver historial completo, exportar ranking — no modifica el algoritmo de cálculo existente, solo lo administra
- **Centro de Notificaciones** ampliado (`/admin/notificaciones`): difusión por audiencia (todos/carrera/grupo/profesor/alumno/rol) con borradores/programadas/enviadas/archivadas — reutiliza el Event Bus del Sprint Event Bus (`NOTICE_SENT`), nunca llama a `notification.service.ts` directamente
- **Biblioteca Institucional** (`/admin/biblioteca`): documentos organizados por carrera/materia/profesor/categoría, subir/editar/mover/eliminar/descargar/vista previa; reutiliza la clasificación de archivos ya construida en Chat (`AttachmentKind`)
- **Configuración Institucional** (`/admin/institucion`, ruta nueva — no toca `/admin/configuracion`, ajustes de cuenta compartidos): nombre, logotipo, color institucional, periodo/ciclo, escala de evaluación, Leaderboard/Badges, plantillas PDF/correo, variables institucionales
- **Respaldos** (`/admin/backups`): exportar JSON/Excel(CSV)/Base de Datos, importar (valida el archivo) y simular restauración — sin servidores externos
- Componente `Switch` (`components/ui/switch.tsx`) agregado siguiendo el mismo patrón shadcn/radix-ui del resto de la UI — no existía un primitivo de interruptor en el proyecto

### Cambiado

- `types/subject.ts`: `AdminSubjectListItem` gana campos opcionales (`careerId`, `careerName`, `term`, `professorId`, `professorName`, `isActive`); `mocks/subjects.ts` pasa `ADMIN_SUBJECTS` de constante a variable con CRUD completo
- `types/admin.ts`: `AdminKpis` ampliado de 4 a 18 campos; `admin.service.ts` pasa de leer un bloque fijo sembrado a calcular los KPIs en vivo
- `core/events/EventTypes.ts`: `NoticeSentPayload.scope` gana `'todos' | 'carrera' | 'profesor' | 'rol'` (additivo, no cambia el manejo ya existente de `'alumno' | 'grupo' | 'materia'`); `NotificationListener` resuelve destinatarios según el nuevo alcance
- `mocks/gamification.ts`, `mocks/evaluations.ts`: nuevas funciones de administración (reiniciar temporada, otorgar/quitar insignia manual, historial completo de movimientos) — no cambian `buildLeaderboard` ni la fórmula de cálculo
- `components/LeaderboardTable.tsx`: gana props opcionales `currentUserId`/`currentUserRole` reutilizadas también por el nuevo panel "Administrar" del Leaderboard (sin pasarlas, se comporta igual que antes)
- `features/dashboard-admin/admin-sections.ts`: nuevas entradas (Grupos, Carreras, Centro de Reportes, Leaderboard, Centro de Notificaciones, Biblioteca, Configuración Institucional, Auditoría, Respaldos) — misma fuente única que ya alimentaba Accesos Rápidos del Dashboard; Sidebar/`navigation.ts` no se tocaron

### Notas

- El "color principal" de Configuración Institucional es un dato administrable (se guarda) pero deliberadamente **no** se aplica al tema visual real — la Parte 14 del mismo sprint prohíbe modificar el diseño/tema existente
- Administración de Usuarios usa un store propio (`mocks/userManagement.ts`), independiente de las 3 cuentas reales de login (`mocks/users.ts`) — mismo criterio de "datos duplicados por feature" ya documentado en sprints anteriores
- No se modificó ROADMAP ni PRD, por instrucción explícita del sprint; se actualizó únicamente CHANGELOG.md y TDD-v1.md

---

## v1.12.0

Fecha

2026-07-30

Release

1.9.0 — Centro de Comunicación Institucional (Chat)

Sprint

Sprint 12 — Centro de Comunicación Institucional

Alcance

Se agregó un módulo de mensajería académica institucional (no social) integrado a la arquitectura de eventos existente: conversaciones individuales, por materia e institucionales, mensajes con adjuntos/reacciones/respuestas/edición, archivos compartidos y puntos de entrada contextuales desde Evaluaciones, Reportes, Foro y Leaderboard. No se modificó Dashboard, layout, colores ni ningún componente existente más allá de una entrada nueva en la navegación del Sidebar (dato, no el componente) — mismo criterio ya usado para la campana de Notificaciones.

### Agregado

- **Centro de Comunicación** (`/comunicacion`, nueva sección "Comunicación" en el Sidebar de los 3 roles): lista de conversaciones con buscador, filtros (No leídas/Favoritas/Archivadas), panel de conversación, panel de "Archivos compartidos" y panel de "Información" (participantes, tipo, contexto de origen)
- Conversaciones individuales, por materia y de tipo institucional, con permisos validados por rol en `chat.service.ts` (Alumno: solo su profesor y administración; Profesor: alumnos de sus materias, materias completas y administración; Administrador: cualquier alumno o profesor, además de fijar/cerrar/eliminar conversaciones)
- Mensajes con texto, adjuntos simulados (imagen/PDF/Word/Excel/PowerPoint/ZIP/audio/enlace), responder, editar (ventana de 5 minutos), eliminar (borrado suave) y reacciones (👍❤️👏🎉)
- Estado de mensaje calculado (enviado/entregado/leído) y contador de no leídos por conversación
- **Conversaciones con contexto** (mejora adicional): cualquier conversación puede anclarse a una Evaluación, un Reporte, una Materia o una publicación del Foro (`contextType`/`contextId`/`contextLabel`), con un botón "Ver origen" cuando la ruta es resoluble para el rol
- **Borradores persistentes** (mejora adicional): el texto que se está escribiendo se guarda en `localStorage` y sobrevive a un cambio de conversación o a recargar la página
- `OpenChatButton`, componente reutilizable que implementa los 6 puntos de entrada pedidos: "Iniciar conversación" (roster de Evaluaciones del Profesor), "Enviar mensaje" (Materia del Alumno), "Solicitar aclaración" (Evaluación del Alumno), "Comentar reporte" (Reporte del Alumno y del Profesor), "Contactar autor" (Foro) y "Felicitar" (Top 3 del Leaderboard, Profesor/Administrador)
- Event Bus (Sprint Event Bus) extendido con 13 eventos de Chat: `MESSAGE_SENT/EDITED/DELETED/READ`, `CONVERSATION_CREATED/ARCHIVED/PINNED`, `FILE_SHARED`, `IMAGE_SHARED`, `AUDIO_SHARED`, `DOCUMENT_SHARED`, `REACTION_ADDED/REMOVED`
- `ChatListener` (bitácora de mensajes de la sesión, punto de extensión para tiempo real futuro), y `NotificationListener` extendido: cada mensaje nuevo genera automáticamente una notificación (`nuevo_mensaje`, nueva categoría "Mensajes") — nunca se llama a `notification.service.ts` directamente, siempre a través del Event Bus
- Modelos `Conversation`, `ConversationMember`, `Message`, `Attachment`, `Reaction` (`mocks/chat.ts`, estado en memoria) y API REST-like completa en `chat.service.ts` (`GET/POST/PATCH/DELETE /conversations`, `GET/POST/PATCH/DELETE /messages`, `POST/GET /attachments`, `POST/DELETE /reactions`)

### Cambiado

- `routes/navigation.ts`: entrada "Comunicación" en los 3 roles
- `LeaderboardTable` gana props opcionales `currentUserId`/`currentUserRole` para el botón "Felicitar" del Top 3 (sin pasarlas, se comporta igual que antes — la vista del Alumno no las pasa)
- `types/notification.ts`: nueva categoría `mensajeria` y tipo `nuevo_mensaje`

### Notas

- Arquitectura preparada (Parte 16) para Videollamadas/Llamadas/Compartir pantalla/Grabaciones/Transcripción IA/ChatBot IA/Correo/WhatsApp/Teams/Slack sin rediseño: cada integración futura es un listener nuevo en `core/events/listeners/`, igual que `AnalyticsListener` ya lo es para auditoría
- Se detectó y corrigió un bug real durante la verificación manual: crear una conversación de "Materia completa" con muchos alumnos resolvía el directorio de contactos una vez por participante (secuencial, con `await` dentro de un `for`), causando varios segundos de espera — ver TDD-v1.md
- No se modificó ROADMAP ni PRD, por instrucción explícita del sprint; se actualizó únicamente CHANGELOG.md y TDD-v1.md

---

## v1.11.0

Fecha

2026-07-29

Release

1.8.0 — Centro de Notificaciones + Arquitectura Event Bus

Sprint

Sprint Event Bus — Centro de Notificaciones + Arquitectura orientada a eventos

Alcance

Se agregó una arquitectura de eventos (Event Bus) transversal a toda la plataforma y un Centro de Notificaciones global (campana en el Header, bandeja lateral). Todos los módulos existentes (Reportes, Evaluaciones, Foro, Gamificación, Materias, Avisos, Autenticación) ahora emiten eventos de dominio desde su capa de servicios; ningún módulo crea notificaciones directamente. No se modificó Sidebar, layout, navegación ni diseño visual — el único cambio en un componente compartido es la campana en `Header.tsx`, nombrada explícitamente como excepción en el requerimiento del sprint.

### Agregado

- **Event Bus** (`src/core/events`): `EventEmitter` genérico (`subscribe`/`unsubscribe`/`once`/`emit`, aísla errores de listener), `eventBus` tipado a `AppEventMap` (26 tipos de evento) y `emitAppEvent()` (agrega `occurredAt` automáticamente)
- **Centro de Notificaciones global** (`src/features/notifications`): campana en el Header (contador de no leídas, oculta en 0, vibra brevemente al llegar una nueva), bandeja lateral (`Sheet`) agrupada por Hoy/Ayer/Esta semana/Más antiguas, con búsqueda, filtros por categoría (Académicas/Foro/Administración/Gamificación/Sistema/No leídas) y acciones (Abrir con deep-link, Marcar como leída, Eliminar, Marcar todas como leídas, Eliminar todas las leídas)
- Modelo `Notification` y store en memoria (`mocks/notifications.ts`, sin datos sembrados) + `notification.service.ts` (API REST-like: `GET/POST/PATCH/DELETE`)
- 4 listeners desacoplados (`core/events/listeners`): `NotificationListener` (único que crea notificaciones), `LeaderboardListener` (recalcula el ranking tras un movimiento de puntos y emite `LEADERBOARD_UPDATED`), `BadgeListener` (bitácora de insignias otorgadas en la sesión), `AnalyticsListener` (bitácora de 18 eventos de negocio, preparado para un proveedor real de analítica/auditoría)
- Todos los módulos existentes emiten sus eventos correspondientes al completar una acción: `REPORT_SUBMITTED`/`REPORT_APPROVED`/`REPORT_REJECTED` (Reportes), `GRADE_UPDATED`/`BADGE_GRANTED` (Evaluaciones), `FORUM_POST_CREATED`/`FORUM_COMMENT_CREATED`/`FORUM_REPLY_CREATED`/`FORUM_POST_REPORTED`/`FORUM_COMMENT_REPORTED`/`ADMIN_WARNING_SENT` (Foro), `POINTS_GRANTED`/`POINTS_REMOVED` (Gamificación), `ACTIVITY_CREATED`/`MATERIAL_CREATED` (Materias), `NOTICE_SENT` (Avisos), `USER_LOGIN`/`USER_LOGOUT` (Autenticación)

### Cambiado

- `Header.tsx`: agrega `NotificationBell` junto al menú de usuario, solo cuando hay sesión activa
- `App.tsx`: envuelve la app en `NotificationProvider` y registra los listeners al arrancar (`registerAllListeners()`)
- `createActivityAsync`/`createMaterialAsync` (`subject.service.ts`) ganan un tercer parámetro `createdByName`, requerido para el texto de la notificación; `ActivityFormPage`/`MaterialFormPage` lo toman de `useAuth()`

### Notas

- `GRADE_CREATED`, `GRADE_DELETED`, `BADGE_REVOKED`, `NOTICE_CREATED`, `NOTICE_UPDATED`, `USER_REGISTERED`, `ADMIN_SUSPENSION` y `PROFILE_UPDATED` están definidos en `AppEventMap` con su listener preparado, pero ningún flujo actual los emite (no existe esa pantalla/acción todavía) — ver detalle en TDD-v1.md
- Las notificaciones internas del Foro (Sprint 13.1, `ForumNotification`, `/foro/notificaciones`) se mantienen sin cambios y conviven con el Centro global: un comentario nuevo hoy genera ambas notificaciones — ver TDD-v1.md
- No se modificó ROADMAP ni PRD, por instrucción explícita del sprint; se actualizó únicamente CHANGELOG.md y TDD-v1.md

---

## v1.10.0

Fecha

2026-07-29

Release

1.7.0 — Moderación del Foro

Sprint

Sprint 13.2 — Moderación del Foro

Alcance

Se extendió el módulo Foro y el Panel de Administración (nueva sección "Centro de Moderación") para implementar un sistema de moderación MVP: reportes, permisos diferenciados por rol, advertencias y notificaciones de moderación. No se modificó navegación, autenticación ni el diseño general. No se implementan suspensiones/bloqueos — solo se preparó la arquitectura para una versión futura.

### Agregado

- Botón "Reportar" en publicaciones y comentarios/respuestas (Alumno y Profesor), con catálogo cerrado de 7 motivos (Spam, Lenguaje ofensivo, Acoso, Contenido inapropiado, Información falsa, Plagio, Otro); "Otro" exige descripción
- Profesor: "Fijar"/"Desfijar" publicación (aparece primero en el listado) y "Cerrar"/"Reabrir" discusión académica (bloquea comentarios y respuestas nuevas mientras está cerrada)
- Administrador ("moderación total"): eliminar publicación/comentario (borrado suave, restaurable), restaurar contenido, revisar y resolver reportes (Ignorar/Marcar como resuelto), enviar advertencias
- **Centro de Moderación** (`/admin/moderacion`, nueva tarjeta de acceso rápido en el Panel de Administración): Reportes pendientes, Reportes resueltos, Historial de moderación (con "Restaurar" sobre eliminaciones no restauradas todavía) y Usuarios con advertencias
- Notificaciones internas nuevas (reutilizando el sistema del Sprint 13.1): al reportante cuando su reporte se resuelve/ignora/deriva en una acción, y al usuario sancionado cuando recibe una advertencia o le eliminan contenido
- `UserModerationStatus` — arquitectura preparada para suspensiones/bloqueos en una versión futura (`isSuspended`, `suspendedUntil`); este sprint nunca los aplica, solo cuenta advertencias

### Cambiado

- El feed del Foro ordena las publicaciones fijadas primero y excluye las eliminadas; `ForumPostCard` muestra distintivos "Fijada"/"Cerrada"
- `CommentThread` agrega los controles de Reportar (Alumno/Profesor) y Eliminar (Administrador); el contenido eliminado se muestra como "[Contenido eliminado por moderación]" en vez de desaparecer
- `ForumPost`/`ForumComment`/`ForumReply` ganaron campos de moderación (`isPinned`, `isClosed`, `isDeleted` y metadatos de quién/cuándo)

### Notas

- Permisos por rol de este sprint (Alumno: reportar, no elimina contenido ajeno; Profesor: todo lo anterior + destacar + fijar + cerrar, no elimina ni sanciona; Administrador: moderación total) son permanentes — ver ADR-010
- No se modificó el módulo de Reportes académicos (motor de plantillas) ni Evaluaciones/Gamificación
- No se modificó ROADMAP ni PRD, por instrucción explícita del sprint

---

## v1.9.0

Fecha

2026-07-29

Release

1.6.0 — Hilos de Discusión del Foro

Sprint

Sprint 13.1 — Hilos de Discusión del Foro

Alcance

Se extendió únicamente el módulo Foro para convertirlo en un sistema real de discusión: comentar, responder (1 nivel de anidación), reaccionar, destacar respuestas y notificaciones internas. No se modificó diseño general, navegación, autenticación ni ningún otro módulo.

### Agregado

- Crear comentarios y responder comentarios directamente desde `ForumPostDetailPage` (`CommentForm`), con el contador "Comentarios (N)" actualizándose automáticamente sin recargar la página
- Reacciones fijas (👍 ❤️ 💡) en cada comentario y respuesta (`ReactionBar`), con conteo y resaltado de la reacción propia; alternan al hacer clic
- "Respuesta destacada": Profesor y Administrador pueden marcar cualquier comentario o respuesta (`FeaturedAnswerBadge` como distintivo visual). Al marcarla se registra un `FeaturedAnswerEvent` (postId, autor, quién la marcó, `pendingPoints: 15`) — preparado para conectar el Leaderboard en un sprint futuro (coincide con la acción "Respuesta foro" del catálogo de Gamificación); **no se aplican puntos todavía**, por instrucción explícita del sprint
- Notificaciones internas del Foro (`/foro/notificaciones`, dentro del propio módulo): "respondieron tu publicación", "respondieron tu comentario" y "te mencionaron" (detección simple de `@Nombre` en el contenido). Indicador de no leídas junto al botón "Notificaciones" en el listado del Foro
- `ForumComment`/`ForumReply` ganaron `reactions`, `isFeatured`, `featuredByName`, `featuredAt`

### Cambiado

- `CommentThread` ahora es interactivo (antes solo mostraba comentarios/respuestas de lectura): agrega Responder, Reacciones y el control de destacado (visible solo para Profesor/Administrador)
- `getForumPost`/`useForumPost` reciben `viewerId` para resolver qué reacciones pertenecen al usuario en sesión

### Notas

- Compatibilidad completa: las publicaciones, comentarios y respuestas sembrados antes de este sprint siguen funcionando igual; los campos nuevos son parte del mismo tipo (`reactions: []`, `isFeatured: false` por defecto)
- No se tocó ningún otro módulo (Reportes, Evaluaciones, Gamificación, Dashboards) ni la navegación/sidebar — la página de notificaciones es una ruta nueva dentro del grupo de rutas transversal del Foro, alcanzable solo desde el propio Foro

---

## v1.8.0

Fecha

2026-07-29

Release

1.5.0 — Leaderboard y Gamificación

Sprint

Sprint Leaderboard y Gamificación

Alcance

Se integró un sistema de puntos, insignias automáticas y Leaderboard como consecuencia directa del flujo de Evaluaciones ya existente (Profesor evalúa % → asigna badges → registra movimientos de puntos). No es un módulo independiente ni reemplaza funcionalidad existente: se integró sobre la arquitectura actual. No se modificó navegación, layouts, Dashboard existente, autenticación ni Reportes; Evaluaciones solo se extendió (nunca se modificó su comportamiento previo).

### Agregado

- Motor de Gamificación (`@/types/gamification`, `mocks/gamification.ts`, `services/gamification.service.ts`): catálogo cerrado de 9 acciones de puntos (el profesor solo selecciona, nunca escribe un número), movimientos de puntos por alumno, y cálculo automático de puntos totales, bonificación académica, estado del alumno e insignias automáticas
- `ManagePointsPage` (Profesor, `/profesor/puntos`) — Gestión de Puntos: selecciona materia y alumno, elige una acción del catálogo cerrado (`PointCatalogPicker`, tarjetas seleccionables, sin input numérico) y registra el movimiento; muestra el historial del alumno
- Leaderboard, una página por rol reutilizando `LeaderboardTable` (Top 3 + ranking completo con movimiento ▲▼=, carrera, cuatrimestre, puntos, bonificación, badges, avance del producto de titulación y estado):
  - `StudentLeaderboardPage` (`/alumno/leaderboard`) — ranking de su materia, con su propia fila resaltada
  - `ProfessorLeaderboardPage` (`/profesor/leaderboard`) — ranking por materia, con selector
  - `AdminLeaderboardPage` (`/admin/leaderboard`) — ranking global (todas las materias) con estadísticas institucionales
- Widgets de Gamificación agregados (aditivos, sin tocar ningún widget existente) al final de cada Dashboard:
  - Alumno: `GamificationCard` (Mi Ranking, Mis puntos, Bonificación, Badges, Actividad reciente)
  - Profesor: `GroupLeaderboardCard` (mini leaderboard del grupo, actividad reciente, accesos rápidos a Puntos y al Leaderboard completo)
  - Administrador: `GlobalLeaderboardCard` (mini leaderboard global, estadísticas de carreras/badges/puntos/participación)
- 2 insignias manuales nuevas al catálogo global de badges (`Experto`, `Pensador`) y 6 insignias automáticas (`Iniciador`, `Consultor`, `Campeón`, `Racha Oro`, `Colaborador`, `Nivel Élite`) que el sistema calcula solas — el profesor nunca las asigna
- `StudentEvaluation` ganó campos opcionales (`career`, `term`, `titulacionProgress`) poblados en el roster del Profesor, y `Badge` ganó `awardType: 'manual' | 'automatic'` — ambos extienden Evaluaciones sin modificar su comportamiento previo

### Cambiado

- `ProfessorEvaluateStudentPage` (Evaluaciones): la sección "Asignar Insignias" ahora excluye las 6 insignias automáticas (solo se muestran las manuales); se agregó un botón "Registrar puntos" que enlaza a Gestión de Puntos para el alumno en curso. El resto del flujo (competencias, retroalimentación, publicar/borrador) no cambió

### Notas

- Sin acceso desde el sidebar a propósito: el sprint pidió no modificar navegación, así que Leaderboard y Gestión de Puntos son rutas nuevas (`AppRouter.tsx`) alcanzables únicamente desde los widgets nuevos de cada Dashboard — `navigation.ts` y los componentes de layout no se tocaron. Ver ADR-009
- Reglas de MVP diseñadas para este sprint (bonificación académica, estado del alumno, insignias automáticas, movimiento de ranking ▲▼=): no se especificaron en el requerimiento; se documentan en TDD y en ADR-009
- El módulo de Reportes (motor de plantillas, Evaluación Docente con rúbricas) no se tocó en absoluto, por instrucción explícita del sprint
- No se modificó el PRD ni el ROADMAP, por instrucción explícita del sprint

---

## v1.7.0

Fecha

2026-07-29

Release

1.4.0 — Motor de Reportes Académicos

Sprint

Sprint 12 — Motor de Reportes Académicos

Alcance

Se reemplazó el formulario simple de Reportes Semanales (una materia + semana libre + texto único) por un motor dinámico de 7 plantillas académicas (R01-R07), una por carrera, con preguntas por semana, adjuntos tipados y evaluación docente basada en rúbricas con cálculo automático de porcentaje y letra. No se modificó navegación, rutas, sidebar, dashboard, login, autenticación, diseño ni layout — solo la lógica interna del módulo de Reportes.

### Agregado

- Motor de plantillas académicas (`@/types/reportTemplate`, `mocks/reportTemplates.ts`): 7 plantillas (R01 Administración/Negocios, R02 Ingeniería en Sistemas, R03 Derecho, R04 Pedagogía, R05 Psicología, R06 Contaduría Pública, R07 Mercadotecnia), cada una define carrera(s), producto de titulación, campos específicos, preguntas por semana (1-4), si exige anonimización y si exige adjuntos. El formulario se renderiza automáticamente desde esta definición, sin condicionales por carrera
- `ReportTemplateForm` (Alumno) — formulario dinámico: selecciona materia → resuelve plantilla → muestra únicamente la semana elegida (1-4), campos específicos, preguntas de esa semana, integración obligatoria al producto de titulación, confirmación de anonimización (Derecho/Psicología) y adjuntos
- Adjuntos tipados: archivos PDF, DOCX, XLSX, PPTX, JPG, PNG, ZIP (mock, solo nombre) y enlaces a GitHub, Google Drive, Canva, Figma o YouTube, con validación de dominio por plataforma (`@/utils/reportAttachments`)
- Bloque "Evaluación Docente" (Profesor, `EvaluationForm` reescrito): Rúbrica A (70%) + Rúbrica B (30%) + bonificación → porcentaje final y letra calculados automáticamente (nunca por el profesor), insignias múltiples (reutiliza `BadgeList`), retroalimentación, Aprobar/Solicitar corrección
- Escala de 5 niveles exclusiva de Reportes (A/B/C/D/F, `@/utils/reportGrade`) — independiente de la escala de 8 niveles de Evaluaciones (RN-005/ADR-007); ver ADR-008
- `ReportGradeBadge`, `ReportTemplateAnswers`, `WeeklyReportStatusBadge` (este último ya existía) — nuevos componentes reutilizables
- 4 materias de muestra (`sub-201`..`sub-204`) agregadas solo al catálogo de creación de reportes del alumno demo, para poder probar las 7 plantillas de punta a punta con la única cuenta de alumno disponible

### Cambiado

- `ReportContentCard` (compartido por Alumno y Profesor — el profesor ve exactamente el mismo formulario en modo lectura, como pedía el sprint): ahora renderiza campos y preguntas dinámicas cuando el reporte tiene `templateId`; los reportes previos al Sprint 12 (sin plantilla) siguen mostrando el párrafo libre legado, sin cambios
- `ReportEvaluationSummary`: muestra el desglose de rúbricas, porcentaje final e insignias cuando la evaluación los tiene; las evaluaciones previas (solo letra + observaciones) se siguen mostrando igual
- `CreateReportInput` y `EvaluateReportInput` (`@/types/report`) cambiaron de forma para capturar los datos del motor de plantillas y de la evaluación por rúbricas, respectivamente — contratos internos del módulo, sin consumidores fuera de Reportes
- `WeeklyReport` y `ReportEvaluation` ganaron campos opcionales (`templateId`, `answers`, `fieldValues`, `titulacionIntegration`, `links`, `anonymizationConfirmed`, `rubricA`, `rubricB`, `bonus`, `finalPercentage`, `badgeIds`) — los reportes y evaluaciones sembrados antes de este sprint no los tienen y siguen funcionando sin cambios

### Notas

- Cambio de decisión de producto (nueva escala de letras, distinta de RN-005): aprobado explícitamente por el Product Owner el 2026-07-29 tras detectarse la inconsistencia entre la escala pedida en este sprint (A/B/C/D/F) y la escala vigente de 8 niveles; ver ADR-008 y RN-009 en `docs/PRD-v1.md`
- El contenido específico de las 7 plantillas (preguntas, producto de titulación, campos por carrera) no fue proporcionado en el sprint; se diseñó contenido de ejemplo razonable, documentado como tal en `mocks/reportTemplates.ts`, fácilmente editable sin tocar el motor de renderizado
- Un registro sembrado (`rep-085`) tenía nivel `'B+'` (escala de 8 niveles); se remapeó a `'B'` porque `ReportGradeLevel` (escala de Reportes) no incluye niveles con "+"
- No se modificó el Generador de Matrículas, su Apps Script, la navegación, las rutas, el sidebar, el dashboard, el login, la autenticación ni el diseño general de la plataforma

---

## v1.6.0

Fecha

2026-07-29

Release

1.3.1 — Corrección del Flujo de Evaluaciones del Profesor

Alcance

Fix — Al seleccionar una materia en Evaluaciones, la aplicación redirigía al Dashboard del Profesor en lugar de mostrar a los alumnos de esa materia. Se implementó la página faltante y se completó el flujo materia → alumnos → evaluar.

### Agregado

- `ProfessorEvaluationSubjectStudentsPage` (`/profesor/evaluaciones/:subjectId`) — listado de alumnos asignados a una materia, con buscador y paginación; cada tarjeta muestra Nombre, Grupo, Empresa, Estado del reporte semanal y Estado de evaluación, con botón "Evaluar" que abre `/profesor/evaluaciones/:subjectId/:studentId`. Si la materia no tiene alumnos asignados, muestra el estado vacío "No existen alumnos asignados a esta materia." sin redirigir
- `WeeklyReportStatusBadge` — insignia de estado del reporte semanal (Aprobado/Pendiente/Correcciones/Sin reporte), reutilizable
- Cálculo automático de "Promedio general" en `ProfessorEvaluateStudentPage`: promedia los porcentajes de todas las competencias capturadas y lo convierte a letra con `percentageToLevel`, mostrado junto al detalle por competencia
- Campos `company` y `weeklyReportStatus` en `StudentEvaluation` (`@/types/evaluation`), poblados en el roster del Profesor
- Rosters completos de alumnos por materia del Profesor (antes solo 3 alumnos de muestra en Administración Estratégica): 28 en Administración Estratégica, 25 en Gestión del Talento, 30 en Sistemas de Información, generados de forma determinística en `mocks/evaluations.ts`

### Corregido

- **Bug crítico de navegación**: `ProfessorEvaluationsListPage` ya enlazaba a `/profesor/evaluaciones/:subjectId`, pero esa ruta no existía en `AppRouter`; al no matchear ninguna ruta, cualquier selección de materia caía en el catch-all (`*`) y redirigía al Dashboard del Profesor. Se agregó la ruta faltante con su página correspondiente
- `ProfessorEvaluateStudentPage`: el breadcrumb y el botón "Volver" regresaban directo al listado de materias (`/profesor/evaluaciones`); ahora regresan al listado de alumnos de la materia actual (`/profesor/evaluaciones/:subjectId`), y el breadcrumb incluye el nombre de la materia como paso intermedio

### Notas

- Los ids de evaluación/alumno generados usan bloques numéricos distintos por materia (100s, 200s, 300s) para evitar colisiones entre materias, ya que `recordEvaluation` busca por id en las tres listas del profesor
- No se modificó el Generador de Matrículas, su Apps Script, ni el diseño general de la plataforma

---

## v1.5.0

Fecha

2026-07-29

Release

1.3.0 — Demo Funcional del Módulo Profesor

Alcance

Sprint Demo Profesor — Gestión de Actividades y Materiales, rediseño de Evaluaciones (captura por porcentaje + retroalimentación con estados), Insignias con previsualización, Avisos, y eliminación de acciones "Pendiente"/"En construcción" en el rol Profesor

### Agregado

- Gestión de Actividades (Profesor): crear, editar y eliminar actividades de una materia, con fecha límite, descripción y adjuntos de archivo/imagen (mock, solo nombre de archivo capturado)
- Gestión de Materiales (Profesor): crear y eliminar materiales de una materia; tipos soportados PDF, Word, Excel, PowerPoint, imagen, video y enlace; listado agrupado por materia
- Avisos (Profesor), feature nueva `avisos-profesor`: crear avisos dirigidos a un alumno, un grupo o una materia completa, con adjuntos (mock) e historial de avisos enviados; un aviso dirigido a una materia también aparece en la vista de esa materia para el alumno
- `MockFileInput` — input de archivo real oculto + botón disparador con estilo propio; captura solo el nombre del archivo, no sube nada (primer patrón de adjuntos mock del proyecto)
- `EvaluationStatusBadge` — badge de estado de evaluación (Borrador/Pendiente/Publicada)
- `src/utils/grade.ts` — `percentageToLevel()`, conversión pura de porcentaje (0-100) a calificación por letras
- Flujo de Retroalimentación: campo de comentarios y estado Borrador/Pendiente/Publicada; una evaluación publicada queda bloqueada para edición y solo puede reabrirse mediante "Solicitar modificación al Administrador"
- Insignias en evaluación: el Profesor puede asignar múltiples insignias al evaluar, con una sección "Vista previa del alumno" que muestra cómo las verá el estudiante antes de guardar

### Cambiado

- Evaluaciones: la captura de competencias pasó de selección directa de letra a captura por porcentaje (0-100), con conversión automática a una escala de 8 niveles (A+/A/B+/B/C+/C/D/F) mostrando ambos valores ("92% · A"); ver `docs/PRD-v1.md` §12.5 y `docs/DECISIONS.md` ADR-007 para la decisión de producto y el detalle del cambio de escala
- `CompetencyEvaluator` y `CompetencyLevelBadge` actualizados para capturar/mostrar porcentaje + letra
- La vista de evaluación del Alumno solo muestra competencias, retroalimentación e insignias cuando la evaluación está en estado Publicada; en otro caso muestra "Evaluación en proceso"
- Listado de Evaluaciones del Administrador ahora filtra por Publicadas/Borrador/Pendientes (antes solo Evaluadas/Pendientes)
- Sidebar del Profesor: se agregó el ítem "Avisos"
- Se eliminaron todos los botones "Pendiente"/"En construcción" restantes del rol Profesor; toda acción del módulo abre una página funcional

### Corregido

- `ProfessorEvaluateStudentPage`: la navegación "Estudiante anterior/siguiente" y la carga del alumno seleccionado comparaban el `id` de la evaluación contra el `studentId` de la ruta, por lo que nunca coincidían fuera del primer alumno de la lista (bug latente desde el Sprint 8, expuesto al probar con una URL de alumno específico); ahora compara `studentId` contra `studentId`
- `ProfessorEvaluateStudentPage`: al cambiar el porcentaje de una competencia no se recalculaba la letra mostrada; ahora se recalcula con `percentageToLevel()` en cada cambio

### Notas

- Cambio de decisión de producto (RN-005/ADR-002 → ADR-007): esta demo captura evaluaciones por porcentaje en lugar de letra directa; aprobado explícitamente por el Product Owner el 2026-07-29 tras detectarse la inconsistencia con las reglas vigentes
- No se modificó el Generador de Matrículas ni su Apps Script
- Persistencia de datos: `mocks/*.ts` sigue siendo estado en memoria del módulo JS; se reinicia con cualquier recarga completa de página, comportamiento esperado en esta demo sin backend

---

## v1.4.0

Fecha

2026-07-28

Release

1.2.0 — Consolidación de UX y Navegación

Alcance

Sprint 12 — Header/Sidebar/Breadcrumb/Volver consistentes, estados vacíos, skeletons, buscador, filtros y paginación reutilizables en toda la plataforma

### Agregado

- `Breadcrumb` — ruta de navegación (Inicio > Sección > Página actual), reutilizable en toda la plataforma
- `PageHeader` — encabezado estándar de página (breadcrumb + botón "Volver" + título + subtítulo + acción opcional), usado en prácticamente todas las páginas de detalle, listado y formulario
- `SearchInput` — buscador con ícono, reutilizable en cualquier listado
- `FilterChips` — fila de chips de filtro de valor único, reutilizable
- `Pagination` — paginación mock sobre datos ya cargados en memoria (anterior/siguiente + números de página)
- `ListSkeleton` — estado de carga reutilizable para listados (variante "row" tipo tarjeta con líneas, variante "block" tipo bloque simple)
- `DashboardSkeleton` — estado de carga reutilizable para los tres dashboards, configurable por número de KPIs y variante del bloque inferior (tarjetas o accesos rápidos)
- `useSearch` y `usePagination` (`src/hooks/`) — hooks genéricos de filtrado y paginación de listas en memoria, primeros hooks transversales del proyecto (hasta ahora cada feature tenía los suyos)

### Cambiado

- Buscador y paginación agregados a los 9 listados de la plataforma que no los tenían: Materias (Alumno/Profesor/Administrador), Evaluaciones (Alumno/Profesor/Administrador) y Reportes (Alumno/Profesor); el Foro ya tenía buscador y filtro, ahora también tiene paginación
- Filtro por estado (Evaluadas/Pendientes) agregado al listado de Evaluaciones del Administrador
- Estados vacíos agregados donde faltaban: Materias (los tres roles) y Evaluaciones (Profesor) no tenían ningún manejo de lista vacía; Evaluaciones (Alumno/Administrador) usaban texto plano en vez de `EmptyState`
- `ForumFilters` refactorizado para reutilizar `SearchInput` y `FilterChips` en lugar de su implementación local duplicada
- Los tres esqueletos de dashboard (`DashboardSkeleton` de Alumno, `ProfessorDashboardSkeleton`, `AdminDashboardSkeleton`, casi idénticos) se unificaron en un único componente reutilizable; los tres originales se eliminaron
- El botón "Ver grupo" del Dashboard del Profesor (`ProfessorSubjectsCard`) era un `ComingSoonButton` sin acción; ahora navega a la página real de la materia (`/profesor/materias/:id`), que ya existía desde el Sprint 7
- `PlaceholderPage` (secciones del Administrador aún no implementadas: Usuarios, Profesores, Alumnos, Grupos, Carreras) ahora incluye breadcrumb, igual que el resto de las páginas
- Prácticamente todas las páginas de detalle, listado, creación y perfil ahora comparten breadcrumb, botón "Volver", título y subtítulo mediante `PageHeader` (Header y Sidebar ya eran compartidos desde `MainLayout`/`AppLayout`)

### Notas

- No se agregaron dependencias nuevas: `Pagination`, `Breadcrumb`, `FilterChips`, etc. se construyeron con Tailwind + shadcn/ui + lucide-react ya presentes en el proyecto
- No se modificó ninguna regla de negocio, el Apps Script del Generador de Matrículas, ni la lógica de autenticación; los cambios en `EnrollmentGeneratorPage` se limitaron al bloque de encabezado (breadcrumb/título), sin tocar el formulario, el servicio ni el cliente HTTP
- La barra superior (`Header`) sigue mostrando un título fijo por rol (no dinámico por ruta); el título específico de cada página vive en el `PageHeader` dentro del contenido, que es la señal visual principal
- Búsqueda y paginación son enteramente del lado del cliente, sobre los datos ya cargados por los servicios mock existentes

---

## v1.3.0

Fecha

2026-07-28

Release

1.1.0 — Corrección del Generador de Matrículas

Alcance

Sprint 11 (reinicio) — Reglas de captura exactas + diagnóstico de conectividad

### Corregido

- El formulario ahora captura exactamente los valores que espera el Apps Script institucional, sin inventar opciones: `Programa` = "Prepa" | "Licenciatura"; si Prepa → `Modalidad` = "Examen" | "Curso" | "Escolarizada" (Periodo de "3 meses" / "6 meses" solo si Curso); si Licenciatura → `Carrera` (las 8 exactas) y `Periodo` = Enero/Mayo/Septiembre (valores "1"/"2"/"3")
- `EnrollmentForm` transforma esta captura al payload exacto `{ nombreCompleto, correo, telefono, programa, modalidad, periodo }` sin calcular matrículas, grupos, consecutivos ni abreviaturas — esa lógica sigue viviendo exclusivamente en el Apps Script
- Se preservó el layout, los componentes y la navegación existentes (mismo asistente de 3 pasos, mismas tarjetas); solo cambió el comportamiento interno de captura

### Diagnóstico

- Se localizó la causa raíz de "No se pudo conectar con el servidor de matrículas" mediante peticiones directas por `curl` (sin navegador, sin CORS de por medio) contra el Web App real: Apps Script respondió `No se encontró la función de la secuencia de comandos: doPost`, confirmando que el despliegue activo no tenía el `doPost` agregado en el Sprint 11 original, pese a haberse guardado en el editor
- El código cliente (URL, método, headers, body) se confirmó correcto: la petición llega íntegra al Apps Script
- No se modificó el Apps Script para resolverlo (fuera de alcance); se documentó el paso de despliegue que falta (Implementar → Administrar implementaciones → Editar → Versión: Nueva versión)

### Notas

- `generarMatricula()`, `registrarAlumno()`, `generarPDF()` y `registrarYGenerarPDF()` no se tocaron
- Verificado en navegador (recarga completa, sin caché de HMR) que el payload interceptado coincide exactamente con el objeto esperado, para las ramas Prepa+Examen, Prepa+Curso y Licenciatura
- Pendiente: confirmar el flujo end-to-end una vez que el Apps Script quede redesplegado con `doPost`

---

## v1.2.0

Fecha

2026-07-28

Release

1.1.0 — Integración real con Apps Script

Alcance

Sprint 11 — Generador de Matrículas conectado al Apps Script institucional

### Agregado

- `apps-script/EnrollmentApi.gs`: copia de referencia del Apps Script institucional con `doPost(e)` agregado como punto de entrada HTTP para React (`doGet()` se conserva intacto; ambos coexisten)
- `services/api/appsScriptApi.ts` ahora es el cliente HTTP real: único archivo del proyecto que conoce la URL del backend, configurable mediante `VITE_APPS_SCRIPT_URL` (ver `.env.example`)
- `EnrollmentResult` muestra Usuario y Contraseña temporal, y habilita la descarga real de la carta de bienvenida (`pdfUrl` recibido del backend)
- Manejo de errores con `Alert` de shadcn en `EnrollmentGeneratorPage`: los fallos de red o del Apps Script se muestran como mensaje claro, nunca como error del navegador

### Cambiado

- `enrollment.service.ts` eliminó el almacén simulado en memoria (mock) del Sprint 10; ahora delega en `appsScriptApi.registrarYGenerarPDF`
- El contrato `EnrollmentResponse` incorpora los campos opcionales `usuario` y `contrasenaTemporal`

### Notas

- `generarMatricula()`, `registrarAlumno()`, `generarPDF()` y `registrarYGenerarPDF()` no cambiaron su lógica de negocio; solo se adaptó el punto de entrada HTTP
- No se integró todavía con Login, Reportes, Alumno, Profesor, WordPress ni MasterStudy
- Requiere que el Apps Script se publique como Web App y que `VITE_APPS_SCRIPT_URL` apunte a esa URL; sin configurar, el formulario muestra un error explicativo en vez de fallar silenciosamente

### Verificación pendiente

- El flujo se probó contra un Web App real de Apps Script ya desplegado (con `doPost` y acceso "Cualquier usuario"). En el navegador en sandbox usado para las pruebas, `fetch()` en modo `cors` falló (`Failed to fetch`) tanto para `GET` como para `POST`, incluso manejando el redirect manualmente; en modo `no-cors` la petición sí se inicia. Es un patrón conocido de Apps Script: la redirección interna de `script.google.com` a `script.googleusercontent.com` no siempre expone cabeceras CORS al fetch del navegador, independientemente de la configuración de la implementación.
- No se modificó el Apps Script para intentar solucionarlo (fuera del alcance del Sprint 11: "no rediseñar el proyecto de Apps Script").
- Pendiente: confirmar en un navegador real (fuera del sandbox de pruebas) si el flujo completo (Apps Script → Sheets → PDF → Respuesta → Descarga) se completa sin el bloqueo CORS observado aquí.

---

## v1.1.0

Fecha

2026-07-28

Release

1.0.0 — Generador de Matrículas (mock)

Alcance

Sprint 10 — Corrección de Configuración (Alumno/Profesor) y Generador de Matrículas

### Agregado

- Módulo Generador de Matrículas como primera herramienta administrativa "real" de Ludi Class
- Flujo en 3 pasos: datos personales, información académica (Programa/Modalidad/Periodo dinámicos) y resumen antes de registrar
- Resultado de registro con matrícula, grupo, número de alumno y descarga de carta de bienvenida (simulada)
- Reglas de negocio replicadas exactamente del Apps Script institucional existente (numeración por programa, capacidad de grupo de 30, formato de matrícula por Prepa/Licenciatura)
- Nueva estructura de feature co-localizada `src/features/admin/enrollment/` con `pages/`, `components/`, `services/` (incluye `services/api/`), `schemas/` y `types/` propios (ver ADR-006)
- Contrato inicial `appsScriptApi.ts` para la futura integración real (solo define la interfaz, sin llamadas HTTP)
- Ruta `/admin/matriculas` accesible desde Administrador → Herramientas → Generador de Matrículas

### Corregido

- Configuración ahora es accesible también para Alumno (`/alumno/configuracion`) y Profesor (`/profesor/configuracion`), reutilizando `SettingsPage` y el mismo patrón ya usado por Administrador
- El menú de usuario (`UserMenu`) muestra "Configuración" para los tres roles, cada uno apuntando a su propia ruta
- Eliminadas rutas placeholder duplicadas para secciones del Administrador que ya cuentan con un módulo real (Materias, Configuración, Generador de Matrículas)

### Notas

- No se integró aún Apps Script, Google Sheets, WordPress ni MasterStudy: los datos provienen de `enrollment.service.ts` con un almacén simulado en memoria
- No se implementó generación real de PDF ni envío de correos
- El botón "Descargar PDF" está deshabilitado hasta la integración real

---

## v1.0.0

Fecha

2026-07-24

Release

0.9.0 — Integración de Módulos y Mejora de UX

Alcance

Sprint 9 — Navegación Consistente, Perfiles y Mejoras de Experiencia

### Agregado

- Página de Perfil para Alumno, Profesor y Administrador
- Página de Configuración (placeholder) para funcionalidades futuras
- Menú de usuario mejorado con acceso a Perfil y Configuración
- Navegación consistente entre todos los módulos
- Botones "Volver" en todas las páginas secundarias
- Rutas protegidas por rol: `/alumno/perfil`, `/profesor/perfil`, `/admin/perfil`, `/admin/configuracion`

### Mejorado

- Experiencia de usuario unificada en todos los dashboards
- Iconografía consistente en toda la aplicación
- Espaciado y tipografía uniformes
- Microinteracciones visuales (hover, transiciones, estados)
- Estructura de navegación intuitiva

### Notas

- MVP completamente funcional con integración de 4 módulos principales
- Navegación transversal entre Materias, Evaluaciones, Reportes y Foro
- Sistema de autenticación y control de acceso por rol
- Preparado para futuras integraciones con Google Sheets / API REST

---

## v0.9.0

Fecha

2026-07-24

Release

0.8.0 — Módulo de Evaluaciones

Alcance

Sprint 8 — Módulo de Evaluaciones (Alumno, Profesor, Administrador)

### Agregado

- Módulo de Evaluaciones transversal a los tres roles
- Alumno: Lista de evaluaciones (completadas/pendientes) y detalle con competencias y retroalimentación
- Profesor: Lista de materias para evaluar y pantalla de evaluación con escala institucional (A+, A, B+, B, C, D)
- Profesor: Retroalimentación en campo de texto y asignación de insignias (UI)
- Administrador: Consulta de todas las evaluaciones con resumen de progreso
- Servicio desacoplado `evaluation.service.ts` y almacén simulado `mocks/evaluations.ts` (estado en memoria)
- Componentes reutilizables: `CompetencyLevelBadge`, `CompetencyEvaluator`, `BadgeList`
- Rutas de evaluaciones para cada rol: `/alumno/evaluaciones`, `/profesor/evaluaciones`, `/admin/evaluaciones`
- Sección "Evaluaciones" en la navegación de Alumno, Profesor y Administrador

### Cambiado

- Navegación actualizada en todos los roles para incluir acceso a Evaluaciones

### Notas

- No se implementó persistencia real, Google Sheets ni integración de archivos
- El estado de evaluaciones es en memoria y se reinicia al recargar
- Las insignias tienen UI seleccionable pero no persisten
- Los datos provienen del servicio evaluation.service.ts que utiliza mocks

---

## v0.8.0

Fecha

2026-07-24

Release

0.7.0 — Módulo Académico de Materias

Alcance

Sprint 7 — Módulo de Materias (Alumno, Profesor, Administrador)

### Agregado

- Módulo de Materias transversal a los tres roles
- Alumno: Lista de materias con avance y detalle de materia
- Profesor: Lista de materias impartidas y administración de materia con estudiantes
- Administrador: Consulta de materias del plan de estudios
- Secciones dentro de cada materia: Resumen, Actividades, Material, Avisos
- Servicio desacoplado `subject.service.ts` y almacén simulado `mocks/subjects.ts` (estado en memoria)
- Componentes reutilizables: `SubjectSectionCard`, `ActivityList`, `MaterialList`, `AnnouncementList`, `StudentList`
- Rutas de materias para cada rol: `/alumno/materias`, `/profesor/materias`, `/admin/materias`
- Sección "Materias" en la navegación de Alumno, Profesor y Administrador
- Botón "Volver" en todas las páginas de detalle

### Cambiado

- Navegación actualizada en todos los roles para incluir acceso a Materias

### Notas

- No se implementó evaluaciones, entrega de actividades, carga de archivos ni persistencia real
- El estado de materias es en memoria y se reinicia al recargar
- Cada materia tiene su propia página con navegación independiente
- Los datos provienen del servicio subject.service.ts que utiliza mocks

---

## v0.7.0

Fecha

2026-07-24

Release

0.6.0 — Reportes, Evaluaciones y Foro

Alcance

Sprint 6 — Módulo de Foro Académico

### Agregado

- Módulo de Foro Académico transversal a los tres roles
- Lista de publicaciones (feed) con buscador y filtro por categoría del lado del cliente
- Creación de publicación (React Hook Form + Zod) con categoría y etiquetas
- Detalle de publicación con comentarios y respuestas anidadas
- Etiquetas por publicación
- Insignia de rol de autor (Profesor / Administrador)
- Servicio desacoplado `forum.service.ts` y almacén simulado `mocks/forum.ts` (estado en memoria)
- Componentes reutilizables `AuthorRoleBadge`; componentes de feature `AuthorLine`, `ForumPostCard`, `ForumFilters`, `CommentThread`, `PostForm`
- Sección "Foro" en la navegación de Alumno, Profesor y Administrador

### Cambiado

- El acceso rápido "Foro" del dashboard del Administrador ahora abre el foro real en lugar de un placeholder
- Rama de rutas `/foro` compartida por los tres roles bajo el layout existente

### Notas

- Cada vista es una página independiente con botón "Volver". El buscador y el filtro por categoría operan solo del lado del cliente sobre datos mock.
- No se implementó persistencia, reacciones, archivos, moderación ni Google Sheets. El estado del foro es en memoria y se reinicia al recargar.

---

## v0.6.0

Fecha

2026-07-24

Release

0.6.0 — Reportes y Evaluaciones

Alcance

Sprint 5 — Módulo de Reportes Semanales (Alumno y Profesor)

### Agregado

Alumno

- Lista de reportes semanales
- Creación de reporte (React Hook Form + Zod)
- Detalle del reporte con evidencias y evaluación

Profesor

- Lista de reportes pendientes de revisión
- Página de revisión del reporte
- Evaluación por competencias con la escala institucional (A+, A, B+, B, C, D) y decisión de aprobar o solicitar correcciones

Transversal

- Escala de competencias centralizada en `types/evaluation.ts`
- Tipos de reporte en `types/report.ts`
- Almacén simulado de reportes en `mocks/reports.ts` (estado en memoria)
- Servicios desacoplados `student-report.service.ts` y `teacher-report.service.ts`
- Componentes reutilizables `BackLink`, `ReportStatusBadge`, `ReportListItem`, `ReportContentCard`, `ReportEvaluationSummary`
- Sección "Reportes" en la navegación de Alumno y Profesor

### Cambiado

- El botón "Revisar" del dashboard del profesor ahora abre la página de revisión del reporte

### Notas

- Cada vista es una página independiente con botón "Volver". No se usan modales.
- El estado de reportes es en memoria durante la sesión y se reinicia al recargar. No hay persistencia real, Google Sheets ni carga real de archivos.

---

## v0.5.0

Fecha

2026-07-24

Release

0.5.0 — Experiencia Administrador

Alcance

Sprint 4 — Dashboard del Administrador

### Agregado

- Dashboard del Administrador
- Bienvenida con contexto institucional
- 4 KPIs institucionales: usuarios registrados, alumnos, profesores y grupos
- Accesos rápidos a las secciones de administración
- Sección de Herramientas con acceso al Generador de Matrículas
- Indicadores institucionales
- Actividad institucional
- Avisos
- Capa de servicios `admin.service.ts`
- Datos mock del administrador en `mocks/admin.ts`
- Configuración de secciones del administrador en `admin-sections.ts`
- Pantallas placeholder para Usuarios, Profesores, Alumnos, Grupos, Materias, Carreras, Foro, Configuración y Generador de Matrículas
- Componentes reutilizables `QuickAccessGrid`, `QuickAccessCard` y `PlaceholderPage`

### Cambiado

- La ruta `/admin` ahora muestra el Dashboard en lugar de la pantalla de bienvenida temporal
- `RecentActivityCard` acepta un título opcional para reutilizarse como "Actividad institucional"

### Eliminado

- Pantalla de bienvenida temporal `WelcomePage`, ya sin uso tras completar los tres dashboards

### Notas

- El Generador de Matrículas abre un placeholder preparado para integraciones futuras. No se integra Google Apps Script en este Sprint.
- Los accesos rápidos y las herramientas dirigen a placeholders. No se implementó CRUD ni lógica de negocio.

---

## v0.4.0

Fecha

2026-07-24

Release

0.4.0 — Experiencia Profesor

Alcance

Sprint 3 — Dashboard del Profesor

### Agregado

- Dashboard del Profesor
- Bienvenida personalizada con contexto docente
- 4 KPIs: alumnos asignados, grupos, reportes por revisar y materias impartidas
- Materias asignadas con grupo y número de alumnos
- Reportes pendientes de revisión
- Actividad reciente
- Próximas entregas
- Avisos
- Capa de servicios `professor.service.ts`
- Datos mock del profesor en `mocks/professor.ts`
- Componentes de dashboard compartidos entre roles en `components/dashboard`: `WelcomeCard`, `KpiGrid`, `RecentActivityCard`, `UpcomingActivitiesCard`, `AnnouncementsCard`
- Componente `ComingSoonButton` para acciones aún no implementadas
- Tipos de dashboard transversales en `types/dashboard.ts`

### Cambiado

- La ruta `/profesor` ahora muestra el Dashboard en lugar de la pantalla de bienvenida temporal
- El Dashboard del Alumno se refactorizó para consumir los widgets de dashboard compartidos, eliminando componentes duplicados. Salida visual sin cambios.

### Corregido

- Sin correcciones en este Sprint

---

## v0.3.0

Fecha

2026-07-23

Release

0.3.0 — Experiencia Alumno

Alcance

Sprint 2 — Dashboard del Alumno

### Agregado

- Dashboard del Alumno
- Tarjeta de bienvenida con contexto académico
- 4 KPIs: materias inscritas, reportes pendientes, insignias obtenidas y nivel de competencia
- Card de progreso con avance del periodo y nivel por competencia
- Lista de materias con profesor y avance
- Actividad reciente
- Próximas actividades con indicador de vencimiento
- Avisos
- Capa de servicios `student.service.ts`
- Datos mock del alumno en `mocks/student.ts`
- Componentes reutilizables `StatCard` y `EmptyState`
- Utilidades de fecha en español
- Estados de carga con skeleton y estados vacíos por widget

### Cambiado

- La ruta `/alumno` ahora muestra el Dashboard en lugar de la pantalla de bienvenida temporal

### Corregido

- Sin correcciones en este Sprint

---

## v0.2.0

Fecha

2026-07-23

Alcance

Sprint 0 + Sprint 1

### Agregado

Sprint 0 — Fundaciones

- Proyecto Vite + React 19 + TypeScript
- TailwindCSS v4 + shadcn/ui
- Tipografía Inter
- Tema claro y variables de color institucionales
- React Router DOM
- Estructura Feature Based
- Layout principal, Sidebar y Header reutilizables

Sprint 1 — Autenticación Demo

- Login Demo
- AuthContext
- Persistencia
- Guards
- Logout
- Splash Screen
- Validaciones React Hook Form + Zod
- Mostrar/Ocultar contraseña
- Avatar con menú desplegable
- Usuarios mock por rol

### Cambiado

- Branding

### Corregido

- Errores de navegación