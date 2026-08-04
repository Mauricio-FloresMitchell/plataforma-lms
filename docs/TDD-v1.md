Stack

React

Vite

TypeScript

Tailwind

shadcn/ui

React Router

Arquitectura

Feature Based

Mock Services

Preparado para JWT

Preparado para PostgreSQL

Preparado para Google Sheets

---

# Implementación

Actualizado al cierre del Sprint 1.

## Stack instalado

- React 19
- Vite
- TypeScript
- TailwindCSS v4
- shadcn/ui
- React Router DOM v7
- React Hook Form
- Zod
- Lucide React

Incorporados en el Sprint 1 para las validaciones de formularios: React Hook Form, Zod y `@hookform/resolvers`.

Pendientes de incorporar según el stack aprobado: TanStack Query, TanStack Table, Recharts, Framer Motion.

## Estructura

```
src/
  app/          Composición raíz
  routes/       Rutas y guards
  layouts/      Layouts de aplicación
  features/     Features aisladas
  components/   UI compartida
  hooks/        Hooks genéricos
  services/     Acceso a datos
  types/        Tipos de dominio
  utils/        Utilidades puras
  mocks/        Datos simulados
  assets/       Recursos
```

## Capa de datos

Los componentes nunca acceden a `mocks` ni a `localStorage` de forma directa.

Todo pasa por `services`.

`src/services/auth.service.ts` es el único punto que conoce el origen de los datos de autenticación. Expone `login`, `getStoredSession`, `persistSession` y `logout` con firmas asíncronas equivalentes a las de una API real.

Migrar a JWT implica reemplazar el cuerpo de esas funciones por llamadas HTTP. El `AuthContext`, los hooks y los componentes visuales no cambian.

El mismo patrón aplicará al resto de features.

## Hooks genéricos

Actualizado al cierre del Sprint 12. Primer uso de `src/hooks/` (hasta entonces vacío; cada feature tenía únicamente hooks propios en `features/*/hooks`).

- `useSearch(items, fields)` — filtra una lista en memoria por texto de búsqueda
- `usePagination(items, pageSize)` — pagina una lista ya cargada en memoria, reinicia a la página 1 cuando cambia el tamaño de la lista filtrada

Se usan en conjunto (`useSearch` → `usePagination`) en los listados de Materias, Evaluaciones, Reportes y Foro. Ambos operan sobre datos ya traídos por los servicios existentes; no hacen llamadas de red ni sustituyen la capa de `services`.

## Consistencia de páginas (Sprint 12)

- `PageHeader` (breadcrumb + botón "Volver" + título + subtítulo) es el bloque estándar al inicio del contenido de cada página. El `Header` y el `Sidebar` de `MainLayout`/`AppLayout` siguen siendo el "chrome" compartido de la aplicación; `PageHeader` estandariza lo que antes cada página armaba a mano.
- `Breadcrumb` se usa solo (sin el resto de `PageHeader`) en páginas donde el título ya lo provee otro componente (ej. `ReportContentCard`, perfiles con avatar+nombre), para evitar duplicar el título visualmente.

## Autenticación

- `AuthProvider` mantiene el estado de sesión
- `useAuth` expone el contexto de forma tipada
- `ProtectedRoute` restringe rutas por rol
- `PublicOnlyRoute` bloquea el acceso al login con sesión activa
- La sesión se persiste en LocalStorage y se restaura al arrancar

## Integración con Apps Script (Generador de Matrículas)

Actualizado al cierre del Sprint 11. Primera integración real del proyecto con un backend externo.

El Apps Script institucional (Google Sheets + generación de PDF en Drive) es la fuente de verdad de las reglas de negocio de matrículas. El frontend no reimplementa esa lógica: la consume vía HTTP.

Capas, de la UI hacia el backend:

```
EnrollmentForm
    ↓
enrollment.service.ts   (contrato estable: EnrollmentRequest → EnrollmentResponse)
    ↓
services/api/appsScriptApi.ts   (único archivo que conoce la URL del backend)
    ↓
Apps Script — doPost(e)   (adapta la entrada HTTP, invoca registrarYGenerarPDF() sin duplicar lógica)
    ↓
Google Sheets + Google Drive (PDF)
```

- La URL del Web App se configura mediante la variable de entorno `VITE_APPS_SCRIPT_URL` (ver `.env.example`). Nunca se hardcodea en el código fuente.
- El cuerpo de la petición se envía como `text/plain;charset=utf-8` (no `application/json`) para evitar el preflight CORS que Apps Script no soporta; Apps Script igual lo interpreta como JSON vía `e.postData.contents`.
- Apps Script responde siempre con la envoltura `{ success, message, data? , error? }`; `appsScriptApi.ts` la desempaqueta y lanza `AppsScriptApiError` en caso de error, que la página muestra mediante un `Alert` de shadcn (nunca un error crudo del navegador).
- El código de referencia del Apps Script vive en `apps-script/EnrollmentApi.gs` en la raíz del repositorio (fuera del build de Vite). Es la copia que debe pegarse en el editor de Apps Script del proyecto real.
- `generarMatricula()`, `registrarAlumno()`, `generarPDF()` y `registrarYGenerarPDF()` no se modificaron en su lógica; `doGet()` se conserva para el formulario HTML original. El único punto nuevo es `doPost(e)`, que además deriva `usuario` (= matrícula) y `contrasenaTemporal` (= constante existente) sin tocar esas funciones núcleo.

### Captura de datos (React) — reglas exactas, no configurables

`EnrollmentForm` agrupa la captura en dos ramas para la UI (Prepa/Licenciatura), pero React no calcula ni interpreta reglas de negocio: `toEnrollmentRequest()` únicamente reordena la selección del usuario en el payload `{ nombreCompleto, correo, telefono, programa, modalidad, periodo }` que espera Apps Script.

- `Programa`: "Prepa" | "Licenciatura" (exactamente estas dos opciones)
- Si Prepa → `Modalidad`: "Examen" | "Curso" | "Escolarizada"
  - Si Curso → `Periodo`: "3 meses" | "6 meses" (valor = etiqueta)
  - Si Examen o Escolarizada → sin Periodo (`periodo: ""`)
- Si Licenciatura → `Carrera` (una de las 8 exactas: Administración, Ingeniería en Sistemas, Negocios Internacionales, Contabilidad, Derecho, Mercadotecnia, Pedagogía, Psicología); esa carrera se envía como `programa` **y** como `modalidad` (columna histórica "Modalidad/Licenciatura" del Sheet, sin efecto en `generarMatricula()` para esta rama)
  - `Periodo`: valor "1"/"2"/"3", mostrado como Enero/Mayo/Septiembre

### Despliegue del Apps Script — paso crítico

Guardar código en el editor de Apps Script **no** actualiza el `/exec` en vivo. Se confirmó por diagnóstico directo (`curl` contra el Web App, sin navegador) que un despliegue con código desactualizado responde `No se encontró la función de la secuencia de comandos: doPost`. Para publicar cambios en la misma URL: Implementar → Administrar implementaciones → editar la implementación activa → Versión: "Nueva versión" → Implementar.

## Módulo Profesor — CRUD mock y adjuntos (Sprint Demo Profesor)

Actualizado al cierre del Sprint Demo Profesor (2026-07-29). Primer feature nuevo (`avisos-profesor`) agregado desde el Sprint 12, y primera vez que los stores de `mocks/subjects.ts` exponen mutadores (create/update/delete), no solo lectura.

- Los stores de `mocks/*.ts` que ahora se mutan (`subjects.ts`, `evaluations.ts`, `teacherAnnouncements.ts`) usan `let` a nivel de módulo. No hay persistencia: cualquier recarga completa de página reinicia el estado a los datos semilla. Es el comportamiento esperado de una demo sin backend, no un bug.
- Patrón de mutación: `mocks/*.ts` expone funciones síncronas (`createActivity`, `updateActivity`, `deleteActivity`, `createMaterial`, `deleteMaterial`, `createSubjectAnnouncement`, `recordEvaluation`, ...) → `services/*.ts` las envuelve en wrappers `async` con el mismo `NETWORK_DELAY_MS` simulado que ya usaban las lecturas → los componentes solo llaman a `services`, nunca a `mocks` directamente (misma regla de la Capa de datos de arriba, ahora también aplicada a escritura).
- `services/announcement.service.ts` compone dos stores: cuando un aviso se envía con `scope: 'materia'`, además de guardarse en `teacherAnnouncements.ts` para el historial del Profesor, llama a `createSubjectAnnouncementAsync` (`subjects.ts`) para que el mismo aviso aparezca en la vista de esa materia para el Alumno. Es el único punto del proyecto donde un service coordina dos mocks distintos.
- `MockFileInput` (`src/components/MockFileInput.tsx`) — patrón para "adjuntar archivo" sin backend: un `<input type="file">` real queda oculto y se dispara desde un botón con estilo propio; solo se captura el nombre del archivo (`MockAttachment { name }`), nunca se sube ni se lee el contenido. Se usa en Actividades, Avisos y (para materiales tipo documento) Materiales.
- Confirmación de acciones destructivas (eliminar actividad/material) usa `window.confirm()` nativo, no un modal a medida — consistente con la convención "no modales" de páginas dedicadas para CRUD.

## Evaluaciones — captura por porcentaje (Sprint Demo Profesor)

- `src/utils/grade.ts` (`percentageToLevel`) es la única fuente de la conversión porcentaje → letra (escala de 8 niveles, ver `docs/PRD-v1.md` §12.5 y ADR-007 en `docs/DECISIONS.md`). Tanto `CompetencyEvaluator` (captura del Profesor) como cualquier vista de solo lectura recalculan la letra a partir del porcentaje con esta función; el porcentaje es el dato fuente, la letra es derivada y no se persiste independientemente.
- `StudentEvaluation.status: 'borrador' | 'pendiente' | 'publicada'` controla dos cosas a la vez: si el Profesor puede seguir editando (`ProfessorEvaluateStudentPage` bloquea el formulario cuando `status === 'publicada'`, y solo permite reabrirlo mediante una solicitud simulada al Administrador) y si el Alumno puede ver el detalle completo (`StudentEvaluationDetailPage` solo renderiza competencias/retroalimentación/insignias cuando `status === 'publicada'`; en otro caso muestra un `EmptyState` de "Evaluación en proceso").

## Evaluaciones — flujo materia → alumnos → evaluar (fix, 2026-07-29)

Ruta corregida: `ProfessorEvaluationsListPage` (`/profesor/evaluaciones`) enlazaba a `/profesor/evaluaciones/:subjectId`, pero esa ruta no existía en `AppRouter`; al no matchear, el router caía en el catch-all `*` → `RootRedirect` → Dashboard del Profesor. El flujo correcto de tres pasos es:

```
/profesor/evaluaciones                       (materias del profesor)
    ↓
/profesor/evaluaciones/:subjectId             (alumnos de esa materia — ProfessorEvaluationSubjectStudentsPage, nueva)
    ↓
/profesor/evaluaciones/:subjectId/:studentId  (evaluar alumno — ProfessorEvaluateStudentPage)
```

- `ProfessorEvaluationSubjectStudentsPage` sigue el mismo patrón de listado que el resto de la plataforma (`PageHeader` + `SearchInput` + `ListSkeleton` + `EmptyState` + `Pagination`). Si la materia no tiene alumnos, muestra el `EmptyState` "No existen alumnos asignados a esta materia." — nunca navega ni redirige.
- `getProfessorStudentEvaluationsAsync(subjectId)` (ya existente) es la única fuente de datos de esta página; no se agregó ningún endpoint/servicio nuevo.
- El roster de cada materia del Profesor ahora se genera completo (28/25/30 alumnos según `PROFESSOR_SUBJECTS`) en `mocks/evaluations.ts` mediante `buildProfessorRoster()`, determinístico (sin `Math.random`) para no cambiar entre renders. Cada materia usa un bloque de ids distinto (100s/200s/300s) para `eval-*`/`std-*`: `recordEvaluation` busca por id a través de las tres listas del profesor y actualizaría por error al alumno equivocado si los ids colisionaran entre materias.
- `StudentEvaluation` ganó dos campos opcionales, poblados solo en el roster del Profesor: `company` (empresa de práctica) y `weeklyReportStatus` (estado del reporte semanal, tipo `ReportStatus | 'sin_reporte'`). No se buscó unificar esta información con `mocks/reports.ts`: ese store usa un espacio de `studentId` distinto (`usr-alumno-XXX`, alumnos con nombre real) del roster de Evaluaciones (`std-XXX`, alumnos genéricos "Estudiante N"), inconsistencia preexistente en los mocks que no formaba parte de este fix.
- `ProfessorEvaluateStudentPage` agrega un "Promedio general" (promedio de los porcentajes de todas las competencias → letra vía `percentageToLevel`), derivado en cada render a partir de `competencies`, no persistido como campo independiente. El breadcrumb y "Volver" de esta página ahora regresan a `/profesor/evaluaciones/:subjectId` (alumnos de la materia), no al listado de materias.

