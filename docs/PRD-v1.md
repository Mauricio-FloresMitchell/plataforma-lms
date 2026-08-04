# Ludi Class

# Product Requirements Document (PRD)

---

## Información General

| Campo | Valor |
|--------|--------|
| Producto | Ludi Class |
| Cliente | Universidad Imperalianz |
| Tipo de proyecto | Plataforma Académica Web |
| Estado | MVP – Demo de Alta Fidelidad |
| Versión | 1.0 |
| Documento | Product Requirements Document |
| Responsable del Producto | Product Owner |
| Equipo Técnico | Arquitectura + Desarrollo Frontend |
| Última actualización | 23 de julio de 2026 |

---

# 1. Resumen Ejecutivo

Ludi Class es una plataforma web de gestión académica diseñada para centralizar la experiencia educativa de Universidad Imperalianz mediante una interfaz moderna, intuitiva y enfocada en el seguimiento del aprendizaje.

El sistema permitirá administrar el proceso académico desde tres perspectivas principales:

- Alumno
- Profesor
- Administrador

A diferencia de un LMS tradicional, Ludi Class prioriza la visualización del progreso, la interacción entre usuarios y la evaluación basada en competencias, eliminando el enfoque tradicional de calificaciones numéricas.

La versión actual corresponde a un MVP (Minimum Viable Product) cuyo objetivo es demostrar la experiencia de usuario, validar los flujos principales y servir como base para el desarrollo de una versión productiva.

---

# 2. Visión del Producto

Construir una plataforma académica moderna que facilite el seguimiento integral del proceso educativo mediante herramientas digitales que permitan mejorar la comunicación, organización y evaluación entre alumnos, profesores y administradores.

En el largo plazo, Ludi Class podrá evolucionar hacia una plataforma multiinstitución, aunque la primera implementación estará orientada exclusivamente a Universidad Imperalianz.

---

# 3. Problema

Actualmente gran parte del seguimiento académico depende de procesos manuales o herramientas aisladas.

Esto provoca:

- Dificultad para medir avances.
- Poca visibilidad del progreso del estudiante.
- Comunicación fragmentada.
- Procesos administrativos repetitivos.
- Escasa trazabilidad del aprendizaje.

Ludi Class busca concentrar toda esta información dentro de una única plataforma.

---

# 4. Objetivos del Producto

## Objetivo General

Centralizar la experiencia académica de Universidad Imperalianz mediante una plataforma moderna que facilite el seguimiento del aprendizaje.

## Objetivos específicos

- Mejorar la experiencia del alumno.
- Facilitar el trabajo del profesor.
- Centralizar información académica.
- Simplificar procesos administrativos.
- Visualizar indicadores relevantes.
- Fomentar la colaboración mediante un foro académico.
- Permitir la evaluación por competencias.

---

# 5. Alcance del MVP

La demo incluirá únicamente funcionalidades necesarias para demostrar el funcionamiento general de la plataforma.

Incluye:

- Autenticación.
- Dashboard Alumno.
- Dashboard Profesor.
- Dashboard Administrador.
- Materias.
- Reportes.
- Evaluaciones.
- Foro.
- Perfil.
- Navegación completa.

No incluye:

- Integración con WordPress.
- Integración con MasterStudy.
- Backend real.
- Base de datos real.
- Notificaciones push.
- Videollamadas.
- Chat en tiempo real.

---

# 6. Stakeholders

## Cliente

Universidad Imperalianz.

## Usuarios finales

- Alumnos.
- Profesores.
- Personal administrativo.

## Equipo del Proyecto

- Product Owner.
- Arquitecto de Software.
- Frontend Developer.
- Backend Developer (futuro).

# 7. Roles del Sistema

Ludi Class implementa un modelo de acceso basado en Roles (RBAC - Role Based Access Control).

Cada usuario tendrá acceso únicamente a las funcionalidades correspondientes a su perfil.

Los permisos serán administrados desde el módulo de Administración.

---

## 7.1 Alumno

El Alumno es el actor principal de la plataforma.

Su objetivo consiste en visualizar su progreso académico, entregar evidencias de aprendizaje, participar en actividades colaborativas y dar seguimiento a su formación.

### Funciones

