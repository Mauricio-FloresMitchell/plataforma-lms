ADR-001

Ludi Class será inicialmente un MVP para Universidad Imperalianz.

--------------

ADR-002

No existen calificaciones numéricas.

Evaluación por competencias.

--------------

ADR-003

La demo será independiente de WordPress.

--------------

ADR-004

La fuente de datos será Mock Services.

--------------

ADR-005

Arquitectura Feature Based.

--------------

ADR-006

El módulo Generador de Matrículas (Sprint 10) introduce `services/` y `types/` propios dentro de `src/features/admin/enrollment/`, en lugar de los directorios planos `src/services` y `src/types` usados por el resto del proyecto.

Motivo: aislar el contrato de la futura integración con Apps Script (`services/api/appsScriptApi.ts`) dentro de la misma feature que lo consume, sin acoplar otras features a él.

Los módulos existentes conservan su estructura plana. Esta convención aplica únicamente a módulos nuevos que lo justifiquen explícitamente.

--------------

ADR-007

Sprint Demo Profesor. Se modifica RN-005 y PRD §12.5, previamente definidos en ADR-002.

La escala de competencias pasa de 6 a 8 niveles (se agregan C+ y F): A+, A, B+, B, C+, C, D, F.

El profesor ya no selecciona la letra directamente: captura un porcentaje (0-100) y la plataforma lo convierte a letra mediante una tabla fija de equivalencias (A+ = 97-100 … F = menor a 60). La interfaz muestra siempre ambos valores.

Se mantiene el principio de ADR-002 de que la evaluación oficial del alumno es una letra, no un número libre: el porcentaje es el mecanismo de captura, no una calificación numérica independiente que el alumno reciba en su lugar.

Aprobado explícitamente por el Product Owner el 2026-07-29, ante la inconsistencia detectada con ADR-002/RN-005 vigentes.

--------------

ADR-008

Sprint 12 — Motor de Reportes Académicos. Introduce una segunda escala de letras, independiente de la escala de 8 niveles de RN-005/ADR-007.

El bloque "Evaluación Docente" del módulo de Reportes Semanales (PRD §12.4) califica cada reporte mediante Rúbrica A (70%) + Rúbrica B (30%) + bonificación → un porcentaje final que la plataforma convierte automáticamente a una letra de 5 niveles: A (90-100), B (80-89), C (70-79), D (60-69), F (menor a 60). El profesor nunca captura la letra manualmente.

Esta escala de 5 niveles es exclusiva del módulo de Reportes y no reemplaza ni modifica RN-005 (Evaluaciones por competencias, escala de 8 niveles A+ a F). Son dos escalas distintas para dos módulos distintos:

- Evaluaciones (RN-005/ADR-007): A+, A, B+, B, C+, C, D, F.
- Reportes — Evaluación Docente (este ADR): A, B, C, D, F.

El sprint no incluyó el contenido exacto de las 7 plantillas académicas (R01-R07: campos, preguntas por semana, producto de titulación por carrera); se diseñó contenido de ejemplo razonable, documentado como tal en `mocks/reportTemplates.ts`, editable a futuro sin tocar el motor de renderizado.

Aprobado explícitamente por el Product Owner el 2026-07-29, ante la inconsistencia detectada entre la escala pedida en este sprint (A/B/C/D/F) y la escala vigente de RN-005/ADR-007 (8 niveles), y ante la falta de contenido exacto para las 7 plantillas.

--------------

ADR-009

Sprint Leaderboard y Gamificación. El sprint pidió simultáneamente (a) "No modificar navegación" y (b) crear una nueva sección de Leaderboard "accesible para Alumno, Profesor y Administrador" con accesos rápidos desde cada Dashboard — dos instrucciones en tensión, ya que una sección nueva necesita algún punto de entrada.

Resolución: no se tocó `navigation.ts` ni el Sidebar/Header (layout intacto). En su lugar, Leaderboard y Gestión de Puntos son rutas nuevas en `AppRouter.tsx`, alcanzables únicamente mediante enlaces dentro de los widgets nuevos de cada Dashboard (aditivos) y desde un botón nuevo en "Evaluar Alumno". Esto satisface ambas instrucciones sin comprometer ninguna: la navegación global no cambia, y la sección sí es accesible.