## Reportes — Motor de Plantillas Académicas (Sprint 12, 2026-07-29)

Reemplaza la lógica interna del módulo de Reportes (creación del Alumno y evaluación del Profesor). No se tocó navegación, rutas, sidebar, dashboard ni layout — las páginas conservan su `PageHeader`/`Breadcrumb`/`BackLink` de siempre; solo cambió el contenido dentro de las tarjetas.

### Motor de plantillas (`@/types/reportTemplate`, `mocks/reportTemplates.ts`)

Una `ReportTemplate` (R01-R07) define: carrera(s), producto de titulación, campos específicos (`specificFields`), preguntas por semana (`weeklyQuestions: Record<1|2|3|4, TemplateQuestion[]>`), si exige anonimización y si exige adjuntos. El formulario del Alumno y la vista de lectura (compartida con el Profesor) se renderizan **desde esa definición** — no hay un `if (carrera === 'Derecho')` en ningún componente; toda diferencia entre carreras vive en los datos de la plantilla, no en el código.

Las 8 carreras de Licenciatura (mismas que `enrollment`, pero declaradas de forma independiente — `REPORT_CAREERS` en `@/types/reportTemplate` — para no importar del módulo aislado por ADR-006) se agrupan en 7 plantillas: R01 cubre Administración y Negocios Internacionales; el resto son 1:1.

El contenido específico (preguntas exactas, producto de titulación por carrera, campos) no fue proporcionado en el sprint; es contenido de ejemplo razonable, documentado como tal en `mocks/reportTemplates.ts`. Ampliar o corregir una plantilla es editar ese único archivo — no toca el motor de renderizado ni los componentes.

### Validación dinámica, no Zod/RHF

El resto de formularios del proyecto usa React Hook Form + Zod con un esquema estático conocido en tiempo de compilación. Aquí los campos y preguntas varían por plantilla — el esquema no puede conocerse hasta que se resuelve la materia elegida. `validateReportForm(template, values)` (`features/reportes-alumno/schemas/report-schema.ts`) construye las reglas en tiempo de ejecución a partir de la propia plantilla y devuelve un mapa de errores; `ReportTemplateForm` mantiene el estado con `useState` plano en lugar de RHF. Es la única excepción documentada a la convención RHF+Zod, y por la misma razón: no hay una forma estática que resolver.

### Capas de datos

```
ReportTemplateForm (Alumno)
    ↓
student-report.service.ts   (createStudentReport, getReportSubjects, getReportTemplatesAsync)
    ↓
mocks/reports.ts (insertReport) + mocks/reportTemplates.ts (getReportTemplate)
```

```
EvaluationForm (Profesor, bloque "Evaluación Docente")
    ↓
teacher-report.service.ts   (evaluateReport, getReportTemplatesAsync)
    ↓
mocks/reports.ts (applyEvaluation) → calculateFinalPercentage + percentageToReportLevel (@/utils/reportGrade)
```

- `SUBJECTS_BY_STUDENT` (`mocks/reports.ts`) ahora asocia cada materia disponible para crear un reporte con su `templateId` y `career`. Se agregaron 4 materias sintéticas (`sub-201`..`sub-204`) exclusivas de este catálogo — no aparecen en `mocks/subjects.ts` ni en Materias — para poder probar las 7 plantillas con la única cuenta de alumno demo (`usr-alumno-001`).
- Los ids de reportes/evaluaciones generados por plantilla no colisionan con los sembrados: cada materia insertada usa `sequence` incremental sobre el mismo contador que ya usaban los reportes libres.

### Escala de la Evaluación Docente (ADR-008)

`@/utils/reportGrade.ts` define una escala de 5 niveles (A 90-100, B 80-89, C 70-79, D 60-69, F <60), **independiente** de la escala de 8 niveles de Evaluaciones (RN-005/ADR-007, `@/utils/grade.ts`). `calculateFinalPercentage(rubricA, rubricB, bonus)` pondera 70/30 y suma la bonificación; `percentageToReportLevel` convierte el resultado a letra. El profesor solo captura `rubricA`, `rubricB` y `bonus` — la letra siempre se deriva, nunca se asigna directamente (a diferencia de `ReportEvaluation.level` antes de este sprint, que el profesor elegía de un Select).

### Compatibilidad con reportes previos al Sprint 12

`WeeklyReport` y `ReportEvaluation` ganaron campos opcionales (`templateId`, `answers`, `fieldValues`, `titulacionIntegration`, `links`, `anonymizationConfirmed`, `rubricA`, `rubricB`, `bonus`, `finalPercentage`, `badgeIds`). Los reportes sembrados antes de este sprint no los tienen:

- `ReportContentCard` renderiza los campos/preguntas dinámicos solo si `report.templateId` está presente; si no, muestra el párrafo `report.content` como siempre (sin cambio visual para esos registros).
- `ReportEvaluationSummary` muestra el desglose de rúbricas solo si `evaluation.rubricA`/`rubricB` están presentes; si no, muestra únicamente letra + observaciones, como antes.
- Un registro sembrado (`rep-085`) tenía nivel `'B+'` (escala de 8 niveles) y se remapeó a `'B'`, porque `ReportGradeLevel` no incluye niveles con "+".

### Adjuntos (`@/utils/reportAttachments.ts`)

Archivos: PDF, DOCX, XLSX, PPTX, JPG, PNG, ZIP — mismo patrón mock que `MockFileInput` (solo se captura el nombre), pero con un componente propio (`ReportAttachmentsSection`) porque el tipo `MockAttachment['kind']` ('archivo'|'imagen') no alcanza para 7 tipos distintos. El tipo de archivo se detecta por extensión (`detectReportFileKind`).

Enlaces: GitHub, Google Drive, Canva, Figma, YouTube — se valida que la URL corresponda al dominio de la plataforma seleccionada (`isValidReportLinkUrl`) antes de agregarla.

## Leaderboard y Gamificación (Sprint Leaderboard, 2026-07-29)

La gamificación no es un módulo independiente: es consecuencia del flujo de Evaluaciones ya existente. No se creó una arquitectura nueva de cero — se compuso sobre `mocks/evaluations.ts` (roster académico) siguiendo el mismo patrón multi-mock que `announcement.service.ts` (Sprint Demo Profesor) y `gamification.service.ts` (Sprint 12, Reportes) ya establecieron.

```
ManagePointsPage (Profesor) ──┐
LeaderboardTable (3 páginas) ─┼─→ gamification.service.ts
Dashboards (3 widgets) ───────┘        ↓
                          mocks/evaluations.ts (roster: getSubjectRosterForGamification)
                          + mocks/gamification.ts (POINT_CATALOG, PointMovement)
```

- `mocks/gamification.ts` no conoce evaluaciones ni badges manuales; solo movimientos de puntos sobre un `studentId`/`subjectId` que ya existen en el roster de Evaluaciones. `services/gamification.service.ts` es el único punto que combina ambos mocks para construir un `LeaderboardEntry` (mismo patrón de composición en servicio, nunca mock-a-mock).
- Catálogo de puntos cerrado (`PointActionId`, 9 valores fijos con su puntaje). La UI (`PointCatalogPicker`) solo permite seleccionar una tarjeta — no existe ningún campo numérico editable en todo el flujo de puntos, por regla explícita del sprint.

### Reglas de MVP no especificadas por el sprint

Ninguna de estas fórmulas fue proporcionada en el requerimiento; se diseñaron como contenido de ejemplo razonable (mismo criterio ya aprobado en ADR-008 para las plantillas de Reportes), documentadas aquí y en `mocks/gamification.ts` para poder ajustarlas sin tocar el resto del motor:

- **Bonificación académica** = `min(10, floor(totalPoints / 20))` — 1 punto porcentual por cada 20 puntos acumulados, tope 10.
- **Estado del alumno**: `en_riesgo` si `totalPoints < 0`; `destacado` si `totalPoints >= 100`; `activo` en cualquier otro caso.
- **Insignias automáticas** (`calculateAutomaticBadgeIds`): Iniciador = al menos 1 movimiento; Consultor = 3+ `consulta_foro`; Campeón = rank 1 de su materia con puntos > 0; Racha Oro = 3+ `reporte_entregado` sin ninguna `tardanza`/`ausencia`; Colaborador = 3+ `respuesta_foro`; Nivel Élite = `totalPoints >= 150`.
- **Movimiento de ranking (▲▼=)**: el MVP no persiste snapshots históricos del ranking entre sesiones (no hay backend), así que `deterministicRankMovement(studentId)` deriva la flecha del propio id del alumno — es una señal de ejemplo para mostrar el patrón visual, no un cálculo real sobre historial. Sustituir por un cálculo real requiere guardar un snapshot del ranking anterior, fuera de alcance de este sprint.
- `career`, `term` (cuatrimestre 1-9) y `titulacionProgress` se agregaron como campos opcionales de `StudentEvaluation`, generados de forma determinística en `buildProfessorRoster` (mismo patrón que `company`/`weeklyReportStatus`, Sprint Evaluaciones).

### Insignias: manuales vs. automáticas

`Badge` (`@/types/evaluation`) ganó `awardType?: 'manual' | 'automatic'`. Las insignias previas al sprint no lo tienen (se tratan como manuales por compatibilidad). En `ProfessorEvaluateStudentPage`, la sección "Asignar Insignias" filtra `badges.filter(b => b.awardType !== 'automatic')` antes de pasarlas a `BadgeList`: el profesor nunca puede seleccionar manualmente una insignia automática, coherente con "el sistema las calcula, el profesor nunca las asigna". Las 6 automáticas sí aparecen en el Leaderboard y en los widgets de Dashboard, calculadas por `calculateAutomaticBadgeIds`.

Esta protección solo se aplicó en Evaluaciones (el flujo al que se conectó la gamificación); el `EvaluationForm` de Reportes no se tocó, por instrucción explícita de no modificar ese módulo.

### Navegación (ADR-009)

`navigation.ts`, `Sidebar`, `Header` y `MainLayout`/`AppLayout` no se modificaron. Las 4 rutas nuevas (`/alumno/leaderboard`, `/profesor/leaderboard`, `/profesor/puntos`, `/admin/leaderboard`) se agregaron solo a `AppRouter.tsx` y son alcanzables exclusivamente desde enlaces dentro de los widgets nuevos de cada Dashboard (`GamificationCard`, `GroupLeaderboardCard`, `GlobalLeaderboardCard`) y desde un botón nuevo en "Evaluar Alumno". Ver ADR-009 para el razonamiento completo.

### Componentes reutilizables nuevos

`src/components`: `LeaderboardTable` (Top 3 + ranking completo, reutilizado por las 3 páginas de Leaderboard), `StudentStatusBadge`, `RankMovementIndicator`.

## Foro — Hilos de Discusión (Sprint 13.1, 2026-07-29)

Extiende únicamente `src/features/foro`, `src/mocks/forum.ts`, `src/services/forum.service.ts` y `src/types/forum.ts`. No se tocó navegación, layout, autenticación ni ningún otro módulo.

### Reacciones: almacenamiento interno vs. forma pública

Los tipos públicos (`ForumComment.reactions`, `ForumReply.reactions`) son `ForumReactionSummary[]` (`{emoji, count, reactedByMe}`), ya resueltos para quien los consulta. Internamente `mocks/forum.ts` guarda `StoredReaction[]` (`{emoji, userIds[]}`) — así una misma reacción se puede reportar distinto según el `viewerId` (si el usuario en sesión ya reaccionó o no) sin duplicar datos por usuario. `toPublicPost(post, viewerId)` hace la conversión en cada lectura (`listPosts`, `findPost`); por eso `getForumPost`/`useForumPost` ahora reciben `viewerId`.

Este mismo patrón (store interno con forma distinta a la pública + función `toPublic*`) ya se usaba en `mocks/reports.ts` para evidencias/links; aquí se replica para reacciones.

### Anidación: 1 nivel, respuestas siempre "planas" bajo su comentario

El modelo de datos (`ForumComment.replies: ForumReply[]`) ya tenía un nivel de anidación desde antes de este sprint. "Responder" sobre una respuesta (no solo sobre el comentario raíz) inserta igualmente en `comment.replies` — no hay un tercer nivel. Es una simplificación deliberada de MVP: cumple "comentarios anidados al menos 1 nivel" sin un árbol de profundidad arbitraria.

### Menciones (`@Nombre`)

Detección simple por regex (`createMentionNotifications` en `mocks/forum.ts`): busca `@Palabra` o `@Palabra Palabra` en el contenido y notifica a cualquier autor conocido del foro cuyo nombre completo empiece con ese texto (case-insensitive). No hay autocompletado ni validación de que el nombre exista mientras se escribe — es contenido de ejemplo razonable de MVP, mismo criterio de sprints anteriores (ADR-008/ADR-009), documentado aquí por no haberse especificado en el requerimiento.

### Notificaciones: solo dentro del Foro, no un centro global