- Consultar Dashboard personal.
- Consultar materias inscritas.
- Visualizar profesores asignados.
- Entregar reportes semanales.
- Subir evidencias.
- Participar en el Foro.
- Consultar retroalimentaciones.
- Consultar evaluaciones por competencias.
- Visualizar insignias obtenidas.
- Consultar calendario académico.
- Editar información básica de su perfil.

El Alumno no podrá modificar información académica ni gestionar otros usuarios.

---

## 7.2 Profesor

El Profesor administra el seguimiento académico de los alumnos asignados.

Su objetivo es evaluar el progreso, proporcionar retroalimentación y supervisar el cumplimiento de actividades.

### Funciones

- Consultar Dashboard docente.
- Consultar grupos asignados.
- Consultar alumnos.
- Revisar reportes.
- Emitir retroalimentación.
- Asignar niveles de competencia.
- Otorgar insignias.
- Crear publicaciones en el foro.
- Responder publicaciones.
- Consultar indicadores de avance.
- Visualizar actividades pendientes.

El Profesor no podrá administrar usuarios ni modificar la configuración institucional.

---

## 7.3 Administrador

El Administrador gestiona la operación completa de la plataforma.

Será el único rol con permisos para modificar la estructura académica.

### Funciones

- Administrar alumnos.
- Administrar profesores.
- Administrar grupos.
- Administrar carreras.
- Administrar materias.
- Asignar profesores.
- Asignar alumnos.
- Configurar periodos académicos.
- Consultar métricas institucionales.
- Gestionar permisos.
- Gestionar catálogos.
- Gestionar configuración general.

---

# 8. Casos de Uso Principales

La plataforma deberá soportar los siguientes flujos funcionales.

## Alumno

- Iniciar sesión.
- Consultar Dashboard.
- Revisar materias.
- Enviar reporte semanal.
- Adjuntar evidencias.
- Consultar comentarios del profesor.
- Participar en el foro.
- Obtener insignias.
- Consultar su avance académico.

---

## Profesor

- Iniciar sesión.
- Consultar Dashboard.
- Visualizar grupos.
- Revisar reportes.
- Evaluar competencias.
- Asignar insignias.
- Publicar en el foro.
- Comentar publicaciones.
- Consultar indicadores.

---

## Administrador

- Iniciar sesión.
- Crear usuarios.
- Editar usuarios.
- Eliminar usuarios.
- Crear materias.
- Crear grupos.
- Asignar profesores.
- Asignar alumnos.
- Configurar carreras.
- Consultar Dashboard institucional.

---

# 9. Arquitectura Funcional

Ludi Class se divide funcionalmente en tres grandes áreas.

## Área Académica

Relacionada con el proceso de enseñanza y aprendizaje.

Incluye:

- Dashboard.
- Materias.
- Reportes.
- Evaluaciones.
- Calendario.

---

## Área Colaborativa

Relacionada con la interacción entre usuarios.

Incluye:

- Foro.
- Comentarios.
- Publicaciones.
- Insignias.

---

## Área Administrativa

Relacionada con la operación institucional.

Incluye:

- Usuarios.
- Grupos.
- Materias.
- Carreras.
- Configuración.

---

# 10. Navegación General

Cada rol visualizará únicamente las opciones correspondientes.

## Alumno

- Inicio
- Mi Progreso
- Materias
- Reportes
- Foro
- Calendario
- Perfil

---

## Profesor

- Inicio
- Grupos
- Materias
- Reportes
- Evaluaciones
- Foro
- Perfil

---

## Administrador

- Inicio
- Usuarios
- Profesores
- Alumnos
- Grupos
- Materias
- Carreras
- Foro
- Configuración

---

# 11. Principios del Producto

Toda funcionalidad desarrollada para Ludi Class deberá cumplir los siguientes principios.

## Simplicidad

La interfaz deberá ser intuitiva incluso para usuarios con poca experiencia tecnológica.

---

## Consistencia

Los componentes visuales deberán mantener el mismo comportamiento en toda la aplicación.

---

## Modularidad

Cada módulo deberá ser independiente y reutilizable.

---

## Escalabilidad

La arquitectura deberá permitir incorporar nuevos módulos sin afectar los existentes.

---

## Accesibilidad

La plataforma deberá ser usable desde dispositivos móviles, tabletas y computadoras.

---

## Transparencia

El usuario siempre deberá conocer:

- Qué puede hacer.
- Qué información está visualizando.
- Cuál es el siguiente paso dentro de la plataforma.

# 12. Módulos del Sistema

La plataforma estará organizada en módulos funcionales independientes.

Cada módulo deberá ser desarrollado de forma desacoplada para facilitar futuras ampliaciones.

---

## 12.1 Autenticación

Objetivo

Permitir el acceso seguro a la plataforma según el rol del usuario.

Funciones

- Inicio de sesión.
- Recuperación de sesión.
- Cierre de sesión.
- Protección de rutas.
- Control por roles.

Estado MVP

✅ Incluido

---

## 12.2 Dashboard

Objetivo

Mostrar al usuario un resumen general de su actividad dentro de la plataforma.

Cada rol visualizará información distinta.

Alumno

- Bienvenida.
- Materias asignadas.
- Reportes pendientes.
- Nivel de competencia.
- Insignias obtenidas.
- Actividad reciente.
- Próximas actividades.
- Avisos.

Profesor

- Alumnos asignados.
- Reportes pendientes por revisar.
- Actividad reciente.
- Próximas entregas.
- Indicadores del grupo.

Administrador

- Usuarios registrados.
- Profesores.
- Alumnos.
- Grupos.
- Actividad general.
- Indicadores institucionales.

Estado MVP

✅ Incluido

---

## 12.3 Materias

Objetivo

Permitir consultar las asignaturas asignadas.

Alumno

- Consultar materias.
- Consultar profesor.
- Consultar avance.

Profesor

- Consultar materias impartidas.
- Consultar alumnos.

Administrador

- Crear materias.
- Editar materias.
- Eliminar materias.
- Asignar materias.

Estado MVP

✅ Incluido

---

## 12.4 Reportes Semanales

Objetivo

Registrar el seguimiento semanal del alumno.

**Actualizado (Sprint 12, 2026-07-29):** los reportes se crean mediante un motor de plantillas académicas por carrera (R01-R07), no un formulario único. Ver ADR-008.

Cada carrera de Licenciatura usa exactamente una plantilla, que define: carrera, producto de titulación, campos específicos, preguntas por semana (Semana 1 a 4) y reglas especiales. El formulario se renderiza automáticamente desde esa definición y muestra únicamente la semana correspondiente.

Estructura de todo reporte: Encabezado, Datos generales, Preguntas dinámicas de la semana, Integración al producto de titulación (obligatoria) y Evaluación Docente.

Reglas especiales: Derecho y Psicología exigen anonimización (el alumno confirma no incluir nombres completos ni datos identificables de clientes/pacientes). Todas las plantillas exigen al menos un archivo o enlace adjunto.

Adjuntos permitidos: archivos PDF, DOCX, XLSX, PPTX, JPG, PNG, ZIP (mock — solo se captura el nombre); enlaces a GitHub, Google Drive, Canva, Figma o YouTube.

Alumno

- Crear reporte mediante la plantilla de su carrera.
- Adjuntar evidencias (archivos y enlaces).
- Consultar historial.

Profesor

- Revisar reportes en el mismo formulario, en modo lectura.
- Evaluación Docente: calificar Rúbrica A (70%) y Rúbrica B (30%), asignar bonificaciones, otorgar insignias y escribir retroalimentación.
- La plataforma calcula automáticamente el porcentaje final y la letra correspondiente (escala de 5 niveles, ADR-008); el profesor nunca la calcula manualmente.
- Aprobar reporte.
- Solicitar correcciones.

Administrador

- Consultar todos los reportes.

Estado MVP

✅ Incluido

---

## 12.5 Evaluaciones

Objetivo

Evaluar el desempeño mediante competencias.

La calificación oficial del alumno se expresa como letra, no como número libre.

**Actualizado (Sprint Demo Profesor):** para capturar la letra, el profesor ingresa un porcentaje (0-100) que la plataforma convierte automáticamente. Ver RN-005 y ADR-007.

Escala permitida

- A+
- A
- B+
- B
- C+
- C
- D
- F

El profesor podrá asignar observaciones junto con la evaluación.

La retroalimentación tiene tres estados: Borrador, Pendiente y Publicada. Una evaluación Publicada solo puede modificarse mediante solicitud al Administrador.

Estado MVP

✅ Incluido

---

## 12.6 Foro

Objetivo

Facilitar la colaboración entre alumnos y profesores.