La gamificación se conectó al flujo de Evaluaciones (`ProfessorEvaluateStudentPage`, ya con captura de % y badges desde el Sprint Demo Profesor), no al de Reportes, porque el sprint prohibió explícitamente modificar Reportes.

El sprint tampoco definió las reglas exactas de: bonificación académica, umbrales de "estado del alumno", condiciones de las 6 insignias automáticas, ni cómo determinar el movimiento de ranking ▲▼= sin historial persistente. Se diseñaron reglas simples de MVP, documentadas en `docs/TDD-v1.md` y en el código (`mocks/gamification.ts`, `services/gamification.service.ts`), editables a futuro sin rediseñar el motor.

Aprobado como decisión de ingeniería dentro del alcance ya autorizado del sprint (no cambia ningún requerimiento, solo resuelve una ambigüedad de implementación); no requirió una nueva confirmación explícita del Product Owner por tratarse del mismo tipo de contenido de ejemplo ya aprobado en ADR-008.

--------------

ADR-010

Sprint 13.2 — Moderación del Foro. Agrega permisos permanentes nuevos por rol sobre el módulo Foro:

- Alumno: crear publicaciones, comentar, responder comentarios, reportar publicaciones y comentarios. No puede eliminar contenido ajeno.
- Profesor: todo lo anterior, además de marcar respuestas destacadas (ya existente desde el Sprint 13.1), fijar publicaciones y cerrar discusiones académicas. No puede eliminar contenido ni sancionar usuarios.
- Administrador: moderación total — eliminar publicaciones/comentarios, restaurar contenido, revisar y resolver reportes, enviar advertencias, ver historial de moderación.

El "Centro de Moderación" (`/admin/moderacion`) se agregó como una tarjeta más en `ADMIN_MANAGEMENT_SECTIONS` (`admin-sections.ts`), el mismo mecanismo ya usado por Materias/Configuración/Matrículas — no se tocó `navigation.ts` ni el Sidebar, siguiendo la resolución ya establecida en ADR-009 para el mismo tipo de tensión ("no modificar navegación" vs. necesitar un punto de entrada a una sección nueva).

El sprint pidió explícitamente NO implementar suspensiones ni bloqueos, pero sí preparar la arquitectura para soportarlos después: `UserModerationStatus` (`isSuspended`, `suspendedUntil`) existe desde este sprint pero ninguna pantalla los aplica; solo se cuentan advertencias.

El borrado de publicaciones/comentarios es suave (`isDeleted` + metadatos), nunca se elimina el registro, para poder cumplir "Restaurar contenido" sin reconstruir datos.

Aprobado como parte del alcance ya definido en el sprint (permisos, reportes y Centro de Moderación fueron pedidos explícitamente); se documenta aquí por tratarse de permisos permanentes, según el propio sprint pidió actualizar DECISIONS "solo si se agregan nuevos permisos permanentes".

--------------

ADR-011

Sprint 17 — Modelo Académico Imperalianz. El sprint pidió "reconstruir completamente" el sistema de Evaluación con Rúbrica A, Rúbrica B, % final y letra — usando exactamente los mismos cortes (90-100=A, 80-89=B, 70-79=C, 60-69=D, 0-59=F) que ADR-008 ya definió para la Evaluación Docente de Reportes. Esto entra en tensión directa con RN-005/ADR-002/ADR-007, vigentes desde antes: la evaluación oficial del alumno por competencias usa una escala de 8 niveles (A+ a F), no de 5.

Resolución: se mantienen ambas escalas, para dos capas distintas de la misma Evaluación, sin reemplazar ninguna:

- Competencias individuales (Pensamiento Estratégico, Comunicación, etc.): escala de 8 niveles, sin cambios (RN-005/ADR-007).
- Rúbrica A + Rúbrica B → % final oficial de la evaluación: escala de 5 niveles, reutilizando `calculateFinalPercentage`/`percentageToReportLevel` (`utils/reportGrade.ts`, ADR-008) tal cual, sin duplicar la fórmula.

