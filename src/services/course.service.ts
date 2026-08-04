import { findCourse, listCertificates, listCourses, markCourseCompleted } from '@/mocks/courses'
import { emitAppEvent } from '@/core/events/EventBus'
import type { AssignedCourse, Certificate } from '@/types/course'

/**
 * Capa de acceso a datos de Cursos Asignados y Certificaciones (Sprint 16, Parte 4).
 * Único archivo que conoce el origen de los datos.
 *
 * El catálogo no distingue alumno (Sprint 16, sin `studentId`); se asocia a
 * la única cuenta real de Alumno del MVP (`usr-alumno-001`) al emitir
 * `COURSE_COMPLETED`, mismo criterio que otros módulos de una sola cuenta.
 */

const REAL_STUDENT_ID = 'usr-alumno-001'

const NETWORK_DELAY_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getAssignedCoursesAsync(): Promise<AssignedCourse[]> {
  await delay(NETWORK_DELAY_MS)
  return listCourses()
}

export async function getCourseAsync(courseId: string): Promise<AssignedCourse | null> {
  await delay(NETWORK_DELAY_MS)
  return findCourse(courseId)
}

export async function getCertificatesAsync(): Promise<Certificate[]> {
  await delay(NETWORK_DELAY_MS)
  return listCertificates()
}

export async function markCourseCompletedAsync(courseId: string): Promise<AssignedCourse | null> {
  await delay(NETWORK_DELAY_MS)
  const wasAlreadyCompleted = findCourse(courseId)?.status === 'finalizado'
  const course = markCourseCompleted(courseId)
  if (course && !wasAlreadyCompleted) {
    emitAppEvent('COURSE_COMPLETED', { courseId: course.id, courseTitle: course.title, studentId: REAL_STUDENT_ID })
  }
  return course
}