Características

- Categorías.
- Temas.
- Publicaciones.
- Comentarios.
- Respuestas.
- Búsqueda.
- Filtros.

El profesor podrá evaluar la participación.

Estado MVP

✅ Incluido

---

## 12.7 Perfil

Cada usuario contará con un perfil.

Información

- Nombre.
- Correo.
- Rol.
- Fotografía.
- Información básica.

Estado MVP

✅ Incluido

---

## 12.8 Administración

Disponible únicamente para el rol Administrador.

Permitirá administrar

- Usuarios.
- Profesores.
- Alumnos.
- Grupos.
- Materias.
- Carreras.
- Configuración.

Estado MVP

🚧 Desarrollo posterior a la demo inicial.

---

# 13. Reglas de Negocio

RN-001

Todo usuario deberá iniciar sesión para acceder a cualquier módulo.

---

RN-002

Cada usuario únicamente podrá visualizar información correspondiente a su rol.

---

RN-003

Los profesores únicamente podrán consultar alumnos pertenecientes a sus grupos asignados.

---

RN-004

Los alumnos únicamente podrán visualizar sus propios reportes.

---

RN-005

Las evaluaciones utilizarán exclusivamente la escala por competencias:

A+

A

B+

B

C+

C

D

F

**Actualizado (Sprint Demo Profesor, 2026-07-29):** el profesor captura el desempeño como un porcentaje (0-100) y la plataforma convierte automáticamente ese porcentaje a la letra correspondiente mediante una tabla fija de equivalencias (ver TDD). La interfaz muestra siempre ambos valores (porcentaje y letra). El porcentaje es un mecanismo de captura y visualización; la evaluación oficial del alumno sigue expresándose como letra, no como calificación numérica libre. Ver ADR-007.

Tabla de equivalencias:

A+ = 97-100 · A = 90-96 · B+ = 85-89 · B = 80-84 · C+ = 75-79 · C = 70-74 · D = 60-69 · F = menor a 60

---

RN-006

Las insignias representan logros académicos.

No sustituyen la evaluación.

---

RN-007

Los administradores tendrán acceso completo a la configuración institucional.

---

RN-008

Toda acción importante deberá poder ser registrada para futuras auditorías.

Aunque la demo utilice datos simulados, la arquitectura deberá contemplar esta capacidad.

---

RN-009

**Agregada (Sprint 12, 2026-07-29):** el bloque Evaluación Docente de Reportes Semanales utiliza una escala de letras propia, independiente de la escala de Evaluaciones por competencias (RN-005):

A = 90-100 · B = 80-89 · C = 70-79 · D = 60-69 · F = menor a 60

Se calcula automáticamente a partir de Rúbrica A (70%) + Rúbrica B (30%) + bonificación. El profesor nunca la captura manualmente. Ver ADR-008.

---

# 14. Integraciones Planeadas

Durante el MVP la plataforma utilizará datos simulados.

Posteriormente evolucionará hacia la siguiente arquitectura.

Fase 1

Mock Services

↓

Fase 2

Google Sheets

↓

Fase 3

API REST

↓

Fase 4

PostgreSQL

↓

Fase 5

Integración con WordPress / MasterStudy

Todas las capas deberán construirse respetando esta evolución para evitar reescrituras importantes.

# 15. Requerimientos Funcionales

Los siguientes requerimientos describen el comportamiento esperado del sistema.

## RF-001 Autenticación

El sistema deberá permitir el inicio de sesión mediante correo electrónico y contraseña.

---

## RF-002 Control de Roles

El sistema deberá restringir el acceso a módulos y funcionalidades según el rol del usuario autenticado.

---

## RF-003 Dashboard

El sistema deberá mostrar un Dashboard personalizado para cada tipo de usuario.

---

## RF-004 Reportes

Los alumnos podrán registrar reportes semanales y adjuntar evidencias.

---

## RF-005 Evaluaciones

Los profesores podrán evaluar el desempeño utilizando la escala institucional.

---

## RF-006 Foro

El sistema deberá permitir crear publicaciones, responder comentarios y consultar discusiones.

---

## RF-007 Administración

Los administradores podrán gestionar usuarios, grupos, materias y asignaciones.

---

# 16. Requerimientos No Funcionales

## RNF-001 Rendimiento

La navegación deberá sentirse fluida.