Es la misma resolución que ADR-008 ya estableció para Reportes ("dos escalas distintas para dos módulos/capas distintas, documentadas"), aplicada ahora también dentro de Evaluaciones. El porcentaje siempre se muestra junto a la letra en ambas capas, nunca la sustituye — cumple el mandato explícito del Sprint 17 ("La letra nunca sustituye al porcentaje").

Los criterios de las rúbricas (nombre + peso) y sus niveles de calificación (Excelente/Bueno/Suficiente/Insuficiente, con factor 1/0.85/0.7/0.4 sobre el peso) tampoco estaban definidos por el sprint; se diseñaron valores razonables de ejemplo (`RUBRIC_A_CRITERIA`/`RUBRIC_B_CRITERIA` en `types/evaluation.ts`, `RUBRIC_LEVEL_FACTOR` en `types/rubric.ts`), documentados como tales y editables a futuro sin rediseñar el motor de cálculo (`utils/rubric.ts#scoreRubric`).

El sprint también pidió agregar "Cursos y Certificaciones", "Biblioteca" y "Producto de Titulación" al menú lateral de los 3 roles, en tensión con la instrucción general "NO cambiar navegación" — a diferencia de ADR-009/ADR-010 (que resolvieron la misma tensión sin tocar el Sidebar), aquí el propio sprint fue explícito y textual pidiendo el cambio de menú, así que se aplicó directamente sobre `navigation.ts` en vez de usar el mecanismo de accesos rápidos del Dashboard; ninguna sección ni ruta existente se eliminó.

Aprobado como decisión de ingeniería dentro del alcance ya autorizado del sprint (reutiliza una escala y una fórmula ya aprobadas por el Product Owner en ADR-008, no introduce una tercera); mismo criterio que ADR-009 para no requerir una nueva confirmación explícita.

--------------

ADR-012

Sprint 18 — Producto de Titulación (Core Académico). El sprint pidió explícitamente "preparar backend": arquitectura desacoplada, sin datos mock embebidos en los componentes, con interfaces, servicios, modelos, repositorios y adaptadores — sin conectar todavía una base de datos real.

Desde el Sprint 1, el patrón establecido en todo el proyecto (documentado en TDD-v1.md, "Capa de datos") ya es `mocks/*.ts` (datos) → `services/*.service.ts` (API REST-like, async) → componentes; "migrar a una API real implica reemplazar el cuerpo de las funciones de servicio". Ese patrón ya logra el mismo objetivo de desacoplamiento en espíritu, pero sin un contrato nombrado explícitamente.

Resolución: para Titulación específicamente (única capa que las 17 partes del sprint piden reforzar), se formaliza el mismo principio con un patrón Repositorio/Adaptador explícito:

- `repositories/titulacion.repository.ts`: interfaz `TitulacionRepository` (el contrato) + `getTitulacionRepository()` (único punto de resolución del adaptador concreto).
- `repositories/adapters/titulacion.mock-adapter.ts`: `TitulacionMockAdapter implements TitulacionRepository`, con el store en memoria (antes vivía suelto en `mocks/titulacion.ts`, retirado en este sprint).
- `services/titulacion.service.ts`: ya no importa `mocks/titulacion.ts`; depende únicamente de `getTitulacionRepository()`, y sigue siendo el único lugar que conoce el Event Bus y Auditoría (el repositorio no los conoce).

Se decidió **no** replicar este patrón en los ~17 módulos restantes del proyecto (que siguen con `mocks/*.ts` + `services/*.service.ts` sin una interfaz nombrada): todas las partes del Sprint 18 conciernen exclusivamente a Titulación, y una reescritura general habría contradicho la instrucción explícita "todo debe integrarse sobre la arquitectura actual" y el alcance autorizado del sprint. El día que se decida generalizar el patrón, cada módulo puede migrar de forma independiente sin bloquear a los demás.

Misma resolución de alcance para la exportación (Parte 15, "preparar arquitectura sin implementarla"): `services/export/titulacionExport.adapter.ts` define `TitulacionExportAdapter` con un único método (`exportProduct`) y una implementación stub que devuelve `{ ready: false, message }`; no genera PDF/Word ni un repositorio real todavía.

