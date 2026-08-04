# Catálogo de Permisos

Fuente única de verdad: `src/types/rbac.ts#PERMISSION_MODULES`. Este documento es una vista de lectura para referencia rápida — si el código y este archivo alguna vez difieren, el código gana.

Cada permiso es una llave `"modulo.accion"` (ej. `usuarios.crear`, `foro.moderar`), validada en runtime por `isValidPermission()` (`src/utils/permissions.ts`).

Los primeros 10 módulos son los que el Sprint 20 definió explícitamente en su matriz de permisos. Los 10 siguientes se agregaron aditivamente para que el resto de la plataforma (construida en los Sprints 13–19) quede bajo el mismo sistema — ver ADR-014 (`docs/DECISIONS.md`).

## Módulos de la matriz del sprint

### Usuarios (`usuarios`)
`ver` · `crear` · `editar` · `eliminar` · `exportar` · `reiniciar_contrasena` · `bloquear` · `suspender` · `reactivar`

### Materias (`materias`)
`ver` · `crear` · `editar` · `eliminar` · `asignar` · `cambiar_profesor` · `cambiar_plan`

### Carreras (`carreras`)
`ver` · `crear` · `editar` · `eliminar` · `gestionar_plan` · `gestionar_titulacion`

### Evaluaciones (`evaluaciones`)
`ver` · `modificar` · `aprobar_cambios` · `rechazar_cambios` · `publicar` · `recalcular`

### Reportes (`reportes`)
`ver` · `retroalimentar` · `aprobar` · `solicitar_correccion` · `eliminar`

### Leaderboard (`leaderboard`)
`consultar` · `modificar_puntos` · `asignar_badges` · `recalcular_ranking`

### Biblioteca (`biblioteca`)
`ver` · `subir` · `editar` · `eliminar` · `descargar` · `gestionar_categorias`

### Foro (`foro`)
`moderar` · `eliminar_publicaciones` · `eliminar_comentarios` · `suspender_usuarios` · `resolver_reportes` · `destacar_publicaciones`

### Comunicación (`comunicacion`)
`enviar_anuncios` · `crear_grupos` · `gestionar_conversaciones`

### Configuración (`configuracion`)
`general` · `integraciones` · `api` · `zoom` · `drive` · `correos` · `variables`

## Módulos adicionales (cobertura del resto de la plataforma)

### Producto de Titulación (`titulacion`)
`ver` · `gestionar`

### Cursos y Certificaciones (`cursos`)
`ver` · `gestionar`

### Notificaciones (`notificaciones`)
`ver` · `enviar` · `eliminar`

### Auditoría (`auditoria`)
`consultar`

### Seguridad (`seguridad`)
`consultar`

### Respaldos (`backups`)
`gestionar`

### Incidencias (`incidencias`)
`ver` · `gestionar`

### Generador de Matrículas (`matriculas`)
`generar`

### Roles y Permisos (`roles`)
`ver` · `crear` · `editar` · `eliminar` · `asignar`

### Administradores (`administradores`)
`ver` · `crear` · `editar` · `suspender` · `eliminar`

### Finanzas (`finanzas`)
`pagos` · `becas` · `estados_cuenta` · `facturacion` · `descuentos` · `historial`

> Sin módulo de Finanzas construido en la plataforma todavía — permisos preparados para el rol "Finanzas" y para cuando la feature exista. Ver ADR-014.

## Totales

20 módulos · 88 permisos individuales (`"modulo.accion"`).

## Cómo se combinan

Ver `docs/RBAC.md` para el modelo de herencia (rol base ∪ permisos personalizados = permisos efectivos) y la lista de qué permisos tiene cada uno de los 6 roles predefinidos.