`ForumNotification` vive y se consulta únicamente dentro del módulo (`/foro/notificaciones`, nueva ruta en el grupo transversal ya existente de `AppRouter.tsx`). No se agregó una campana de notificaciones al `Header` compartido ni se tocó `navigation.ts` — el único punto de entrada es el botón "Notificaciones" (con contador de no leídas) dentro de `ForumListPage`, que sí es parte del módulo Foro. Mismo criterio de "no modificar navegación" ya resuelto en el Sprint Leaderboard (ADR-009): la sección es alcanzable, pero no vía sidebar.

### "Respuesta destacada" — evento preparado para el Leaderboard, sin aplicar puntos

`setFeatured` (`mocks/forum.ts`) valida que quien marca sea `profesor` o `administrador`, y si se marca (no al desmarcar) registra un `FeaturedAnswerEvent` en un log en memoria (`getFeaturedAnswerEvents()`), con `pendingPoints: 15` fijo — coincide a propósito con la acción "Respuesta foro" (+15) del catálogo de Gamificación (`mocks/gamification.ts`, Sprint Leaderboard), como candidato natural de integración futura. Este sprint **no** importa ni llama a `gamification.service.ts`: el evento solo se registra y queda disponible para que un sprint futuro lo consuma. En la UI, el control "Destacar" se oculta por completo (no solo se deshabilita) para roles distintos de Profesor/Administrador, en `CommentThread`.

## Foro — Moderación (Sprint 13.2, 2026-07-29)

Extiende `src/features/foro`, la nueva feature `src/features/moderacion-admin`, `src/mocks/forum.ts`, `src/services/forum.service.ts` y `src/types/forum.ts`. No se tocó navegación, layout, autenticación, Reportes académicos ni Gamificación.

### Borrado suave, nunca destructivo

`ForumPost`/`ForumComment`/`ForumReply` ganaron `isDeleted`/`deletedByName`/`deletedAt` (interfaz `Moderatable`, compartida por los tres). `deletePostContent`/`deleteCommentContent` solo marcan la bandera — el contenido original permanece en el store. `restoreContent` la revierte a partir de una entrada del historial de moderación (`ModerationLogEntry`, acción `eliminar_publicacion`/`eliminar_comentario` sin `restoredAt` todavía). Es el mismo patrón que ya usaban `mocks/reports.ts`/`mocks/evaluations.ts` para no perder datos sembrados — aquí se aplica por primera vez con reversión explícita.

En la UI, contenido eliminado no desaparece: se reemplaza por "[Contenido eliminado por moderación]" (`CommentThread`) o por un `Alert` (`ForumPostDetailPage`), y el feed (`listPosts`) simplemente excluye publicaciones eliminadas — `findPost` (detalle) sigue devolviéndolas.

### Reportes → acciones → notificaciones, todo en un mismo flujo

`createReport` no necesita saber si el objetivo es un post o un comentario/respuesta para el llamador: `CreateForumReportInput.targetType` + `targetId` alcanzan; `findCommentOrReply` busca la respuesta recorriendo todos los comentarios (no requiere el id del comentario padre).

Toda acción que resuelve un reporte pasa por `resolveReportRecord` (helper interno, no exportado): cambia `status`/`resolution`, escribe **una** entrada en `MODERATION_LOG` y notifica al reportante (`report_update`). `reviewReport` (Ignorar/Marcar como resuelto), `deletePostContent`/`deleteCommentContent` (cuando reciben `relatedReportId`) e `issueWarning` (cuando el reporte seguía pendiente) reutilizan este mismo helper — evita registrar la acción dos veces. `issueWarning` fue el caso que originalmente sí duplicaba el log (llamaba a `addModerationLog` directamente y otra vez a través de `resolveReportRecord`); se corrigió durante la verificación manual de este sprint.

`deletePostContent`/`deleteCommentContent` también funcionan **sin** `relatedReportId` (el Administrador puede eliminar directamente desde el hilo, no solo desde un reporte) — en ese caso no hay reporte que resolver, solo se notifica al autor del contenido (`content_removed`).

### Permisos: validados en el mock, no solo ocultos en la UI

Cada función de moderación (`togglePin`, `toggleClosed`, `deletePostContent`, `deleteCommentContent`, `reviewReport`, `issueWarning`, `restoreContent`) revalida el rol de quien la invoca y devuelve `null` si no corresponde — la UI ya oculta los controles según el rol, pero la capa de datos no confía únicamente en eso (mismo criterio que `setFeatured`, Sprint 13.1).

`addComment`/`addReply` rechazan (`null`) si la publicación está `isClosed` o `isDeleted`. La UI oculta "Responder" y el formulario de comentario nuevo cuando la discusión está cerrada (`ForumPostDetailPage`, `CommentThread` recibe `isClosed`), pero el mock es la fuente de verdad.

### Centro de Moderación: nueva sección vía Panel de Administración, no vía Sidebar

Mismo patrón que ADR-009 (Leaderboard): `navigation.ts` no se tocó. La sección se agregó a `ADMIN_MANAGEMENT_SECTIONS` (`features/dashboard-admin/admin-sections.ts`), la misma fuente que ya alimenta las tarjetas de acceso rápido del Dashboard del Administrador — agregar una entrada ahí no requiere tocar `AdminDashboardPage.tsx` ni el Sidebar, solo registrar la ruta nueva en `AppRouter.tsx` y sumar `'moderacion'` a `IMPLEMENTED_ADMIN_SECTIONS` (para que no genere un placeholder).

Cuatro pestañas en una sola página (`ModerationCenterPage`, estado local `Tab`, sin router): Reportes pendientes, Reportes resueltos, Historial de moderación, Usuarios con advertencias. `getForumUserModerationStatuses()` agrega `WARNINGS` por `userId` en el mock — no hay un store separado de "usuarios", se deriva de las advertencias ya emitidas.

### Preparado para suspensiones (no implementadas)

`UserModerationStatus.isSuspended`/`suspendedUntil` existen en el tipo y se calculan (siempre `false`/`undefined`) en `getUserModerationStatuses`, pero ninguna pantalla los lee ni los aplica — es literalmente la instrucción del sprint ("diseñar la arquitectura... pero mantener este Sprint enfocado en un MVP funcional"). Activar suspensiones en el futuro implica: (1) un umbral de advertencias que dispare `isSuspended`, (2) que `ProtectedRoute`/`addComment`/`addReply` lo consulten — ninguno de los dos existe todavía.

## Event Bus + Centro de Notificaciones (Sprint Event Bus, 2026-07-29)

Nueva arquitectura transversal: `src/core/events` (Event Bus de dominio) y `src/features/notifications` (Centro de Notificaciones global). Único cambio en un archivo compartido: `Header.tsx` gana la campana (Parte 1 del sprint la nombra explícitamente como excepción a "no modificar componentes existentes") y `App.tsx` envuelve la app en `NotificationProvider` y registra los listeners al arrancar. Sidebar, layout, navegación y diseño visual no se tocaron.

### Dos canales de pub/sub distintos, a propósito

`core/events/EventBus.ts` (`eventBus`, tipado a `AppEventMap`) son los **eventos de negocio**: `REPORT_SUBMITTED`, `GRADE_UPDATED`, `POINTS_GRANTED`, etc. — lo que un módulo emite cuando termina una acción. `core/events/notificationSignal.ts` es un canal aparte, deliberadamente no mezclado con `AppEventMap`: solo informa a `NotificationProvider` que debe releer la bandeja (`created`/`read`/`read-all`/`deleted`/`deleted-read`) sin que el Provider necesite conocer ningún evento de dominio. Separar ambos evita que el Centro de Notificaciones y el resto de la plataforma queden acoplados por el mismo canal — un futuro `EmailListener` o `AnalyticsListener` nunca necesita saber que existe `notificationSignal`, y `NotificationProvider` nunca necesita conocer `AppEventMap`.

### Los módulos nunca crean notificaciones

Todo módulo (Reportes, Evaluaciones, Foro, Gamificación, Materias, Avisos, Autenticación) emite su evento de dominio desde la **capa de servicios** (`src/services/*.ts`), nunca desde los mocks — mantiene el criterio ya establecido de que los mocks son datos puros y los servicios son el único punto que conoce el origen de los datos. `NotificationListener` (`core/events/listeners/NotificationListener.ts`) es el único archivo de todo el proyecto que llama a `notification.service.ts`; decide si el evento amerita notificación, para quién y con qué texto/enlace. Ejemplo real: `evaluation.service.ts#recordEvaluationAsync` → `emitAppEvent('GRADE_UPDATED', …)` → `NotificationListener` → `createNotification(...)` → `notificationSignal.emit('created', …)` → `NotificationProvider` releé → `NotificationBell` actualiza el contador, sin que `recordEvaluationAsync` sepa que una notificación existe.

### Cuentas demo como destinatario cuando el evento no trae uno explícito

El MVP solo tiene una cuenta real por rol (`usr-alumno-001`, `usr-profesor-001`, `usr-admin-001`, ver `mocks/users.ts`). Eventos donde "a quién le toca" no es parte natural del payload (ej. "el profesor de esta materia", "el administrador") se dirigen a la cuenta demo del rol correspondiente, hardcodeada en `NotificationListener` (`DEMO_ALUMNO_ID`/`DEMO_PROFESOR_ID`/`DEMO_ADMIN_ID`) — mismo criterio pragmático ya usado en Gamificación (Sprint Leaderboard) y Foro. `ACTIVITY_CREATED`/`MATERIAL_CREATED` además filtran por `DEMO_ALUMNO_SUBJECT_IDS` (las materias en las que está inscrita la cuenta demo de Alumno) para no generar notificaciones de materias a las que el alumno demo no pertenece.

### Insignias: solo se notifica lo nuevo, no todo el arreglo guardado

`recordEvaluationAsync` recibe el arreglo completo `badgeIds` deseado (igual que antes de este sprint), no una insignia a la vez. Para emitir `BADGE_GRANTED` únicamente por las insignias que de verdad son nuevas, el servicio compara contra el estado previo vía `getEvaluationBadgeIds` (helper agregado a `mocks/evaluations.ts`, busca el `evaluationId` en las tres colecciones) antes de llamar a `recordEvaluation`. Sin este diff, guardar dos veces la misma evaluación sin cambios de badges dispararía `BADGE_GRANTED` de nuevo.

### `GRADE_CREATED` nunca se emite

Las evaluaciones de esta plataforma están pre-provisionadas por alumno (ver `STUDENT_EVALUATIONS`/`PROFESSOR_EVALUATIONS_BY_SUBJECT` en `mocks/evaluations.ts`) — el profesor nunca "crea" una evaluación desde cero, `recordEvaluationAsync` siempre actualiza un registro que ya existía en estado `pendiente`. Por eso solo existe un call site para `GRADE_UPDATED`; `GRADE_CREATED` queda definido en `AppEventMap` y documentado como no emitido (junto con `GRADE_DELETED`, `BADGE_REVOKED`, `NOTICE_CREATED`, `NOTICE_UPDATED`, `USER_REGISTERED`, `ADMIN_SUSPENSION`, `PROFILE_UPDATED` — ver comentario en `EventTypes.ts`), listo para cuando exista un flujo real de creación.

### Convive con las notificaciones del Foro del Sprint 13.1, no las reemplaza

El Foro ya tenía su propio sistema de notificaciones internas (`ForumNotification`, `/foro/notificaciones`, ver sección "Foro — Hilos de Discusión" arriba) — deliberadamente **no se tocó ni se eliminó**: `addComment`/`addReply` (`mocks/forum.ts`) siguen empujando ahí igual que antes. Este sprint solo agrega, en paralelo y desde `forum.service.ts`, la emisión de `FORUM_COMMENT_CREATED`/`FORUM_REPLY_CREATED` hacia el Event Bus, que `NotificationListener` traduce en una notificación **global** adicional. Es decir: un comentario nuevo hoy genera dos notificaciones independientes (la del Foro, scoped a `/foro/notificaciones`, y la global, en la campana del Header) — redundancia consciente para cumplir "no eliminar código / no romper módulos" sin dejar el Centro de Notificaciones incompleto. Unificarlas en un sprint futuro implicaría migrar `/foro/notificaciones` a consumir el Event Bus y retirar `ForumNotification`.

### `createActivityAsync`/`createMaterialAsync` ganan un parámetro `createdByName`

Único cambio de firma de este sprint: ambos necesitaban el nombre de quien publica para el texto de la notificación (`ACTIVITY_CREATED`/`MATERIAL_CREATED`), dato que la capa de servicios no tenía (`ActivityInput`/`MaterialInput` no lo incluyen, y los mocks no guardan un "profesor de la materia" reutilizable). Se agregó como tercer parámetro tomado de `useAuth().user?.name` en `ActivityFormPage`/`MaterialFormPage` — no se tocó el resto de la firma ni el modelo `Activity`/`Material`.

### Analítica/auditoría: punto de conexión preparado, no un proveedor real

