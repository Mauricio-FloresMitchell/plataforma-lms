# Flujos del sistema

Complementa `docs/ARCHITECTURE.md` (estructura estática) con el recorrido de los flujos más relevantes introducidos en el Sprint 20. Para el detalle de cada sprint anterior, ver `docs/TDD-v1.md`.

## Resolución de permisos efectivos (login → Dashboard)

```
1. Administrador inicia sesión (AuthProvider, sin cambios este sprint)
2. AdminDashboardPage monta → admin.service.ts#getAdminDashboard(adminId)
3. getAdminDashboard hace Promise.all(...) incluyendo:
       rbac.service.ts#getEffectivePermissionsAsync(adminId)
4. getEffectivePermissionsAsync:
       a. busca la asignación del administrador (mocks/rbac.ts#findAssignment)
       b. busca su rol (mocks/rbac.ts#findRole)
       c. si el rol está inactivo → devuelve []
       d. si no → devuelve Array.from(new Set([...rol.permissions, ...asignacion.customPermissions]))
5. AdminDashboard.effectivePermissions llega al componente
6. AdminDashboardPage#buildQuickAccess filtra admin-sections.ts:
       hasModuleAccess(effectivePermissions, section.moduleKey)
7. Solo las tarjetas cuyo módulo aparece en los permisos efectivos se renderizan
```

Ningún paso de este flujo compara `role === 'administrador'` directamente — la única fuente de verdad sobre qué puede ver un administrador es el resultado de `getEffectivePermissionsAsync`.

## Editar permisos personalizados de un Administrador

```
Gestión de Administradores (/admin/administradores)
  → clic en "Editar rol y permisos" de una fila
  → AdminAssignSheet se abre con:
        - rol actual (combobox, autoguarda con setRoleStatus/assignRoleAsync al cambiar)
        - PermissionMatrix con `inherited={rol.permissions}` (marcados y bloqueados)
        - checkboxes editables solo para permisos que el rol NO ya concede
  → clic en "Guardar permisos"
  → rbac.service.ts#setCustomPermissionsAsync(adminId, permisos[])
        → mocks/rbac.ts#setCustomPermissions (mutación en memoria)
        → recordAudit(actor, 'Roles y Permisos', 'Actualizó permisos personalizados de X', ...)
  → sheet se cierra, AdminAdministratorsPage vuelve a pedir getAssignmentsAsync()
  → la tarjeta del administrador refleja el nuevo conteo "heredados/personalizados"
```

Ver `docs/RBAC.md` para por qué el resultado es siempre una unión (nunca una resta) de permisos.

## Alta de un nuevo Administrador → rol por defecto garantizado

```
UserCreateSheet (reutilizado de Gestión de Usuarios, defaultRole="administrador")
  → userManagement.service.ts#createManagedUserAsync(input)
        → mocks/userManagement.ts#createManagedUser (guarda el usuario)
        → si input.role === 'administrador':
              rbac.service.ts#ensureDefaultAssignment(nuevoId)
                → busca asignación existente (no debería haber ninguna, es nuevo)
                → assignRole(nuevoId, DEFAULT_ROLE_ID = 'role-atencion')
        → recordAudit(actor, 'Usuarios', 'Dio de alta a X', ...)
  → el nuevo administrador ya aparece en /admin/administradores con rol "Atención Estudiantil"
```

El mismo `ensureDefaultAssignment` se invoca al cambiar el rol de un usuario existente a `administrador` (`changeUserRoleAsync`) — y en ambos casos primero verifica si ya existe una asignación real antes de crear una nueva, para no sobrescribir nunca un rol ya asignado.

## Auditoría de RBAC → Panel de Seguridad

```
Cualquier mutación de rbac.service.ts (crear/editar/eliminar rol, cambiar estado,
asignar rol, cambiar permisos personalizados)
  → recordAudit(actor, 'Roles y Permisos', accion, afectado, ...) [último paso, síncrono]
  → mocks/audit.ts (arreglo en memoria, más reciente primero)

AdminSecurityPage monta
  → admin.service.ts#getSecurityOverviewAsync()
        → listManagedUsers() + audit.service.ts#getAuditLogAsync()
        → deriva 6 contadores + los 15 registros más recientes
  → StatCards + lista de "Actividad reciente" en pantalla
```

No existe un listener del Event Bus para RBAC — a diferencia de Sesión/Foro/Incidencias (Sprint 19), la auditoría se registra sincrónicamente dentro del propio servicio, igual que el resto de los módulos administrativos desde el Sprint 13 (ver ADR-014).

## Nota sobre persistencia

Todos los flujos anteriores mutan arreglos en memoria (`src/mocks/*.ts`). Una recarga completa de página reinicia el estado a los valores sembrados — esperado en un prototipo sin backend (CLAUDE.md: "Demo funcional. No producción."), no una falla del RBAC.
