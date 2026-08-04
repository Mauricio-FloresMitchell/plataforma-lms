import type { AssignedCourse, Certificate } from '@/types/course'

/**
 * Almacén simulado de Cursos Asignados (Sprint 16, Parte 4).
 * Estado en memoria durante la sesión. Con una sola cuenta real de Alumno
 * (`usr-alumno-001`), el catálogo no se filtra por `studentId` — mismo
 * criterio que `mocks/subjects.ts` (`STUDENT_SUBJECTS`).
 */

let COURSES: AssignedCourse[] = [
  {
    id: 'crs-001',
    title: 'Fundamentos de Liderazgo',
    description: 'Desarrolla habilidades de liderazgo situacional y manejo de equipos multidisciplinarios.',
    category: 'Habilidades Directivas',
    status: 'activo',
    progress: 45,
    startDate: '2026-06-01',
    dueDate: '2026-09-15',
  },
  {
    id: 'crs-002',
    title: 'Excel Avanzado para Negocios',
    description: 'Tablas dinámicas, fórmulas financieras y modelos de análisis de datos.',
    category: 'Herramientas',
    status: 'activo',
    progress: 80,
    startDate: '2026-05-15',
    dueDate: '2026-08-20',
  },
  {
    id: 'crs-003',
    title: 'Introducción a la Sostenibilidad Empresarial',
    description: 'Principios ESG y su aplicación en la estrategia corporativa.',
    category: 'Responsabilidad Social',
    status: 'activo',
    progress: 100,
    startDate: '2026-04-01',
    dueDate: '2026-07-10',
  },
  {
    id: 'crs-004',
    title: 'Comunicación Efectiva',
    description: 'Técnicas de comunicación asertiva para entornos profesionales.',
    category: 'Habilidades Blandas',
    status: 'finalizado',
    progress: 100,
    startDate: '2026-02-01',
    dueDate: '2026-05-01',
    completedAt: '2026-04-28T12:00:00.000Z',
  },
]

export function listCourses(): AssignedCourse[] {
  return COURSES
}

export function findCourse(courseId: string): AssignedCourse | null {
  return COURSES.find((course) => course.id === courseId) ?? null
}

/** Marca un curso como finalizado. El certificado aparece de inmediato en `listCertificates`. */
export function markCourseCompleted(courseId: string): AssignedCourse | null {
  const course = COURSES.find((item) => item.id === courseId)
  if (!course) return null
  course.status = 'finalizado'
  course.progress = 100
  course.completedAt = new Date().toISOString()
  return course
}

/** Deriva las certificaciones de los cursos finalizados — sin store propio, sin riesgo de desincronía. */
export function listCertificates(): Certificate[] {
  return COURSES.filter((course) => course.status === 'finalizado' && course.completedAt).map((course) => ({
    id: `cert-${course.id}`,
    courseId: course.id,
    courseTitle: course.title,
    category: course.category,
    issuedAt: course.completedAt as string,
    status: 'disponible' as const,
  }))
}