`AnalyticsListener` (Parte 15) escucha 18 eventos de negocio y los acumula en memoria (`ANALYTICS_LOG`, tope 500). No envía nada a Mixpanel/Amplitude/un endpoint propio — es intencional: cuando exista ese proveedor, solo se reemplaza el cuerpo de `recordEntry`, sin tocar ningún módulo que emite eventos. Mismo criterio para Push (Firebase)/Email/WhatsApp/SMS/Teams/Discord/Slack: agregar un listener nuevo en `core/events/listeners/` y sumarlo a `registerAllListeners()` es la única extensión necesaria.

## Centro de Comunicación Institucional — Chat (Sprint 12, 2026-07-30)

Nuevo módulo `src/features/comunicacion` (+ `src/core/events/chatSignal.ts`, `src/types/chat.ts`, `src/mocks/chat.ts`, `src/services/chat.service.ts`, `ChatListener`). Único cambio en un componente compartido: `Sidebar` gana la entrada "Comunicación" vía `routes/navigation.ts` (dato, no el componente `Sidebar.tsx` en sí — mismo criterio que la campana de Notificaciones del sprint anterior). Reutiliza el Event Bus, `Sheet`, `Select` y `DropdownMenu` ya existentes; no se agregó ninguna librería nueva.

### Directorio de contactos por rol: la misma limitación de datos de siempre

Igual que Notificaciones/Gamificación/Foro, el MVP solo tiene una cuenta real por rol. `chat.service.ts` resuelve "con quién puede hablar cada quien" (Parte 1) así: un Alumno siempre puede hablar con la cuenta demo de Profesor y la de Administrador (`getContactsForAlumno`, hardcodeado, mismo patrón que `DEMO_PROFESOR_ID`/`DEMO_ADMIN_ID` en `NotificationListener`); un Profesor puede hablar con el roster real de sus materias — aquí sí se resuelve dinámicamente combinando `getProfessorSubjectsAsync()` con `getSubjectRosterForGamification()` (`mocks/evaluations.ts`, el mismo agregador ya usado por `gamification.service.ts` para "componer varios mocks en el servicio") — más Administración; un Administrador puede hablar con cualquier cuenta real (`MOCK_USERS`). La UI de "Nuevo mensaje" oculta la opción "Materia completa"/"Institucional" según el rol, pero la validación real vive en `createConversationAsync`, que lanza `ChatPermissionError` si el destinatario no aparece en el directorio resuelto — la UI nunca es la única barrera (Parte 15).

### Bug real detectado en verificación manual: resolver el directorio una vez, no por participante

`createConversationAsync` originalmente llamaba `assertCanMessageUser` (que a su vez resuelve el directorio completo, con sus propios `await` a materias/roster) **dentro de un `for` por cada `participantId`**. Crear una conversación de "Materia completa" con 25 alumnos multiplicaba el delay simulado de red por 25, quedándose "colgada" varios segundos — se detectó probando manualmente el flujo de Profesor → Nuevo mensaje → Materia completa. Se corrigió resolviendo `getAvailableContactsAsync` **una sola vez** antes del `for` y validando cada participante contra ese arreglo ya resuelto en memoria. Documentado aquí porque es el tipo de regresión que un `for` con `await` adentro reintroduce fácilmente.

### Dos canales de pub/sub, otra vez separados a propósito

`chatSignal.ts` es al Chat lo que `notificationSignal.ts` es a Notificaciones: un canal de solo-refresco-de-UI (`conversation-created`, `conversation-updated`, `message-sent`, `message-updated`, `reaction-changed`), deliberadamente fuera de `AppEventMap`. `ChatProvider` y `useConversationMessages` se suscriben a este canal, no al Event Bus de negocio — mismo razonamiento que en el Sprint Event Bus: evita que la capa de UI del chat conozca los eventos de dominio (`MESSAGE_SENT`, etc.) y viceversa.

### Estado del mensaje: calculado, no almacenado

`Message` no tiene un campo `status`. `getMessageStatus(message, members)` (`mocks/chat.ts`) lo deriva en cada lectura: `entregado` si el mensaje ya existe, `leido` si **todos** los demás miembros de la conversación tienen `lastReadAt >= message.createdAt`. Evita mantener un estado de lectura por-mensaje-por-destinatario (que sí tendría sentido en un backend real con múltiples clientes) — para este MVP de un solo cliente a la vez es suficiente y se recalcula solo, sin ningún job de sincronización.

### `MESSAGE_READ` se emite pero nadie lo consume todavía

`markConversationReadAsync` sí emite `MESSAGE_READ` al Event Bus (Parte 9 pide que todos los eventos listados existan), pero ningún listener de negocio reacciona a él — solo `AnalyticsListener` lo registra en su bitácora (Parte 15, "Registrar auditoría"). Es intencional: no hay today un indicador "visto por" en la UI que lo necesite; queda listo para cuando se agregue.

### Adjuntos simulados: sin carga real, mismo criterio que `MockAttachment`

`shareAttachmentAsync` no sube ningún archivo — toma `fileName`/`size` de un `<input type="file">` nativo (sin servidor detrás) y guarda solo esos metadatos, exactamente como `MockAttachment` (`types/subject.ts`) ya hacía para adjuntos de Actividades. `resolveAttachmentKind` (`features/comunicacion/utils/attachmentKind.ts`) deriva el tipo (imagen/PDF/Word/Excel/PowerPoint/ZIP/audio) por extensión de archivo, no por `mimeType` real (no existe uno real que leer).

### Borradores: la única persistencia de este sprint que sobrevive a un recargo de página

Todo el resto del estado de la plataforma vive en memoria y se pierde al recargar (documentado en cada mock desde el Sprint 12 de plantillas académicas en adelante). Los borradores son la excepción deliberada, pedida explícitamente ("si recarga la página, el borrador permanece"): `features/comunicacion/utils/drafts.ts` usa `localStorage`, con clave `ludiclass.chat.draft.{userId}.{conversationId}` — mismo mecanismo que ya usa `auth.service.ts` para la sesión (`ludiclass.auth.session`), aplicado por primera vez a datos de un módulo de negocio en vez de a la sesión misma.

### Conversaciones con contexto: campo de datos + resolución de ruta best-effort

`Conversation.contextType`/`contextId`/`contextLabel` (mejora "conversaciones con contexto", Parte 12) se guardan siempre que un botón contextual (`OpenChatButton` con esas props) crea la conversación. El botón "Ver origen" del `InfoPanel`, en cambio, solo aparece cuando `resolveContextRoute` (`features/comunicacion/utils/contextRoute.ts`) puede armar una ruta de un solo id para ese rol — por ejemplo, la vista del Profesor de una evaluación necesita también `subjectId` y `studentId`, que el contexto del chat no trae, así que ahí se muestra la etiqueta pero no el enlace. El dato de contexto nunca se pierde aunque el enlace no siempre pueda resolverse.

### `OpenChatButton`: un solo componente para los 6 puntos de entrada pedidos (Parte 14)

"Iniciar conversación" (`ProfessorEvaluationSubjectStudentsPage`), "Enviar mensaje" (`StudentSubjectDetailPage`), "Solicitar aclaración" (`StudentEvaluationDetailPage`), "Comentar reporte" (`StudentReportDetailPage` y `ProfessorReportReviewPage`), "Contactar autor" (`ForumPostDetailPage`) y "Felicitar" (`LeaderboardTable`, solo Top 3, solo Profesor/Administrador) son la misma instancia de `OpenChatButton` con distintas props — reutiliza `createConversation` (valida permisos, reabre la conversación individual existente en vez de duplicarla vía `findExistingIndividualConversation`) y, si se pasa `draftMessage`, precarga el borrador de la conversación destino antes de navegar, sin enviarlo — el usuario siempre revisa y confirma antes de enviar.

`LeaderboardTable` (compartida por Alumno/Profesor/Administrador) ganó dos props opcionales (`currentUserId`, `currentUserRole`) para el botón "Felicitar" del Top 3; sin pasarlas, se comporta exactamente igual que antes — la vista del Alumno (`StudentLeaderboardPage`) no las pasa, así que nunca ve el botón (un alumno no puede felicitar/mensajear a otro alumno, Parte 1).

### Seguridad y auditoría (Parte 15)

Toda mutación pasa por `assertMembership`/las validaciones de rol en `chat.service.ts` antes de tocar `mocks/chat.ts` — nunca se confía solo en que la UI oculte un botón (mismo criterio que Moderación del Foro, Sprint 13.2). `AnalyticsListener` es la auditoría: registra los 12 eventos de Chat (incluido `MESSAGE_READ`) tal como ya hacía con los eventos de los sprints anteriores.

## Centro de Control Administrativo (Sprint 13, 2026-07-30)

Convierte el panel del Administrador en un Centro de Control completo: 13 módulos nuevos o ampliados, todos bajo `/admin/*`. Varias de las rutas usadas (`/admin/usuarios`, `/admin/profesores`, `/admin/alumnos`, `/admin/grupos`, `/admin/carreras`) **ya existían** apuntando al `PlaceholderPage` genérico que `AppRouter.tsx` genera automáticamente para las claves de `ADMIN_SECTIONS` no presentes en `IMPLEMENTED_ADMIN_SECTIONS` — este sprint las completa agregando esas claves al set y reemplazando el placeholder por el componente real, sin tocar `navigation.ts` ni `Sidebar.tsx`.

### Auditoría: un `recordAudit` síncrono, llamado al final de cada mutación

`services/audit.service.ts#recordAudit(actor, module, action, before?, after?)` sigue el mismo criterio que `emitAppEvent` (Sprint Event Bus): síncrona, sin await, para que cualquier función de servicio pueda llamarla como último paso sin complicar su propia firma async. A diferencia del Event Bus, aquí **no** se modeló como un listener que reacciona a eventos de dominio — habría exigido crear un evento nuevo por cada acción administrativa (`CAREER_CREATED`, `GROUP_CLOSED`, etc.), inflando `AppEventMap` solo para alimentar un log. Se prefirió la llamada directa: cada función mutadora de Carreras/Materias/Grupos/Usuarios/Reportes/Evaluaciones/Leaderboard/Notificaciones/Biblioteca/Configuración/Backups termina con su propio `recordAudit(...)`, garantizando cobertura total sin depender de que alguien recuerde emitir un evento nuevo.

IP y dispositivo son simulados (`mocks/audit.ts`): la IP se deriva de un hash determinístico del `userId` (mismo usuario, misma IP simulada durante toda la sesión) y el dispositivo se parsea de `navigator.userAgent` con reglas simples — no hay telemetría real de red.

### Dashboard Ejecutivo: de KPIs sembrados a KPIs calculados en vivo

Antes de este sprint, `AdminKpis` (4 campos) venía de un bloque fijo dentro de `mocks/admin.ts`. Ahora `admin.service.ts#computeKpis()` compone `mocks/careers.ts` + `mocks/subjects.ts` + `mocks/groups.ts` + `mocks/userManagement.ts` + `mocks/reports.ts` + `mocks/evaluations.ts` + `mocks/forum.ts` + `gamification.service.ts` (18 campos) — mismo patrón de "componer varios mocks/servicios en el servicio" que ya usaba `gamification.service.ts`. El bloque `kpis` sembrado en `mocks/admin.ts` quedó reducido a ceros con un comentario explicando que siempre se sobrescribe; se mantuvo solo para no romper el tipo `AdminDashboard`.

"Usuarios activos" y "Nuevos registros" son aproximaciones honestas documentadas aquí: no existe tracking real de sesión/login, así que "activos" = `status === 'activo'` en `mocks/userManagement.ts`, y "nuevos" = alta en los últimos 30 días por `createdAt`. "Estado del sistema" es un heurístico simple (`'Atención requerida'` si algún usuario está bloqueado, si no `'Operativo'`) — no un health-check real.

### Carreras/Grupos: entidades nuevas, con IDs que se cruzan a propósito

`mocks/careers.ts` (8 carreras) reutiliza los mismos 8 nombres que `GAMIFICATION_CAREERS` (interno de `mocks/evaluations.ts`, Sprint Leaderboard) para que el catálogo de carreras se sienta consistente con el resto de la plataforma — son *nombres* iguales, no una relación de datos real (`GAMIFICATION_CAREERS` sigue sin exportarse ni importarse). `mocks/groups.ts` (4 grupos) reutiliza los mismos `groupName` ya usados en `PROFESSOR_SUBJECTS` (`mocks/subjects.ts`) por el mismo motivo. Ninguno de los dos mocks importa al otro — "sin import cruzado", mismo criterio documentado desde `mocks/evaluations.ts`.

### Materias: de solo-lectura a CRUD completo, con `ADMIN_SUBJECTS` mutable

