# RBAC — Control de Acceso Basado en Roles

Introducido en el Sprint 20 ("RBAC Completo — Administrador Maestro"). Describe el modelo funcional; el catálogo completo de permisos vive en `docs/PERMISSIONS.md`, el detalle técnico de implementación en `docs/TDD-v1.md` (sección "RBAC Completo — Administrador Maestro") y el razonamiento de cada decisión de alcance en ADR-014 (`docs/DECISIONS.md`).

## Jerarquía

```
Administrador Maestro
      │
      ▼
Administradores  ──── cada uno tiene asignado ────►  un Rol
      │                                                   │
      │                                                   ▼
      │                                          Permisos base del rol
      │                                                   │
      ▼                                                   ▼
Permisos personalizados  ────────  unión (∪)  ────►  Permisos efectivos
   (adicionales, por administrador)
                                                           │
                                                           ▼
                                                       Módulos
                                          (qué pantallas/acciones puede usar)
```

El Administrador Maestro no participa de este cálculo: posee todos los permisos por definición, no tiene un rol "editable" y ninguna pantalla permite restringirlo (`AdminAdministratorsPage`/`AdminAssignSheet` deshabilitan todas las acciones sobre su fila).

## Roles predefinidos

Seis roles se siembran por defecto (`mocks/rbac.ts`), todos `isSystem: true` — no se pueden editar, eliminar ni desactivar desde la interfaz:

| Rol | Puede | No puede |
|---|---|---|
| **Administrador Maestro** | Todo. Ningún permiso es superior a los suyos. | — (irrestricto) |
| **Soporte Técnico** | Desbloquear/bloquear usuarios, reiniciar contraseñas, consultar logs, monitorear la plataforma, configuración técnica (API/integraciones) | Evaluaciones, calificaciones, pagos |
| **Control Escolar** | Gestionar alumnos, inscripciones, materias, kardex, historial, grupos, altas y bajas | Configuración, Evaluaciones, logs técnicos |
| **Coordinador Académico** | Aprobar/rechazar modificaciones de evaluación, revisar reportes y Producto de Titulación, revisar incidencias académicas, asignar profesores | Gestión de usuarios, Configuración |
| **Finanzas** | Pagos, becas, estados de cuenta, facturación, descuentos, historial financiero (permisos preparados; no existe todavía un módulo de Finanzas construido — ver ADR-014) | Evaluaciones, usuarios, Configuración |
| **Atención Estudiantil** | Tickets, solicitudes, mensajes, seguimiento, incidencias, canalización | Evaluaciones, Configuración, gestión de usuarios |

`Atención Estudiantil` (`role-atencion`) es además el rol por defecto: todo administrador nuevo, o todo usuario cuyo rol cambia a `administrador`, recibe este rol automáticamente si no tiene ya una asignación (`ensureDefaultAssignment`).

## Roles personalizados

El Administrador Maestro puede crear cualquier rol adicional desde `/admin/roles` (nombre, descripción, color, ícono, estado activo/inactivo) y luego definir su matriz de permisos desde el detalle del rol (`/admin/roles/:roleId`). Los roles personalizados (`isSystem: false`) son completamente editables y eliminables.

## Permisos efectivos

Cada administrador tiene:
1. **Permisos base** — heredados de su rol asignado.
2. **Permisos personalizados** — adicionales, asignados individualmente desde Gestión de Administradores.

El resultado (**permisos efectivos**) es siempre la unión de ambos conjuntos — un permiso personalizado nunca puede quitarle algo al administrador que su rol ya le concede, solo sumar. Ejemplo del propio sprint: un Coordinador Académico con el permiso personalizado adicional "Exportar Reportes" tiene, en su resultado final, todos los permisos de Coordinador Académico **más** ese permiso extra.

Si el rol de un administrador está marcado como `inactivo`, sus permisos efectivos son `[]` — pierde acceso a todo sin necesidad de tocar su asignación individual.

## Dónde se usa

- **Dashboard** (`AdminDashboardPage`): filtra las tarjetas de acceso rápido llamando a `hasModuleAccess(effectivePermissions, moduleKey)`.
- **Gestión de Administradores** (`/admin/administradores`): muestra y edita rol + permisos personalizados por administrador.
- **Roles y Permisos** (`/admin/roles`): gestiona los roles y su matriz de permisos base.
- **Panel de Seguridad** (`/admin/seguridad`): resume administradores activos, sesiones, intentos fallidos y cambios críticos.

Ninguna pantalla nueva de este sprint impone restricciones de acceso reales sobre las rutas ya existentes de otros módulos (Materias, Evaluaciones, etc.) — el sprint preparó el modelo de permisos y lo aplicó al propio panel de Administración; extenderlo a cada módulo individual queda para una fase posterior, ya que hacerlo ahora habría requerido tocar ~20 pantallas fuera del alcance de este sprint.

## Auditoría

Toda mutación sobre roles y asignaciones (crear/editar/eliminar rol, cambiar estado, asignar rol a un administrador, cambiar permisos personalizados) queda registrada en `/admin/auditoria` bajo el módulo **"Roles y Permisos"**, con actor, acción, fecha/hora y el administrador afectado.
