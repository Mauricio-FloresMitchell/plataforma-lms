# Roadmap

Numeración de releases alineada con PRD §20 y con CHANGELOG.

---

## Release 0.2.0

Fundación y Autenticación

✔ Sprint 0 — Fundaciones técnicas

✔ Sprint 1 — Autenticación Demo

Estado

Completado

---

## Release 0.3.0

Experiencia Alumno

✔ Sprint 2 — Dashboard del Alumno

Estado

Completado

---

## Release 0.4.0

Profesor

✔ Sprint 3 — Dashboard del Profesor

Estado

Completado

---

## Release 0.5.0

Administrador

✔ Sprint 4 — Dashboard del Administrador

Estado

Completado

---

## Release 0.6.0

Foro

Reportes

Evaluaciones

✔ Sprint 5 — Reportes Semanales y Evaluación por competencias (Alumno y Profesor)

✔ Sprint 6 — Foro Académico (Alumno, Profesor y Administrador)

Estado

Completado

---

## Release 0.7.0

Módulo Académico de Materias

✔ Sprint 7 — Módulo de Materias (Alumno, Profesor, Administrador)

Estado

Completado

---

## Release 0.8.0

Módulo de Evaluaciones

✔ Sprint 8 — Módulo de Evaluaciones (Alumno, Profesor, Administrador)

Estado

Completado

---

## Release 0.9.0

Integración de Módulos y Mejora de UX

✔ Sprint 9 — Navegación Consistente, Perfiles y Mejoras de Experiencia

Estado

Completado

---

## Release 1.0.0

Generador de Matrículas (mock)

✔ Sprint 10 — Corrección de Configuración (Alumno/Profesor) y Generador de Matrículas

Estado

Completado

---

## MVP Completado (Versión 0.9.0)

- Autenticación y control de acceso por rol
- 4 módulos funcionales: Materias, Evaluaciones, Reportes y Foro
- Dashboards personalizados para Alumno, Profesor y Administrador
- Navegación consistente y experiencia de usuario mejorada
- Sistema de perfiles y configuración

---

## Sprints 11–19 — Ampliación de módulos

Entre el MVP (Sprint 10) y el cierre funcional del MVP (Sprint 20) se agregaron, en orden: Evaluaciones/Actividades del Profesor, Motor de Reportes Académicos, Leaderboard y Gamificación, Foro (hilos y moderación), Event Bus y Centro de Notificaciones, Centro de Comunicación Institucional (Chat), Centro de Control Administrativo, Perfil Alumno, Modelo Académico Imperalianz, Producto de Titulación (Core Académico) y el rediseño del panel de Administrador como Centro de Gestión Universitaria. Detalle completo de cada sprint en `docs/CHANGELOG.md` y `docs/TDD-v1.md`.

Estado

Completado

---

## Release 1.15.0

RBAC Completo (Administrador Maestro) + Arquitectura de Permisos

✔ Sprint 20 — jerarquía Administrador Maestro → Administradores → Roles → Permisos → Módulos, 6 roles predefinidos, matriz de permisos por módulo, Gestión de Administradores, Panel de Seguridad, Sidebar del Administrador reagrupado. Descrito por el propio sprint como "el cierre funcional del MVP". Ver `docs/CHANGELOG.md`, `docs/RBAC.md`, `docs/PERMISSIONS.md` y ADR-014 (`docs/DECISIONS.md`).

Estado

Completado

---

## Releases posteriores — Fase Backend

Según PRD §20. Sprint 20 preparó la arquitectura de permisos (roles, matriz, herencia) y los placeholders de Configuración General para esta fase, sin conectar ningún backend real.

1.0 Integración institucional completa (Google Sheets)

1.1 API REST

1.2 PostgreSQL

1.3+ Ampliación de funcionalidades

Estado

Futuro