El renombre del tipo raíz (`TitulacionProject` del Sprint 17 → `TitulacionProduct`) es una ruptura deliberada, no accidental: el modelo de datos anterior (fase con `feedback: string` único, sin versionado, sin archivos tipados) no podía extenderse de forma aditiva al modelo pedido por este sprint (versionado con historial completo, retroalimentación múltiple por tipo, archivos con 9 tipos y versión propia) sin cambiar la forma del objeto raíz; se actualizaron todos los consumidores (`TitulacionProjectPanel`, `StudentTitulacionPage`, `ProfessorTitulacionPage`, `AdminTitulacionPage`, `SubjectInlinePanel`) en el mismo sprint, sin dejar ninguna referencia al tipo anterior.

La sincronización automática (Parte 7) se resolvió con un listener nuevo (`core/events/listeners/TitulacionSyncListener.ts`) que se suscribe a eventos que **ya emitían** Reportes, Evaluaciones, Actividades, Gamificación y Leaderboard, más un evento nuevo (`COURSE_COMPLETED`, emitido por `course.service.ts#markCourseCompletedAsync`) — ningún módulo fuente importa ni conoce Titulación; el acoplamiento va en un solo sentido, igual que el resto de los listeners del Event Bus (`NotificationListener`, `LeaderboardListener`, etc.).

Aprobado como decisión de ingeniería dentro del alcance ya autorizado del sprint (el propio sprint pidió textualmente "preparar repositorios" y "preparar adaptadores"); no requirió una nueva confirmación explícita del Product Owner por tratarse de una decisión de arquitectura interna sin impacto visible en el comportamiento para el usuario final.

--------------

ADR-013

Sprint 19 — Administrador (Rediseño Completo del Panel Administrativo). El sprint pidió "reducir clics" y "evitar listas infinitas", además de convertir cada módulo en "una herramienta administrativa funcional" en vez de solo mostrar información. Esto obligó a varias decisiones de alcance y consolidación no especificadas literalmente por el sprint.

**Consolidación de `admin-sections.ts` (17 → 9 entradas).** El Dashboard anterior (Sprint 13) tenía un `KpiGrid` de 18 tarjetas y un `QuickAccessGrid` de 14, más un `ToolsSection` de 3 — con varias entradas que ya eran accesibles desde el Sidebar (Materias, Cursos, Biblioteca, Titulación, Evaluaciones, Foro), lo cual era exactamente la "tarjeta duplicada" que el sprint pidió eliminar. Resolución: se retiraron del catálogo de accesos rápidos las secciones que ya tienen entrada en el Sidebar; las que no (Carreras, Grupos, Reportes, Rúbricas) se consolidaron dentro del nuevo hub "Gestión Académica"; Moderación se fusionó dentro de Foro (ver más abajo); la "Configuración" genérica de cuenta se dejó fuera del catálogo administrativo porque ya es accesible desde el menú del Header, común a los 3 roles.

**Gestión Académica como hub de resumen, no de re-implementación.** Carreras, Materias, Grupos, Evaluaciones, Reportes, Producto de Titulación y Leaderboard ya eran módulos completos con su propia pantalla y ruta antes de este sprint. Reescribirlos dentro de un componente de tabs habría significado duplicar lógica ya probada (búsqueda, paginación, formularios) siete veces. Resolución: el hub de Gestión Académica (`/admin/academico`) los resume con datos en vivo (`admin.service.ts#getAcademicSummaryAsync`, reutiliza `computeKpis()` ya existente) y un enlace directo a la pantalla completa — "un solo lugar para empezar", no "un solo lugar que hace todo". Solo los dos conceptos nuevos de este sprint (Planes de Estudio, Cuatrimestres) tienen CRUD nativo dentro del hub, porque no existía ninguna pantalla previa que duplicar.

**Foro + Moderación: fusión por composición, no por reescritura.** El sprint pidió "eliminar el módulo independiente de Moderación. Fusionarlo con Foro." La implementación de moderación (`ModerationCenterPage`, Sprint 13.2) ya era un componente autocontenido con su propia carga de datos. Se extrajo su cuerpo (sin la cabecera de página) a `ModerationPanel.tsx` y se montó como una pestaña adicional ("Moderación") dentro de `ForumListPage`, visible solo cuando `user.role === 'administrador'` — la vista de Alumno/Profesor de `/foro` no cambia. La ruta `/admin/moderacion` y su entrada en `admin-sections.ts` se eliminaron.