`mocks/subjects.ts` cambió `const ADMIN_SUBJECTS` a `let` y ganó `createAdminSubject`/`updateAdminSubject`/`assignAdminSubjectProfessor`/`setAdminSubjectActive`/`deleteAdminSubject`. `AdminSubjectListItem` ganó campos opcionales (`careerId`, `careerName`, `term`, `professorId`, `professorName`, `isActive`) — opcionales para no romper `StudentSubjectListItem`/`ProfessorSubjectListItem`, que no los usan. `assignAdminSubjectProfessor` mantiene `teachers` (el arreglo histórico ya existente) sincronizado además de fijar el nuevo `professorId`/`professorName` (relación 1 profesor titular), sin eliminar el campo anterior.

### Usuarios: store propio, deliberadamente desacoplado de `mocks/users.ts`

`mocks/userManagement.ts` es un directorio de ~18 usuarios (3 cuentas reales de login marcadas `isRealAccount: true`, el resto registros administrativos sin sesión real) — mismo criterio de "datos duplicados por feature" ya usado repetidamente (`mocks/professor.ts` vs `mocks/student.ts` vs `mocks/evaluations.ts` tienen rosters parecidos pero no idénticos). Bloquear/desactivar aquí **no** afecta el login real (`auth.service.ts` no se tocó) — es una limitación de MVP documentada, no un bug: implementarlo requeriría que el flujo de login consultara este store, fuera de alcance de este sprint. "Eliminar" nunca existe como acción; solo `setUserStatusAsync` (activo/inactivo/bloqueado).

Cada usuario lleva además su propio `history: UserHistoryEntry[]` (independiente del log global de Auditoría) para que "Ver historial" muestre solo lo relevante a esa persona sin tener que indexar el log completo por usuario — cada acción de Usuarios se escribe en ambos lugares (el historial del usuario y Auditoría), pequeña duplicación deliberada a cambio de una consulta más simple.

### Centro de Reportes: enriquecido en el servicio, nunca en el mock

`admin-report.service.ts#enrich()` añade `careerName`/`professorName` a cada `WeeklyReport` cruzando por `subjectId` contra `mocks/subjects.ts` — el resultado (`AdminReportView`) es un tipo *de vista*, no se guarda. Aprobar/Rechazar/Devolver son un cambio de estado directo (`setReportStatus`, nuevo en `mocks/reports.ts`) — deliberadamente **no** reutiliza `applyEvaluation` (la evaluación completa por rúbrica que ya hace el Profesor): son casos distintos, forzar al Administrador a llenar rubricA/rubricB/badgeIds solo para cambiar un estado habría sido una fricción injustificada. "Exportar PDF" genera un HTML imprimible (`utils/export.ts#downloadPrintableHtml`), no un PDF real — no hay librería de generación de PDF en el proyecto y agregar una estaba fuera de alcance; el usuario lo convierte a PDF con "Imprimir → Guardar como PDF" del navegador. "Exportar Excel" genera CSV (que Excel/Sheets abren nativamente).

### Evaluaciones: edición auditada, sin nuevo evento de dominio

`updateEvaluationAsAdminAsync` reutiliza `recordEvaluation` (la misma función que ya usa el Profesor) — no crea una ruta de escritura paralela. El motivo obligatorio y el snapshot antes/después se resuelven completamente en Auditoría (`recordAudit`, `before`/`after` = la evaluación completa clonada) en vez de agregar un evento de Event Bus nuevo — "Ver historial" (`EvaluationHistorySheet`) filtra el log de Auditoría por `module: 'Evaluaciones'` y compara el `id` dentro de `before`/`after` contra la evaluación abierta, sin necesitar un índice dedicado.

### Leaderboard: solo se administran los datos, nunca el algoritmo

"Recalcular ranking" es casi un no-op deliberado: el ranking siempre se deriva en vivo (`buildLeaderboard`, sin cambios desde el Sprint Leaderboard) en cada lectura, así que la acción del Administrador solo confirma y audita — no hay una caché que invalidar. "Reiniciar temporada" sí es destructivo de verdad (`resetSeason()` vacía `POINT_MOVEMENTS`), con confirmación explícita en la UI. Insignias manuales (`assignBadgeManuallyAsync`/`revokeBadgeManuallyAsync`, en `gamification.service.ts` pero mutando `mocks/evaluations.ts` vía las nuevas `addBadgeToStudent`/`removeBadgeFromStudent`) son por-materia (igual que ya eran las insignias del Profesor): el Administrador elige materia y alumno antes de otorgar, porque `badgeIds` vive en la fila de roster de esa materia, no en un perfil global del alumno.

### Notificaciones: `NOTICE_SENT` extendido, no un canal nuevo

`NoticeSentPayload.scope` pasó de 3 a 7 valores posibles (`'todos' | 'carrera' | 'profesor' | 'rol'` agregados) — additivo, el manejo ya existente de avisos de materia (`'alumno' | 'grupo' | 'materia'`, Sprint Avisos del Profesor) no cambió. `NotificationListener#resolveNoticeRecipients` es la única función nueva: resuelve a qué cuentas demo notificar según el `scope`. Como el MVP solo tiene 3 cuentas reales, `'carrera'`/`'grupo'`/`'materia'` siguen cayendo en la cuenta demo de Alumno (mismo criterio de siempre); `'todos'` sí notifica a las 3, y `'rol'`/`'alumno'`/`'profesor'` con destinatario explícito resuelven exactamente a esa cuenta. La difusión en sí (`NotificationBroadcast`: borrador/programada/enviada/archivada) vive en un store separado (`mocks/notificationBroadcasts.ts`) de las `Notification`s que recibe cada usuario — una es "lo que el Administrador está componiendo", la otra es "lo que un usuario ve en su campana"; se conectan únicamente a través de `emitAppEvent('NOTICE_SENT', …)` en el momento de "Enviar ahora".

### Biblioteca: reutiliza la clasificación de archivos de Chat, no la duplica

`LibraryDocument.kind` es literalmente `AttachmentKind` (`types/chat.ts`, Sprint 12) — mismo tipo, y `resolveAttachmentKind` (`features/comunicacion/utils/attachmentKind.ts`) se importa tal cual en el formulario de subida de la Biblioteca en vez de reimplementar la detección por extensión. "Mover" no es una acción separada: es el mismo formulario de edición, cambiando carrera/materia/profesor — evita una segunda Sheet casi idéntica.

### Configuración Institucional: ruta nueva, `/admin/configuracion` sin tocar

`/admin/configuracion` ya existía y renderiza `SettingsPage` (compartida por los 3 roles, ajustes de cuenta — idioma, apariencia, seguridad, todos "Próximamente"). Como el sprint pide explícitamente ajustes *institucionales* (nombre de universidad, periodo, escalas, plantillas) que no tienen nada que ver con esa página de cuenta, se creó `/admin/institucion` como ruta **adicional** en vez de reescribir `SettingsPage` — evita tocar una pantalla compartida con Alumno/Profesor por un requerimiento que es exclusivamente del Administrador. El campo `primaryColor` se guarda pero no se aplica al tema real (ver nota en `types/institution.ts`): cambiar el theming real de la plataforma está explícitamente prohibido en este mismo sprint (Parte 14).

### Respaldos: export real, import/restore simulados a propósito

Exportar sí genera archivos reales descargables (JSON/CSV vía `utils/export.ts`) con un snapshot de los módulos de este sprint. Importar valida que el archivo sea JSON legible y lo dejaría auditado, pero **no** sobrescribe ningún store en memoria — cada mock de este sprint es independiente (`careers`, `subjects`, `groups`, `userManagement`, `library`, `institution`), y una restauración real tendría que escribir en los seis a la vez de forma atómica; simularla evita dejar la aplicación en un estado parcialmente restaurado e inconsistente si algo fallara a medias. Coincide con el pedido explícito del sprint: "Simular restauración".

### Componente nuevo: `Switch` (`components/ui/switch.tsx`)

Único primitivo de UI genuinamente nuevo del sprint — no existía un interruptor on/off en el proyecto y Configuración Institucional lo necesitaba (Leaderboard/Badges habilitado). Se construyó con el mismo primitivo `radix-ui` (ya dependencia del proyecto) y el mismo patrón `cn`/`data-slot` que el resto de `components/ui/*`, no una librería nueva.

## Perfil Alumno — UX Final del MVP (Sprint 16, 2026-08-03)

Cierra las funcionalidades pendientes del perfil Alumno para la demostración del MVP. A diferencia de los sprints anteriores (que ampliaron el panel del Administrador), este trabaja exclusivamente sobre rutas `/alumno/*` y las partes del Foro/Comunicación que el alumno consume — ningún archivo de Profesor o Administrador se modificó salvo los módulos compartidos (`chat.service.ts`, `mocks/forum.ts`, `types/library.ts`) donde la extensión es aditiva y no cambia el comportamiento ya existente para esos roles.

### Materias: la entrega es un sub-recurso de la actividad, no una evaluación

`ActivitySubmission` (`types/subject.ts`) es deliberadamente un modelo aparte del `Evaluation` completo por rúbrica que ya usa el Profesor (Sprint percentage-based evaluation) — una actividad de materia y una evaluación de competencias son conceptos distintos en esta plataforma, y forzar la entrega de una actividad a pasar por el flujo de `Evaluación` habría acoplado dos features que no comparten ciclo de vida. La entrega vive en `mocks/subjects.ts` indexada por `${activityId}:${studentId}` (compuesta a propósito, aunque el MVP solo ejercite `usr-alumno-001`, para no acoplar el store a una única cuenta). Reemplazar una entrega antes de que el profesor la evalúe mueve la versión anterior a `history` en vez de perderla — así "historial de entregas" no necesita un store adicional.

El "cierre" para editar una entrega no es la fecha de vencimiento (`dueDate`): pasarla solo marca `isLate: true` y sigue permitiendo entregar/reemplazar (como en la mayoría de LMS reales). El bloqueo real ocurre cuando `status === 'evaluado'` — a partir de ahí `StudentActivityDetailPage` oculta el formulario y muestra retroalimentación/porcentaje/insignias/observaciones. Como este sprint trabaja únicamente el perfil Alumno, no existe todavía una pantalla de Profesor para evaluar una entrega — se sembró una entrega ya evaluada (`act-102`, `mocks/subjects.ts`) para poder demostrar ese estado sin construir esa pantalla fuera de alcance.

`ActivityList` (`components/ActivityList.tsx`, compartido por Alumno/Profesor) ganó un prop `onSelect` opcional en vez de duplicarse: el Profesor sigue pasando `onEdit`/`onDelete` sin cambios, el Alumno pasa `onSelect` para navegar al detalle — nunca se usan ambos juntos, así que no hay conflicto de interacción.

### Comunicación: contactos institucionales "lógicos" sobre una sola cuenta real

La Parte 2 pide que el alumno vea "Área Académica", "Sistemas", "Control Escolar", "Finanzas" y "Soporte" como destinatarios — la plataforma no tiene una cuenta real por departamento (solo `usr-admin-001`). `getContactsForAlumno()` (`chat.service.ts`) genera 5 `ChatContact` con id lógico `usr-admin-001::N` y `subtitle` distinto, y `createConversationAsync` resuelve ese id de vuelta a `usr-admin-001` (`resolveRealContactId`) antes de crear la conversación — el alumno ve 5 opciones para elegir con quién "quiere hablar", pero técnicamente comparten el mismo hilo/bandeja de administración, mismo criterio de cuenta demo única que el resto del proyecto. Como el directorio del alumno nunca incluyó a otros alumnos (`getContactsForAlumno` solo devolvía Profesor + Administración desde el Sprint 12), la restricción "no puede iniciar conversaciones con otros alumnos" ya estaba garantizada por construcción; este sprint solo amplía las opciones institucionales visibles.

"Solicitar grupo de conversación" es una solicitud (`GroupConversationRequest`, nuevo store en `mocks/chat.ts`), no una conversación: el alumno no tiene visibilidad del roster de una materia (esa vista es del Profesor/Administrador), así que no puede elegir compañeros directamente. La solicitud lleva materia + motivo y siempre se dirige a `DEMO_PROFESOR` (única cuenta real de Profesor). Al aceptar, el Profesor elige compañeros de su propio directorio (`contacts` ya resuelto por `chat.service.ts`, filtrado por `subtitle === subjectName`) y `acceptGroupRequestAsync` reutiliza `createConversationAsync` tal cual (tipo `'grupal'`, `createdBy` = profesor) — el profesor queda como moderador porque `insertConversation` ya asigna `role: 'admin'` a quien crea la conversación, sin necesitar lógica nueva de moderación.

### Foro: tipo de adjunto propio, no una extensión de `AttachmentKind`

`ForumAttachmentKind` (`types/forum.ts`) es un tipo independiente de `AttachmentKind` (`types/chat.ts`, Sprint 12), aunque se solapan en la mayoría de valores. La razón: el Foro necesita `'video'` y `'enlace'`, que `AttachmentKind` no maneja, y agregarlos ahí obligaría a tocar `KIND_MESSAGE_TYPE`/`eventNameForAttachment` (`features/comunicacion/utils/attachmentKind.ts`) — lógica de Chat ya evaluada y estable de un sprint anterior, fuera de alcance de este. `features/foro/utils/attachmentKind.ts` es una copia deliberadamente pequeña de esa utilidad (mismo patrón "duplicación aceptada entre features" ya usado por `mocks/userManagement.ts` vs `mocks/users.ts`).

