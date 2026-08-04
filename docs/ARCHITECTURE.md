# Arquitectura

Vista general y estable del proyecto. El detalle de qué se construyó en cada sprint vive en `docs/TDD-v1.md`; las decisiones de alcance y sus motivos, en `docs/DECISIONS.md`; el modelo de permisos, en `docs/RBAC.md` y `docs/PERMISSIONS.md`.

## Stack

React + Vite + TypeScript + TailwindCSS + shadcn/ui. Ver `CLAUDE.md` para convenciones del proyecto.

## Organización: Feature Based

```
src/
├── components/       # UI compartida entre features (Breadcrumb, PageHeader, ListSkeleton, ...)
├── core/events/       # Event Bus interno (EventEmitter, EventTypes, listeners)
├── features/          # Una carpeta por área funcional (pages/components propios)
├── mocks/             # Única fuente de datos — arreglos en memoria
├── repositories/      # Capa de repositorio/adaptador (hoy solo Titulación, Sprint 18)
├── routes/            # AppRouter.tsx (rutas) y navigation.ts (Sidebar por rol)
├── services/          # API REST-like sobre los mocks — única capa que los componentes leen
├── types/             # Tipos de dominio, uno por área
└── utils/             # Funciones puras (sin acceso a datos)
```

## Capa de datos: mocks → services → components/utils

Todo dato viene de `src/mocks/*.ts` (arreglos en memoria, sin persistencia entre recargas de página — CLAUDE.md: "Datos provenientes exclusivamente de /mocks"). Los componentes nunca importan un mock directamente: siempre pasan por `src/services/*.service.ts`, que expone funciones `async` (simulan latencia de red) con la misma firma que tendría una futura API REST. Migrar a un backend real implica reemplazar el cuerpo de cada servicio — la firma pública y los componentes no cambian.

`src/utils/*.ts` es la única capa sin acceso a datos: funciones puras que reciben los datos ya resueltos (ej. `hasPermission(effectivePermissions, permission)`) — nunca hacen fetch ni conocen mocks.

## Roles y navegación

Tres roles (`alumno`/`profesor`/`administrador`, `types/auth.ts`). `routes/navigation.ts#ROLE_NAV` define el Sidebar de cada uno como `NavSection[]` — agrupado por categorías desde el Sprint 20 para Administrador (`NavSection.label`, soportado por `components/layout/Sidebar.tsx` desde el inicio del proyecto). `routes/AppRouter.tsx` define las rutas reales; cada una está protegida por rol vía `ProtectedRoute`.

## Event Bus

`core/events/` (Sprint "Event Bus") desacopla módulos que necesitan reaccionar a acciones de otro sin importarse directamente — ej. `AuditListener` reacciona a `USER_LOGIN`/`USER_LOGOUT` sin que `auth.service.ts` conozca Auditoría; `IncidentSyncListener` reacciona a reportes del Foro sin que `forum.service.ts` conozca Incidencias. Se usa cuando la reacción es "otro módulo se entera de algo que pasó"; las mutaciones síncronas dentro del mismo flujo (ej. registrar auditoría al final de una función de servicio) no usan el bus, solo llaman a `recordAudit` directamente — ver `docs/SYSTEM-DESIGN.md`.

## RBAC (Sprint 20)

Capa de autorización sobre el panel de Administrador: `types/rbac.ts` (catálogo de permisos y roles) → `mocks/rbac.ts` (roles y asignaciones sembrados) → `services/rbac.service.ts` (CRUD + permisos efectivos) → `utils/permissions.ts` (funciones puras de verificación). Detalle completo en `docs/RBAC.md`.

## Auditoría

`types/audit.ts`/`mocks/audit.ts`/`services/audit.service.ts` — un registro append-only compartido por todos los módulos administrativos. Cualquier servicio que mute datos administrativos llama a `recordAudit(actor, modulo, accion, ...)` como último paso.

## Convenciones que no van a cambiar sin una ADR

- Componentes menores a 250 líneas.
- Sin CSS inline, sin Bootstrap, sin Material UI.
- TypeScript estricto.
- Toda funcionalidad nueva es modular y reutilizable, aditiva sobre lo existente salvo que una ADR documente lo contrario.