**"Solicitudes pendientes" y "Tickets abiertos" se derivan de la misma fuente (Incidencias).** El sprint pide ambos indicadores en el Dashboard, pero no existe en el proyecto un modelo unificado de "solicitud" fuera de lo que este mismo sprint crea (Centro de Incidencias). No se construyó una segunda fuente de datos paralela solo para diferenciar ambos números: "Solicitudes pendientes" cuenta incidencias en estado `abierto` (recién llegadas, sin triage) y "Tickets abiertos" cuenta `abierto` + `en_proceso` (todo lo que sigue activo) — mismo dato, dos cortes distintos, sin inventar una segunda tabla.

**Centro de Incidencias: ingesta automática del Foro, alta manual para el resto.** El sprint pide que reciba "automáticamente" reportes del Foro y solicitudes académicas/técnicas/administrativas. Los reportes del Foro ya tienen un evento (`FORUM_POST_REPORTED`/`FORUM_COMMENT_REPORTED`) que un nuevo listener (`IncidentSyncListener.ts`) consume para crear la incidencia sin que `forum.service.ts` conozca este módulo — igual patrón de acoplamiento en un solo sentido que `TitulacionSyncListener` (ADR-012). Las solicitudes académicas/técnicas/administrativas, en cambio, no tienen todavía un formulario de Alumno/Profesor que las origine (construirlo habría significado agregar una pantalla nueva a los otros dos roles, fuera del alcance de "rediseñar el panel del Administrador"); se sembraron ejemplos y el Administrador puede darlas de alta manualmente desde el mismo Centro. Documentado como alcance deliberadamente reducido, mismo criterio que Sprint 16/17/18 usaron para recortes similares.

**Auditoría de sesión sin tocar autenticación.** El sprint pide registrar "inicio de sesión" y "cierre de sesión", pero también "NO modificar autenticación". `AuthProvider.tsx` ya emitía `USER_LOGIN`/`USER_LOGOUT` desde el Sprint del Event Bus (para otros fines); un listener nuevo (`AuditListener.ts`) se suscribe a esos mismos eventos y llama a `recordAudit` — ni `auth.service.ts` ni `AuthProvider.tsx` se tocaron. Los intentos fallidos sí requirieron una adición mínima en `LoginForm.tsx` (una llamada a `recordAnonymousAudit` dentro del `catch` existente, sin cambiar la lógica de validación) porque no hay ningún otro punto donde un login fallido sea observable. `AuditLogEntry.role` pasó a opcional para representar estas entradas sin actor autenticado, en vez de inventar un rol falso.

**RBAC preparado, no implementado.** El sprint pide explícitamente "NO implementar permisos todavía" pero "no usar condicionales quemados". Se creó `utils/permissions.ts#hasPermission(role, permission)` como único punto de decisión — hoy siempre `true` para `administrador` — y cada sección de `admin-sections.ts` declara su `PermissionKey`. Todo código que decide qué mostrar llama a `hasPermission`, nunca compara `role === 'administrador'` directamente, para que el Sprint 20 (Administrador Maestro) pueda introducir niveles reales cambiando un solo archivo.

Aprobado como decisiones de ingeniería dentro del alcance ya autorizado del sprint (consolidación de UI, fusión de módulos, y preparación de arquitectura fueron pedidas explícitamente); no requirió una nueva confirmación explícita del Product Owner por no alterar reglas de negocio ni datos ya capturados.

--------------

ADR-014

Sprint 20 — RBAC Completo (Administrador Maestro) + Arquitectura de Permisos, descrito por el propio sprint como "el cierre funcional del MVP". El sprint pide una jerarquía completa (Administrador Maestro → Administradores → Roles → Permisos → Módulos) y una matriz de permisos explícita para 10 módulos, pero el proyecto ya tiene ~20 módulos administrativos construidos en sprints anteriores. Esto obligó a varias decisiones de alcance no especificadas literalmente por el sprint.

