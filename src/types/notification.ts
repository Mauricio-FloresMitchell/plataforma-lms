/**
 * Modelo del Centro de Notificaciones (Sprint Event Bus).
 *
 * Las notificaciones nunca las crea un módulo directamente: las genera
 * `NotificationListener` (`core/events/listeners`) al reaccionar a un evento
 * del Event Bus. Este archivo solo define la forma del dato.
 */

export type NotificationCategory = 'academica' | 'foro' | 'administracion' | 'gamificacion' | 'sistema' | 'mensajeria'

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  academica: 'Académicas',
  foro: 'Foro',
  administracion: 'Administración',
  gamificacion: 'Gamificación',
  sistema: 'Sistema',
  mensajeria: 'Mensajes',
}

export type NotificationType =
  // Académicas
  | 'nueva_actividad'
  | 'nuevo_material'
  | 'nueva_evaluacion'
  | 'nueva_calificacion'
  | 'retroalimentacion'
  | 'nuevo_reporte'
  | 'reporte_aprobado'
  | 'reporte_rechazado'
  // Foro
  | 'foro_nueva_respuesta'
  | 'foro_nuevo_comentario'
  | 'foro_publicacion_reportada'
  | 'foro_comentario_reportado'
  | 'foro_respuesta_recibida'
  // Administración
  | 'aviso_institucional'
  | 'advertencia'
  | 'suspension'
  | 'mensaje_administrativo'
  // Gamificación
  | 'puntos_ganados'
  | 'puntos_perdidos'
  | 'nueva_insignia'
  | 'subiste_posiciones'
  | 'entraste_top3'
  | 'racha_oro'
  | 'nuevo_logro'
  // Sistema
  | 'cambio_password'
  | 'inicio_sesion'
  | 'actualizacion'
  | 'error_sincronizacion'
  // Mensajería (Sprint 12)
  | 'nuevo_mensaje'
  // Materias — entregas de actividades (Sprint 16, Parte 1)
  | 'entrega_recibida'
  | 'entrega_evaluada'
  // Comunicación — solicitud de grupo (Sprint 16, Parte 2)
  | 'solicitud_grupo'
  | 'solicitud_grupo_resuelta'
  // Producto de Titulación (Sprint 17, Parte 11)
  | 'titulacion_fase_enviada'
  | 'titulacion_fase_revisada'

/** Categoría a la que pertenece cada tipo — alimenta los filtros (Parte 10). */
export const NOTIFICATION_TYPE_CATEGORY: Record<NotificationType, NotificationCategory> = {
  nueva_actividad: 'academica',
  nuevo_material: 'academica',
  nueva_evaluacion: 'academica',
  nueva_calificacion: 'academica',
  retroalimentacion: 'academica',
  nuevo_reporte: 'academica',
  reporte_aprobado: 'academica',
  reporte_rechazado: 'academica',
  foro_nueva_respuesta: 'foro',
  foro_nuevo_comentario: 'foro',
  foro_publicacion_reportada: 'foro',
  foro_comentario_reportado: 'foro',
  foro_respuesta_recibida: 'foro',
  aviso_institucional: 'administracion',
  advertencia: 'administracion',
  suspension: 'administracion',
  mensaje_administrativo: 'administracion',
  puntos_ganados: 'gamificacion',
  puntos_perdidos: 'gamificacion',
  nueva_insignia: 'gamificacion',
  subiste_posiciones: 'gamificacion',
  entraste_top3: 'gamificacion',
  racha_oro: 'gamificacion',
  nuevo_logro: 'gamificacion',
  cambio_password: 'sistema',
  inicio_sesion: 'sistema',
  actualizacion: 'sistema',
  error_sincronizacion: 'sistema',
  nuevo_mensaje: 'mensajeria',
  entrega_recibida: 'academica',
  entrega_evaluada: 'academica',
  solicitud_grupo: 'mensajeria',
  solicitud_grupo_resuelta: 'mensajeria',
  titulacion_fase_enviada: 'academica',
  titulacion_fase_revisada: 'academica',
}

/** Ícono por defecto (nombre de componente de `lucide-react`) para cada tipo. */
export const NOTIFICATION_TYPE_ICON: Record<NotificationType, string> = {
  nueva_actividad: 'ClipboardList',
  nuevo_material: 'FileText',
  nueva_evaluacion: 'Award',
  nueva_calificacion: 'GraduationCap',
  retroalimentacion: 'MessageCircle',
  nuevo_reporte: 'FileCheck',
  reporte_aprobado: 'CheckCircle2',
  reporte_rechazado: 'XCircle',
  foro_nueva_respuesta: 'Reply',
  foro_nuevo_comentario: 'MessageSquare',
  foro_publicacion_reportada: 'Flag',
  foro_comentario_reportado: 'Flag',
  foro_respuesta_recibida: 'MessageSquareText',
  aviso_institucional: 'Megaphone',
  advertencia: 'AlertTriangle',
  suspension: 'ShieldOff',
  mensaje_administrativo: 'Mail',
  puntos_ganados: 'Coins',
  puntos_perdidos: 'TrendingDown',
  nueva_insignia: 'Sparkles',
  subiste_posiciones: 'TrendingUp',
  entraste_top3: 'Trophy',
  racha_oro: 'Flame',
  nuevo_logro: 'Star',
  cambio_password: 'KeyRound',
  inicio_sesion: 'LogIn',
  actualizacion: 'RefreshCw',
  error_sincronizacion: 'CloudOff',
  nuevo_mensaje: 'MessagesSquare',
  entrega_recibida: 'FileCheck',
  entrega_evaluada: 'CheckCircle2',
  solicitud_grupo: 'MessagesSquare',
  solicitud_grupo_resuelta: 'MessagesSquare',
  titulacion_fase_enviada: 'FileCheck',
  titulacion_fase_revisada: 'CheckCircle2',
}

export type NotificationPriority = 'baja' | 'media' | 'alta'

export interface Notification {
  id: string
  userId: string
  title: string
  description: string
  type: NotificationType
  category: NotificationCategory
  priority: NotificationPriority
  /** Nombre de ícono de `lucide-react` (ver `NOTIFICATION_TYPE_ICON`). */
  icon: string
  /** Ruta interna para "Abrir" (Parte 12): actividad, reporte, foro, evaluación, perfil, leaderboard. */
  link?: string
  isRead: boolean
  /** Fecha ISO 8601. */
  createdAt: string
  readAt?: string
  /** Nombre de quien originó la acción (profesor, administrador, otro alumno…). */
  createdBy?: string
  /** Datos adicionales del evento origen, libres por tipo (ids, montos, etc.). */
  metadata?: Record<string, unknown>
}

/** Datos para crear una notificación. Solo lo usa `NotificationListener`. */
export interface CreateNotificationInput {
  userId: string
  title: string
  description: string
  type: NotificationType
  priority?: NotificationPriority
  icon?: string
  link?: string
  createdBy?: string
  metadata?: Record<string, unknown>
}

export type NotificationFilter = 'todas' | 'no_leidas' | NotificationCategory