El tiempo de respuesta esperado para la interfaz será inferior a dos segundos utilizando datos simulados.

---

## RNF-002 Responsive

Toda la plataforma deberá adaptarse correctamente a:

- Desktop
- Laptop
- Tablet
- Mobile

---

## RNF-003 Accesibilidad

Los componentes deberán cumplir criterios básicos de accesibilidad.

- Navegación mediante teclado.
- Contraste adecuado.
- Etiquetas descriptivas.

---

## RNF-004 Escalabilidad

Toda funcionalidad deberá construirse mediante componentes reutilizables.

---

## RNF-005 Mantenibilidad

El código deberá seguir la arquitectura Feature Based definida en el TDD.

---

## RNF-006 Seguridad

Aunque el MVP utilice datos simulados, toda la arquitectura deberá prepararse para:

- JWT
- Refresh Token
- Roles
- Middleware de autorización

---

## RNF-007 Integraciones

Los servicios deberán desacoplarse completamente de la interfaz para permitir sustituir Mock Services por Google Sheets, API REST o PostgreSQL sin modificar los componentes visuales.

---

# 17. Principios de UX/UI

La experiencia de usuario constituye uno de los objetivos principales del producto.

Toda pantalla deberá respetar los siguientes principios.

## Simplicidad

Interfaces limpias.

Poca carga visual.

Jerarquía clara.

---

## Consistencia

Todos los módulos deberán compartir:

- Tipografía
- Espaciado
- Componentes
- Paleta
- Iconografía

---

## Feedback

Toda acción importante deberá generar retroalimentación visual.

Ejemplos

- Toast
- Loader
- Alert
- Confirmación
- Estado vacío

---

## Navegación

El usuario nunca deberá perder el contexto.

Siempre deberá saber:

- dónde está,
- qué está haciendo,
- cuál es el siguiente paso.

---

## Diseño

La interfaz deberá inspirarse en productos SaaS modernos.

Referencias visuales

- Notion
- Stripe
- Linear
- Microsoft 365
- Vercel
- GitHub

Se evitarán interfaces sobrecargadas o con apariencia de LMS tradicional.

---

# 18. Criterios de Aceptación del MVP

El MVP será considerado funcional cuando cumpla los siguientes criterios.

## Alumno

- Puede iniciar sesión.
- Puede consultar Dashboard.
- Puede visualizar materias.
- Puede enviar reportes.
- Puede consultar retroalimentaciones.
- Puede participar en el foro.

---

## Profesor

- Puede iniciar sesión.
- Puede consultar Dashboard.
- Puede revisar reportes.
- Puede evaluar competencias.
- Puede participar en el foro.

---

## Administrador

- Puede iniciar sesión.
- Puede administrar usuarios.
- Puede administrar materias.
- Puede administrar grupos.
- Puede administrar asignaciones.

---

## Sistema

- Responsive.
- Sin errores críticos.
- Build exitoso.
- TypeScript limpio.
- Arquitectura modular.

---

# 19. Fuera del Alcance del MVP

No forman parte de la versión inicial.

- Chat en tiempo real.
- Videollamadas.
- Notificaciones Push.
- Aplicación móvil nativa.
- Integración con Moodle.
- Integración con WordPress.
- Integración con MasterStudy.
- Base de datos PostgreSQL.
- API REST productiva.
- Sistema de pagos.
- Inteligencia Artificial.
- Analítica avanzada.

Estos elementos podrán considerarse en futuras versiones.

---

# 20. Evolución del Producto

El producto evolucionará mediante Releases incrementales.

## Release 0.2

Autenticación y Fundación.

---

## Release 0.3

Experiencia Alumno.

---

## Release 0.4

Experiencia Profesor.

---

## Release 0.5

Experiencia Administrador.

---

## Release 0.6

Foro Académico.

---

## Release 0.7

Integración con Google Sheets.

---

## Release 0.8

API REST.

---

## Release 0.9

PostgreSQL.

---

## Release 1.0

Integración institucional completa.

---

# 21. Definición de Éxito

La versión 1.0 será considerada exitosa cuando permita demostrar el flujo completo de trabajo entre:

Alumno

↓

Profesor

↓

Administrador

utilizando una experiencia moderna, intuitiva y suficientemente cercana a un producto listo para producción.

---

# Fin del Documento