**Catálogo de permisos ampliado de 10 a 20 módulos.** La matriz que el sprint detalla cubre Usuarios/Materias/Carreras/Evaluaciones/Reportes/Leaderboard/Biblioteca/Foro/Comunicación/Configuración. El resto de los módulos administrativos ya construidos (Titulación, Cursos, Notificaciones, Auditoría, Seguridad, Respaldos, Incidencias, Matrículas, y los dos módulos que este mismo sprint agrega — Roles, Administradores) quedarían sin gobernar por RBAC si `PERMISSION_MODULES` se limitara a los 10 explícitos. Resolución: se extendió aditivamente el catálogo (`types/rbac.ts#PERMISSION_MODULES`, 20 entradas) para que "RBAC Completo" cubra realmente todo el panel, consistente con la propia descripción del sprint como cierre funcional del MVP.

**Rol Finanzas sin módulo Finanzas construido.** El sprint define el rol "Finanzas" con permisos de pagos/becas/estados de cuenta/facturación/descuentos/historial, pero no existe ninguna feature de Finanzas en la plataforma. Resolución: se modelaron los 6 permisos (`finanzas.*`) honestamente en `types/rbac.ts` y se sembró el rol (`role-finanzas`) sin fabricar una pantalla o ruta ficticia — mismo criterio que el stub de exportación de Titulación (Sprint 18) y los placeholders de Configuración (Sprint 19): preparar la arquitectura de permisos, no simular una funcionalidad que no existe.

**Permisos efectivos como unión pura, nunca resta.** El sprint da un ejemplo explícito (Coordinador Académico + permiso adicional "Exportar Reportes" → el resultado final lo incluye) pero no aclara qué pasa si un permiso personalizado coincide con uno ya heredado, ni si un permiso personalizado puede quitar algo del rol base. Resolución: `getEffectivePermissionsAsync` calcula siempre `rolePermissions ∪ customPermissions` — un permiso personalizado nunca puede restringir lo que el rol ya concede, solo añadir. Esto es intencional: restringir por debajo del rol base requeriría un segundo concepto (denegaciones explícitas) que el sprint no pide y que complicaría la UI de "Permisos personalizados (adicionales al rol)" sin necesidad.

**"Suspender" administradores reutiliza el estado `bloqueado` existente.** El sprint pide un botón "Suspender/Reactivar" en Gestión de Administradores, pero `ManagedUserStatus` (Sprint 13) solo tiene `activo`/`inactivo`/`bloqueado` — el mismo mecanismo que ya usa "Bloquear/Desbloquear" en la pantalla genérica de Usuarios. Resolución: no se agregó un cuarto valor de estado; "Suspender" es una etiqueta distinta sobre la misma transición a `bloqueado`, evitando que un nuevo valor se propague a `STATUS_BADGE` y a cada `switch` existente sobre `ManagedUserStatus`.

**Sidebar agrupado sin tocar `Sidebar.tsx`.** El sprint pide "rediseñar completamente el menú lateral, agrupado por categorías" pero también "NO cambiar rutas". `types/nav.ts#NavSection.label` y el renderizado de `Sidebar.tsx` ya soportaban encabezados de grupo desde el inicio del proyecto, sin haber sido usados nunca con más de una sección. Resolución: `ROLE_NAV.administrador` pasó de 1 sección plana a 4 secciones agrupadas (Administración/Académico/Comunidad, más Inicio) modificando únicamente `routes/navigation.ts` — ninguna ruta existente cambió de path, solo se reorganizó su presentación; las pantallas nuevas (Administradores, Roles, Seguridad) recibieron rutas nuevas, no reemplazos.

**Auditoría de RBAC sin un listener nuevo.** A diferencia de Sesión/Foro/Incidencias (Sprint 19, vía Event Bus), las mutaciones de Roles y Administradores llaman a `recordAudit` directamente al final de cada función de `rbac.service.ts` — mismo patrón síncrono que el resto de los servicios administrativos (Carreras, Materias, Evaluaciones, etc. desde el Sprint 13), no justifica introducir un evento nuevo solo para este módulo.

Aprobado como decisiones de ingeniería dentro del alcance ya autorizado del sprint (RBAC completo, matriz de permisos y rediseño del Sidebar fueron pedidos explícitamente); no requirió una nueva confirmación explícita del Product Owner por no alterar reglas de negocio ni datos ya capturados.