La restricción "comentarios solo admiten imágenes" se aplica en la UI (`ForumAttachmentPicker` con `imagesOnly`, usado por `CommentForm` pero no por `PostForm`) y no en el tipo — `ForumComment`/`ForumReply` reutilizan el mismo `ForumAttachment[]` que `ForumPost`. No se agregó validación en `mocks/forum.ts` porque la única vía de escritura es `CommentForm`, que ya restringe el selector de archivos a `accept="image/*"`.

### Cursos Asignados / Certificaciones: Certificaciones no tiene store propio

`listCertificates()` (`mocks/courses.ts`) deriva las certificaciones filtrando `AssignedCourse[]` por `status === 'finalizado'` en cada lectura, en vez de mantener un array `Certificate[]` separado que se escriba al completar un curso — evita el bug de sincronización clásico ("marqué el curso como terminado pero el certificado no aparece") por construcción: no hay dos fuentes de verdad que puedan desalinearse. `markCourseCompletedAsync` es una acción de autoservicio del alumno (no existe todavía una pantalla de administración de cursos), pensada explícitamente para poder demostrar en vivo, durante el MVP, que completar un curso hace aparecer el certificado de inmediato.

### Producto de Titulación: placeholder estructurado, no `PlaceholderPage`

El sprint pide un "placeholder funcional preparado para backend", distinto del `PlaceholderPage` genérico (`components/PlaceholderPage.tsx`) que ya usa el router para secciones del Administrador sin construir — ese componente solo muestra "Disponible próximamente" y no tiene forma de exhibir datos. `StudentTitulacionPage` sí renderiza datos reales (mock): porcentaje, fases, entregables, estado, observaciones — la palabra "placeholder" aquí describe que **no hay automatización todavía** (nada calcula `progressPercentage` a partir de reportes/evaluaciones reales), no que la pantalla esté vacía. `getTitulacionProjectAsync()` (`services/titulacion.service.ts`) documenta explícitamente esa intención futura en su comentario, para que conectar reportes semanales/evaluaciones/entregables reales no requiera cambiar la firma pública. `progressPercentage: 72` en el mock coincide a propósito con el `titulacionProgress` ya sembrado para `usr-alumno-001` en `mocks/evaluations.ts` (Sprint Leaderboard) — mismo alumno, mismo número, sin import cruzado entre ambos mocks.

### Biblioteca/Recursos del Alumno: categorías aditivas sobre el mismo store

En vez de crear un segundo catálogo de documentos para el alumno, `StudentLibraryPage` reutiliza `library.service.ts`/`mocks/library.ts` tal cual (Sprint 13) en modo solo lectura — mismo dato, una vista distinta por rol, sin duplicar CRUD. `LIBRARY_CATEGORIES` (`types/library.ts`) creció de 5 a 12 valores agregando las 7 que pide este sprint (Reglamentos, Manuales, Recursos Institucionales, Casos de estudio, Plantillas, Clases grabadas, Material complementario) sin quitar las originales — el formulario del Administrador (`LibraryFormSheet`) simplemente ofrece más opciones en su `Select`, ningún documento ni comportamiento previo cambia. "Clases grabadas" necesitaba un dato que `LibraryDocument` no tenía (duración): se agregó `durationMinutes` como campo opcional — presente solo en esa categoría, `undefined` en el resto, y `updateDocument` (`mocks/library.ts`) nunca lo toca porque el formulario del Administrador no lo captura, así que una edición no puede borrarlo por accidente.

### Componente nuevo: `Checkbox` (`components/ui/checkbox.tsx`)

Segundo primitivo de UI nuevo del proyecto (después de `Switch`, Sprint 13): no existía un checkbox y `GroupRequestsSheet` lo necesitaba para que el Profesor eligiera varios compañeros al aceptar una solicitud de grupo. Mismo criterio que `Switch` — primitivo `radix-ui` ya instalado, mismo patrón `cn`/`data-slot`, sin librería nueva.

## Modelo Académico Imperalianz (Sprint 17, 2026-08-03)

Convierte el panel del Profesor en centro de seguimiento académico y reconstruye Evaluación según el Modelo Educativo. A diferencia de los sprints anteriores (17 partes, todas dentro del alcance ya autorizado explícitamente por el propio sprint, incluyendo el cambio de menú lateral), aquí se tocaron los tres perfiles a la vez — el criterio rector fue "reutilizar antes que reconstruir": el motor de rúbricas, el ledger de puntos y el Leaderboard derivado en vivo ya existían con la forma correcta desde sprints anteriores; este sprint los conecta entre sí en vez de rehacerlos.

### Motor de Rúbricas: una fórmula, reutilizada en dos capas

`utils/rubric.ts#scoreRubric(criteria, scores, bonus)` es la única función que calcula %/letra a partir de una rúbrica dinámica: suma el peso de cada criterio ponderado por el factor de su nivel (`RUBRIC_LEVEL_FACTOR`, `types/rubric.ts`: excelente=1, bueno=0.85, suficiente=0.7, insuficiente=0.4), agrega la bonificación y convierte a letra con `percentageToReportLevel` (`utils/reportGrade.ts`, ADR-008) — no se definió una cuarta escala. Esta misma función alimenta dos usos independientes: Rúbrica A/Rúbrica B dentro de una Evaluación (`RUBRIC_A_CRITERIA`/`RUBRIC_B_CRITERIA`, `types/evaluation.ts`) y, a futuro, la rúbrica ya existente de Actividades (`RubricCriterion`, `types/subject.ts`, Sprint 16) sin necesitar cambios — ambas comparten el mismo tipo de resultado (`RubricScoreResult`).

### Evaluación: dos escalas coexisten a propósito (ver ADR-011)

`StudentEvaluation`/`StudentEvaluationDetail` ahora cargan tanto la escala de 8 niveles por competencia (`Competency.currentLevel`, sin tocar desde RN-005/ADR-007) como el nuevo % final de 5 niveles (`finalPercentage`/`finalLetter`, calculado como `calculateFinalPercentage(rubricA%, rubricB%, bonus)` — la misma fórmula 70/30 que ya usaba la Evaluación Docente de Reportes, ADR-008). No son la misma cosa: las competencias miden habilidades individuales, la Rúbrica A/B mide el desempeño oficial de la evaluación completa. `mocks/evaluations.ts#recordEvaluation` acepta un quinto parámetro `extra` opcional — cuando está ausente (como en la edición del Administrador, `updateEvaluationAsAdminAsync`, Sprint 13) el `apply()` interno conserva la Rúbrica A/B ya guardada en vez de borrarla, así que ninguna ruta de escritura preexistente pierde datos.

"Intentos" se incrementa en `apply()` de forma incondicional en cada guardado (tanto del profesor como del Administrador) — se documenta como "veces que se guardó la evaluación", no como "reintentos de un examen", por ser lo único medible sin inventar un concepto nuevo de "intento del alumno" que el sprint no definió. "Observaciones" es deliberadamente un campo interno del profesor (no lo ve el alumno) — distinto de "Retroalimentación" (sí la ve, existente desde el Sprint Demo Profesor) — porque el sprint las lista como dos campos separados y la única forma de que sean semánticamente distintas es que tengan audiencias distintas.

### Actividades y Materiales: ocultar/programar se resuelve en la capa de lectura, no en la de escritura

`isHidden`/`openDate` (Activity) y `isHidden`/`scheduledAt` (Material) se filtran una sola vez, dentro de `mocks/subjects.ts#getSubjectDetail` para `role === 'alumno'` — el Profesor y el Administrador siempre ven todo (incluidas las ocultas/programadas, para poder gestionarlas). Esto evita que cada pantalla del alumno (dashboard, detalle de materia, detalle de actividad) tenga que reimplementar el mismo filtro. "Duplicar" una actividad (`duplicateActivity`) crea la copia con `isHidden: true` siempre — nunca publica una copia por accidente; el profesor decide cuándo mostrarla.

### Producto de Titulación: de placeholder de solo lectura a CRUD real, sin store duplicado

El Sprint 16 dejó un mock de solo lectura por alumno (`getTitulacionProject()`, sin parámetros). Este sprint lo reescribe como `Record<string, TitulacionProject>` indexado por `studentId` con mutaciones reales: `saveDeliverableDraft` (borrador), `submitPhase` (envío del alumno) y `reviewPhase` (aprobación/rechazo del profesor) — las tres viven en `mocks/titulacion.ts` y recalculan `progressPercentage` (fases aprobadas / total) tras cada cambio de estado de fase, nunca a mano desde la UI. Los tres roles comparten un único componente de presentación, `components/TitulacionProjectPanel.tsx`, con un prop `mode: 'alumno' | 'profesor' | 'readonly'` que decide qué acciones mostrar — evita triplicar la UI de fases/entregables/historial para cada rol, mismo criterio que `LeaderboardTable`/`RubricEditor` (componentes de un solo archivo, reutilizados por los tres roles vía props).

"Se alimenta automáticamente de reportes/evaluaciones/actividades" (texto literal del sprint) se resolvió como enlace de evidencia (`TitulacionEvidenceRef`: tipo + etiqueta + link al origen, ver el entregable sembrado de ejemplo enlazado a `rep-101`) en vez de cálculo automático de avance — calcular `progressPercentage` a partir de reportes/evaluaciones reales requeriría definir reglas de correspondencia fase↔reporte que el sprint no especificó; documentado como alcance deliberadamente reducido, mismo criterio que Sprint 16 usó para el mismo módulo.

### Cursos y Certificaciones: un componente, tres rutas, un solo `canManage`

`CursosCertificacionesPanel` (nuevo) reemplaza la lógica que antes vivía directamente dentro de `StudentCoursesPage`/`StudentCertificatesPage` (Sprint 16) — ambas páginas del Alumno ahora son wrappers de una línea que solo fijan la pestaña inicial, preservando las dos rutas históricas (`/alumno/cursos`, `/alumno/certificaciones`) para no romper enlaces ya compartidos. `ProfessorCoursesPage`/`AdminCoursesPage` (nuevas) reutilizan el mismo panel con `canManage` ausente (por defecto `false`): ocultan el botón "Marcar como completado" pero muestran el mismo catálogo — el mock de `course.service.ts` (Sprint 16) nunca modeló inscripciones por alumno, así que "solo lectura del mismo catálogo" es la única vista honesta posible para Profesor/Administrador sin inventar un modelo de datos nuevo fuera de alcance.

### Biblioteca del Profesor: extracción de un componente ya usado por el Alumno

`StudentLibraryPage` (Sprint 16) se dividió en `components/LibraryReadOnlyView.tsx` (toda la lógica y UI, parametrizada por `homeTo` para el breadcrumb) + un wrapper de una línea; `ProfessorLibraryPage` (nueva) es el mismo wrapper con `homeTo="/profesor"`. Sin este paso intermedio, agregar Biblioteca de solo lectura al Profesor habría significado copiar ~200 líneas idénticas.

### Comunicación: grupo privado del Profesor reutiliza `createConversationAsync` sin cambios

`NewConversationPanel` gana un modo `grupo_privado` (solo Profesor): título + lista de alumnos de su propio directorio (`contacts`, ya resuelto por `chat.service.ts` desde el Sprint 12) con `Checkbox` por alumno. Al enviar, llama a `createConversation({ type: 'grupal', ... })` — la misma función que ya usa "Materia completa"; no se tocó `chat.service.ts` porque `createConversationAsync` nunca restringió al Profesor a un tipo de conversación (solo restringe al Alumno a `'individual'`), y `insertConversation` ya asigna `role: 'admin'` a quien crea la conversación — el profesor queda como moderador sin lógica nueva.

### Gamificación/Leaderboard: se verificó, no se reconstruyó

El Ledger (`mocks/gamification.ts#recordPointMovement`, insert-only) y el Leaderboard derivado en vivo (`gamification.service.ts#buildLeaderboard`, recalculado en cada lectura) ya cumplían "nunca modificar el total directo, siempre registrar una transacción" desde el Sprint Leaderboard — no se cambió esa arquitectura. Lo que sí faltaba: `LeaderboardListener` solo recalculaba/notificaba ante `POINTS_GRANTED`/`POINTS_REMOVED`; se agregaron `REPORT_SUBMITTED` y `GRADE_UPDATED` (publicada) a la misma función `recalculateAndEmit` (que ahora resuelve `studentName` desde la fila del Leaderboard en vez de recibirlo por parámetro, ya que `GradePayload` no lo incluye). `BADGE_GRANTED` no se agregó: su payload (`BadgePayload`) no incluye `subjectId`, y el Leaderboard ya refleja las insignias nuevas en la siguiente lectura de todos modos (`badgeIds` se recalcula en vivo dentro de `buildLeaderboard`), así que el evento adicional no aportaría una recalculación que no ocurriera ya.

`recordPointMovementAsync` (`gamification.service.ts`) ganó un parámetro `actor` opcional para auditar cada movimiento — antes solo las acciones de administración del Leaderboard (Sprint 13) quedaban auditadas, no el registro de puntos del día a día del profesor. La acción del catálogo `empresa_nueva` se relabeló a "Convenio" (terminología oficial del sprint) sin tocar su `id` interno, para no invalidar los movimientos ya sembrados que la referencian.

## Producto de Titulación — Core Académico (Sprint 18, 2026-08-03)

Convierte el Producto de Titulación (CRUD funcional desde el Sprint 17) en el núcleo del modelo académico: versionado con historial completo, retroalimentación tipada por fase, archivos con 9 tipos y versión propia, sincronización automática desde el resto de la plataforma, y una capa de repositorio/adaptador que prepara el módulo para un backend real sin conectarlo todavía (ver ADR-012).

### Modelo de datos

`types/titulacion.ts` (reescrito completo, `TitulacionProject` → `TitulacionProduct`):

```
TitulacionProduct                         (uno por alumno, studentId como clave)
├── Información general: objective, status, careerId/Name, subjectId/Name,
│   professorId/Name, version, createdAt, updatedAt
├── Avance automático: progressPercentage, completedDeliverables,
│   pendingDeliverables, competencies[]   (siempre recalculado, nunca capturado a mano)
├── observations                          (observación general del profesor)
├── phases: TitulacionPhase[]
│   ├── title, description, objectives[], status, date, version
│   ├── versions: TitulacionVersionSnapshot[]   (append-only, nunca se sobrescribe)
│   │   └── version, authorId/Name, createdAt, comment, changesSummary
│   ├── feedback: TitulacionFeedbackEntry[]
│   │   └── type (comentario|aprobacion|rechazo|solicitud_cambios|observacion), authorId/Name, content, createdAt
│   └── deliverables: TitulacionDeliverable[]
│       ├── status, dueDate, draftContent, submittedAt
│       ├── files: TitulacionFile[]
│       │   └── kind (pdf|word|excel|powerpoint|zip|imagen|video|audio|enlace), version, uploadedById/Name, uploadedAt, url
│       └── evidence: TitulacionEvidenceRef[]   (adjuntada por TitulacionSyncListener)
└── history: TitulacionHistoryEntry[]     (append-only)
    └── actorId/Name, action (14 valores), detail, source, phaseId, createdAt
```

### Repositorio y adaptador (preparar backend, sin conectarlo)

`repositories/titulacion.repository.ts` define la interfaz `TitulacionRepository` (13 operaciones: `getProduct`, `listProducts`, `saveDeliverableDraft`, `publishPhase`, `duplicatePhaseVersion`, `addPhaseFeedback`, `reviewPhase`, `addProductObservation`, `attachEvidence`, `recordFileDownload`, `reassignProfessor`, `unlockPhase`, `setProductStatus`) y `getTitulacionRepository()`, el único punto que resuelve la implementación concreta. `repositories/adapters/titulacion.mock-adapter.ts` implementa `TitulacionMockAdapter` con el store en memoria (antes vivía suelto en `mocks/titulacion.ts`, retirado en este sprint) — toda mutación pasa por `recomputeProduct()` (recalcula avance/entregables) y `pushHistory()` (agrega una entrada, nunca sobrescribe). `services/titulacion.service.ts` depende únicamente de `getTitulacionRepository()`; sigue siendo el único lugar que conoce el Event Bus y `recordAudit` — el repositorio y el adaptador no conocen ninguno de los dos, mismo aislamiento que `services/*.service.ts` ya mantiene frente a `mocks/*.ts` en el resto del proyecto.

### Diagrama de flujo — publicar y revisar una fase

```
Alumno (StudentTitulacionPage)
  └─ guarda borrador ─────────▶ titulacion.service#saveTitulacionDraftAsync
                                       └─▶ repository#saveDeliverableDraft ─▶ recomputeProduct()

  └─ publica versión final ───▶ titulacion.service#publishTitulacionPhaseAsync
                                       ├─▶ repository#publishPhase
                                       │     ├─ incrementa phase.version, agrega TitulacionVersionSnapshot
                                       │     ├─ marca entregables con contenido como "enviado"
                                       │     ├─ pushHistory("publico")
                                       │     └─ recomputeProduct()
                                       └─▶ emitAppEvent(TITULACION_PHASE_SUBMITTED)
                                             └─▶ NotificationListener ─▶ notifica al profesor asignado

Profesor (ProfessorTitulacionPage)
  └─ aprueba/rechaza fase ─────▶ titulacion.service#reviewTitulacionPhaseAsync
                                       ├─▶ repository#reviewPhase
                                       │     ├─ phase.status = aprobada|rechazada
                                       │     ├─ agrega TitulacionFeedbackEntry (aprobacion|rechazo)
                                       │     ├─ pushHistory("aprobo"|"rechazo")
                                       │     └─ recomputeProduct()
                                       ├─▶ recordAudit(actor, 'Producto de Titulación', …)
                                       └─▶ emitAppEvent(TITULACION_PHASE_REVIEWED)
                                             └─▶ NotificationListener ─▶ notifica al alumno
```

### Sincronización automática — un solo sentido, sin acoplar los módulos fuente

`core/events/listeners/TitulacionSyncListener.ts` (nuevo) se suscribe a eventos que **ya emitían** otros módulos — ninguno de ellos importa ni conoce Titulación, el acoplamiento va en un solo sentido, igual que `NotificationListener`/`LeaderboardListener`:

| Evento (ya existente) | Emisor | Condición | Evidencia adjuntada (`kind`) |
|---|---|---|---|
| `REPORT_SUBMITTED` | `teacher-report.service.ts` | siempre | `reporte` |
| `GRADE_UPDATED` | `evaluation.service.ts` | `status === 'publicada'` | `evaluacion` |
| `ACTIVITY_SUBMITTED` | `subject.service.ts` | siempre | `actividad` |
| `BADGE_GRANTED` | `evaluation.service.ts` | siempre | `badge` (se agrega también a `product.competencies`) |
| `LEADERBOARD_UPDATED` | `gamification.service.ts` | `enteredTop3 === true` | `leaderboard` |
| `COURSE_COMPLETED` (nuevo) | `course.service.ts#markCourseCompletedAsync` | primera vez que pasa a "finalizado" | `curso` |

Cada suscripción llama a `titulacion.service#attachTitulacionEvidenceAsync(studentId, evidence, historyDetail, sourceModule)`, el único punto de entrada de sincronización del repositorio (`attachEvidence`): agrega la evidencia al primer entregable no aprobado, agrega la competencia si aplica, y registra una entrada de historial con `actorId: 'system'`, `source: "Sync · <módulo>"`. `COURSE_COMPLETED` se agregó a `EventTypes.ts`/`course.service.ts` en este sprint porque el catálogo de Cursos (Sprint 16) no emitía eventos todavía; como el mock no distingue alumno, se asocia a la única cuenta real de Alumno del MVP (`usr-alumno-001`).

### UI: tres componentes nuevos, extraídos para no romper el límite de 250 líneas

`components/TitulacionProjectPanel.tsx` (reescrito) orquesta tres piezas nuevas en vez de crecer en un solo archivo: `TitulacionPhaseCard.tsx` (una fase: entregables, borrador, adjuntar archivo tipado, publicar versión, comparar versiones, retroalimentación, aprobar/rechazar), `TitulacionHistoryPanel.tsx` (historial global) y `TitulacionFileUploader.tsx` (selector de 9 tipos de archivo + versionado por nombre, reutilizado dentro de `TitulacionPhaseCard`). El panel sigue compartido por los 3 roles vía `mode: 'alumno' | 'profesor' | 'readonly'`, mismo criterio que el Sprint 17. Las acciones exclusivas del Administrador (reasignar profesor, desbloquear fase, editar estado, cerrar producto, exportar) viven en una tarjeta aparte dentro de `AdminTitulacionPage.tsx`, no dentro del panel compartido, para no acoplar capacidades de un solo rol al componente que usan los otros dos.

### Exportación: arquitectura preparada, sin implementar (Parte 15 del sprint)

`services/export/titulacionExport.adapter.ts` (nuevo) define `TitulacionExportAdapter` (un método, `exportProduct(productId, format)`) con una única implementación stub que devuelve `{ ready: false, message }` — mismo patrón de adaptador que el repositorio, para que conectar generación real de PDF/Word o un repositorio institucional sea escribir un segundo adaptador y cambiar `getTitulacionExportAdapter()`, sin tocar `AdminTitulacionPage.tsx`.

## Centro de Gestión Universitaria — Rediseño del Administrador (Sprint 19, 2026-08-04)

Convierte el panel del Administrador en un Centro de Gestión Universitaria: cada módulo pasa de "mostrar información" a "permitir una acción real", consolidando 17 accesos rápidos dispersos en 9, sin tocar el Sidebar ni la autenticación. Ver ADR-013 (`docs/DECISIONS.md`) para el razonamiento completo de cada decisión de alcance.

### Mapa de navegación del Administrador

```
Sidebar (routes/navigation.ts — SIN CAMBIOS este sprint)
├── Inicio                        → /admin
├── Materias                      → /admin/materias
├── Cursos y Certificaciones      → /admin/cursos
├── Biblioteca                    → /admin/biblioteca         (ahora Gestor Documental)
├── Producto de Titulación        → /admin/titulacion
├── Evaluaciones                  → /admin/evaluaciones
├── Foro                          → /foro                     (pestaña "Moderación" solo Admin)
└── Comunicación                  → /comunicacion

Dashboard → "Módulos" (dashboard-admin/admin-sections.ts — 17 → 9 entradas)
├── Usuarios                      → /admin/usuarios           (+ /admin/alumnos/:id/expediente)
├── Gestión Académica (nuevo)     → /admin/academico
├── Centro de Incidencias (nuevo) → /admin/incidencias
├── Leaderboard                   → /admin/leaderboard
├── Centro de Notificaciones      → /admin/notificaciones
├── Configuración Institucional   → /admin/institucion         (+ placeholders "Configuración General")
├── Auditoría (tool)              → /admin/auditoria
├── Respaldos (tool)              → /admin/backups
└── Generador de Matrículas (tool)→ /admin/matriculas

Retirado del Dashboard, con ruta que sigue existiendo (referenciada desde Gestión Académica o ya no registrada):
- /admin/carreras, /admin/grupos, /admin/reportes → enlazadas desde "Gestión Académica"
- /admin/moderacion → ELIMINADA, absorbida como pestaña dentro de /foro
```

### Dashboard Ejecutivo: indicadores curados, no un volcado de KPIs

`types/admin.ts#AdminExecutiveIndicators`/`AdminAlert` + `admin.service.ts#computeExecutiveIndicators()`/`computeAlerts()` reemplazan el `KpiGrid` de 18 tarjetas: 9 indicadores (usuarios activos, alumnos/profesores conectados, solicitudes pendientes, reportes por revisar, evaluaciones pendientes, titulación pendiente, tickets abiertos, estado de la plataforma) más una tarjeta de Alertas con reglas concretas (cuentas bloqueadas → crítica, incidencias de prioridad alta sin resolver → advertencia, más de 10 reportes acumulados → informativa). "Conectado" se aproxima con `ManagedUser.lastLoginAt` dentro de una ventana de 15 minutos (`ONLINE_WINDOW_MS`) — no hay presencia en tiempo real en este MVP. `AdminKpis`/`computeKpis()` (Sprint 13) se conservan intactos como motor interno, reutilizados también por `getAcademicSummaryAsync()` del hub de Gestión Académica.

### Gestión de Usuarios: alta, matrícula, último acceso

`ManagedUser` gana `matricula?`/`lastLoginAt?`; `createManagedUserAsync` (nuevo, `mocks/userManagement.ts#createManagedUser`) es la primera función de Alta del módulo — antes solo existían edición/estado/reset/asignación. `lastLoginAt` se actualiza automáticamente: `AuditListener` (nuevo, `core/events/listeners/AuditListener.ts`) escucha `USER_LOGIN` (que `AuthProvider.tsx` ya emitía desde el Sprint del Event Bus) y llama a `recordUserLoginAsync`, sin que `userManagement.service.ts` conozca la autenticación ni viceversa.

### Expediente Académico: agregación de lectura, sin nuevo store

`features/expediente-admin/pages/StudentRecordPage.tsx` (`/admin/alumnos/:studentId/expediente`) no introduce un nuevo modelo de datos — hace `Promise.all` sobre 8 servicios ya existentes (`userManagement`, `evaluation`, `admin-report`, `titulacion`, `course`, `gamification`, `incident`, `audit`) y los presenta en pestañas. Es deliberadamente un agregador de lectura: cualquier acción (aprobar, reasignar, etc.) sigue viviendo en su módulo de origen.

### Gestión Académica: hub de resumen + dos módulos nuevos

`/admin/academico` (`features/academico-admin/`) tiene 4 pestañas: "Resumen y accesos" (tarjetas con conteos en vivo + enlace a Carreras/Materias/Grupos/Evaluaciones/Reportes/Titulación/Leaderboard/Cursos, todos módulos ya existentes sin tocar), "Planes de Estudio" y "Cuatrimestres" (CRUD nativo nuevo — `types/academicPlan.ts`, `mocks/academicPlans.ts`, `services/academicPlan.service.ts`, mismo patrón mocks→service que el resto del proyecto), y "Rúbricas" (referencia de solo lectura de `RUBRIC_A_CRITERIA`/`RUBRIC_B_CRITERIA`/`RUBRIC_LEVEL_FACTOR` del Sprint 17 — no un catálogo editable aparte, las rúbricas siguen siendo dinámicas por evaluación).

### Biblioteca → Gestor Documental: versionado y programación, sin backend de archivos real

`types/library.ts`: `LIBRARY_CATEGORIES` pasa de 12 a 16 (suma Biblioteca Digital/Videos/Presentaciones/Archivos de apoyo, aditivo). `LibraryDocument` gana `tags: string[]`, `version`/`versions: LibraryVersionEntry[]` (append-only — `replaceLibraryDocumentFileAsync` empuja la versión anterior al historial y nunca la sobrescribe, mismo patrón que `TitulacionFile`/Sprint 18) y `publishAt?`/`expiresAt?`. `isLibraryDocumentPublished(document, now)` es la única función que decide visibilidad fuera de Administración — `LibraryReadOnlyView.tsx` (Alumno/Profesor) filtra con ella antes de renderizar; `AdminLibraryPage.tsx` sigue mostrando todo, con una insignia "Programado" para lo aún no visible.

### Centro de Incidencias: ingesta automática + alta manual

`types/incident.ts`/`mocks/incidents.ts`/`services/incident.service.ts` (nuevos) modelan `Incident` con `origin` (`foro`|`academica`|`tecnica`|`administrativa`), `status`, `priority`, `responsibleName?` e `history[]`. `core/events/listeners/IncidentSyncListener.ts` (nuevo) se suscribe a `FORUM_POST_REPORTED`/`FORUM_COMMENT_REPORTED` (ya emitidos por `forum.service.ts` desde el Sprint 13.2) y llama a `createIncidentAsync` con `origin: 'foro'` — el Foro no importa ni conoce Incidencias. Las solicitudes académicas/técnicas/administrativas no tienen todavía un formulario de origen en Alumno/Profesor (alcance reducido, ver ADR-013); se dan de alta manualmente desde `AdminIncidentsPage.tsx`.

### Auditoría: cobertura real, sin tocar autenticación

`types/audit.ts`: `AuditModule` gana `'Sesión'`/`'Foro'`/`'Incidencias'`/`'Gestión Académica'`; `role` pasa a opcional para admitir entradas anónimas; `AuditLogEntry` gana `browserSimulated`/`osSimulated`/`locationSimulated` (simulados igual que `ipSimulated`, `device` se conserva por compatibilidad). `AuditListener.ts` registra inicio/cierre de sesión reaccionando a `USER_LOGIN`/`USER_LOGOUT` — eventos que `AuthProvider.tsx` ya emitía, así que ni ese archivo ni `auth.service.ts` se modificaron. Los intentos fallidos sí necesitaron una línea nueva en `LoginForm.tsx` (`recordAnonymousAudit` dentro del `catch` ya existente, sin tocar la validación) porque no había otro punto observable. `forum.service.ts` gana llamadas a `recordAudit(actor, 'Foro', …)` en las 5 mutaciones de moderación, que antes no auditaba ninguna.

### Foro + Moderación: fusión por extracción de componente

`features/moderacion-admin/components/ModerationPanel.tsx` (nuevo) es el cuerpo de la antigua `ModerationCenterPage.tsx` (ahora eliminada) sin `PageHeader` propio. `ForumListPage.tsx` monta una barra de pestañas "Publicaciones"/"Moderación" solo cuando `user.role === 'administrador'`; Alumno/Profesor ven exactamente la misma vista de `/foro` que antes. La ruta `/admin/moderacion` se eliminó de `AppRouter.tsx` y de `admin-sections.ts`.

### Configuración General: placeholders explícitos, sin servicio

Nueva sección dentro de `AdminInstitutionSettingsPage.tsx` (borde punteado, insignia "Próximamente"): campos deshabilitados para Correo (SMTP)/Zoom/Google Workspace/otras integraciones/notificaciones push/seguridad (2FA). No llaman a ningún servicio — es intencionalmente inerte, preparado para el Administrador Maestro (Sprint 20).

### RBAC: un único punto de decisión, sin restricciones activas

`types/permissions.ts` define `PermissionKey` (9 valores, uno por sección de `admin-sections.ts`); `utils/permissions.ts#hasPermission(role, permission)` es la única función que decide acceso — hoy siempre `true` para `administrador`. `AdminDashboardPage.tsx#buildQuickAccess` filtra las tarjetas llamando a `hasPermission`, no comparando `role === 'administrador'`. El Sprint 20 puede introducir un mapa real de niveles cambiando únicamente este archivo.

## RBAC Completo — Administrador Maestro (Sprint 20, 2026-08-04)

Reemplaza el rol único "Administrador" por una jerarquía completa: Administrador Maestro → Administradores → Roles → Permisos → Módulos. Ver ADR-014 (`docs/DECISIONS.md`) para el razonamiento de cada decisión de alcance, `docs/RBAC.md` para el modelo funcional y `docs/PERMISSIONS.md` para el catálogo completo de permisos.

### Modelo de datos: catálogo, roles y asignaciones

`types/rbac.ts` (nuevo) define tres piezas independientes:
- `PERMISSION_MODULES`: 20 módulos, cada uno con su propio arreglo de acciones (`{ key: 'usuarios', label: 'Usuarios', actions: ['ver', 'crear', ...] }`). Un `PermissionKey` es siempre `"modulo.accion"` (ej. `usuarios.reiniciar_contrasena`), validado en runtime por `isValidPermission()` — no se modeló como unión de tipos estricta porque la combinatoria (20 módulos × hasta 9 acciones) la hacía frágil de mantener a mano.
- `RoleDefinition`: nombre/descripción/color/ícono/`isSystem`/estado (`activo`/`inactivo`)/`permissions: PermissionKey[]`. Los 6 roles predefinidos (`mocks/rbac.ts`) tienen `isSystem: true`, lo que bloquea edición/eliminación/cambio de estado en `rbac.service.ts` (`updateRole`/`deleteRole`/`setRoleStatus` devuelven `null`/`false` de inmediato).
- `AdminRoleAssignment`: qué rol tiene cada administrador (`adminUserId` → `roleId`) más `customPermissions: PermissionKey[]` — permisos adicionales que ese administrador tiene más allá de su rol.

### Permisos efectivos: unión pura, capa de servicio separada de la capa pura

`services/rbac.service.ts#getEffectivePermissionsAsync(adminUserId)` calcula `Array.from(new Set([...role.permissions, ...assignment.customPermissions]))` — un permiso personalizado nunca resta lo que el rol ya concede, solo agrega (ver ADR-014). Si el rol está `inactivo`, devuelve `[]`. `utils/permissions.ts` (reescrito, reemplaza el stub del Sprint 19) queda como capa puramente de utilidades: `hasPermission`/`hasModuleAccess`/`isValidPermission` operan sobre un arreglo de `PermissionKey[]` ya resuelto, sin acceso a datos — mismo patrón mocks→services→utils del resto del proyecto.

### Los 6 roles predefinidos

```
Administrador Maestro    — todos los permisos (allPermissions()), irrestricto, isSystem
Soporte Técnico          — usuarios.bloquear/reactivar/reiniciar_contrasena, auditoria.consultar,
                            seguridad.consultar, configuracion.api/integraciones
Control Escolar          — usuarios.ver/crear/editar/eliminar/exportar, materias.ver/editar/
                            asignar/cambiar_plan, carreras.ver/gestionar_plan, reportes.ver
Coordinador Académico     — evaluaciones.ver/aprobar_cambios/rechazar_cambios, reportes.ver/
                            retroalimentar/aprobar, titulacion.ver/gestionar, incidencias.ver/
                            gestionar, materias.cambiar_profesor
Finanzas                  — finanzas.pagos/becas/estados_cuenta/facturacion/descuentos/historial
                            (permisos preparados, sin módulo de Finanzas construido — ver ADR-014)
Atención Estudiantil     — incidencias.ver/gestionar, comunicacion.gestionar_conversaciones/
                            enviar_anuncios, notificaciones.ver — rol por defecto de nuevos administradores
```

### Gestión de Administradores y herencia de permisos

`/admin/administradores` (`AdminAdministratorsPage.tsx`, nuevo) lista cada administrador con rol/estado/último acceso/conteo de permisos heredados vs. personalizados; `AdminAssignSheet.tsx` (nuevo) permite cambiar el rol (autoguarda al seleccionar) y editar permisos personalizados vía `PermissionMatrix` — los permisos ya heredados del rol se muestran marcados y bloqueados (sufijo "(heredado)"), no se pueden desmarcar desde aquí. El Administrador Maestro no puede reasignarse ni restringirse: todas las acciones del menú aparecen deshabilitadas para su fila. `ensureDefaultAssignment(adminUserId)` asigna `role-atencion` (rol de menor privilegio) solo si el administrador todavía no tiene ninguna asignación — se invoca al crear un administrador y al cambiar el rol de un usuario existente a `administrador`, y nunca sobrescribe una asignación real ya presente.

### Roles y matriz de permisos

`/admin/roles` (`AdminRolesPage.tsx`) lista los 6 roles con insignia Sistema/Personalizado y conteo de permisos; `/admin/roles/:roleId` (`AdminRoleDetailPage.tsx`) muestra la matriz completa (`PermissionMatrix.tsx`, reutilizable — un `Card` por módulo con checkbox por acción y contador `x/total`) — de solo lectura para roles de sistema, editable para roles personalizados con botón "Guardar permisos" habilitado solo cuando hay cambios reales (comparación de JSON ordenado). `RoleFormSheet.tsx` crea/edita metadatos de rol (nombre/descripción/color de `ROLE_COLORS`/ícono de `ROLE_ICON_KEYS`) — nunca toca permisos, eso vive solo en la página de detalle.

### Panel de Seguridad

`/admin/seguridad` (`AdminSecurityPage.tsx`, nuevo) no introduce ningún store nuevo: `admin.service.ts#getSecurityOverviewAsync` deriva sus 6 indicadores (administradores activos, sesiones abiertas, intentos fallidos, usuarios bloqueados, contraseñas reiniciadas, cambios críticos) y la actividad reciente de `listManagedUsers()` + `getAuditLogAsync()`, reutilizando la misma ventana de 15 minutos (`ONLINE_WINDOW_MS`) que ya usa el Dashboard Ejecutivo para "conectados".

### Sidebar del Administrador: agrupado por categorías, sin tocar rutas

`routes/navigation.ts#ROLE_NAV.administrador` pasa de 1 `NavSection` plana a 4: Inicio, **Administración** (Usuarios/Administradores/Roles y Permisos/Auditoría/Seguridad/Configuración), **Académico** (Gestión Académica/Materias/Carreras/Producto de Titulación/Cursos y Certificaciones/Biblioteca/Evaluaciones) y **Comunidad** (Foro y Moderación/Leaderboard/Notificaciones/Comunicación). `types/nav.ts#NavSection.label` y el renderizado de encabezados de grupo en `components/layout/Sidebar.tsx` ya existían desde el inicio del proyecto sin haberse usado nunca con más de una sección — este sprint solo cambia datos, cero cambios en el componente del Sidebar. Ninguna ruta existente cambió de path; las pantallas nuevas de este sprint recibieron rutas nuevas. Alumno y Profesor no se modificaron.

### Dashboard: accesos filtrados por permisos efectivos reales

`admin.service.ts#getAdminDashboard` ahora resuelve `effectivePermissions` (vía `getEffectivePermissionsAsync`) junto con `kpis`/`executive`/`alerts`; `AdminDashboardPage.tsx#buildQuickAccess` filtra `admin-sections.ts` (recortado de 9 a 3 entradas: Centro de Incidencias, Respaldos, Generador de Matrículas — el resto ya vive directamente en el Sidebar rediseñado) llamando a `hasModuleAccess(effectivePermissions, section.moduleKey)`, reemplazando el `hasPermission(role, permission)` del Sprint 19 que siempre devolvía `true`.

### Auditoría de Roles y Administradores

Cada mutación de `rbac.service.ts` (crear/editar/eliminar rol, cambiar estado, asignar rol, cambiar permisos personalizados) llama a `recordAudit(actor, 'Roles y Permisos', …)` como último paso — mismo patrón síncrono ya usado por el resto de los servicios administrativos desde el Sprint 13, sin necesidad de un listener de Event Bus nuevo. `types/audit.ts#AuditModule` gana el valor `'Roles y Permisos'`.
