import { createTitulacionMockAdapter } from './adapters/titulacion.mock-adapter'
import type {
  TitulacionDeliverable,
  TitulacionEvidenceKind,
  TitulacionFeedbackType,
  TitulacionFile,
  TitulacionPhase,
  TitulacionPhaseStatus,
  TitulacionProduct,
  TitulacionProductStatus,
} from '@/types/titulacion'

/**
 * Contrato del Producto de Titulación (Sprint 18, Parte 16: "Preparar
 * Backend"). `services/titulacion.service.ts` depende únicamente de esta
 * interfaz, nunca de un almacén concreto — hoy la implementa
 * `repositories/adapters/titulacion.mock-adapter.ts` (datos en memoria);
 * conectar una API real implica escribir un segundo adaptador
 * (`TitulacionApiAdapter implements TitulacionRepository`) y cambiar una
 * sola línea en `getTitulacionRepository()`. Ningún componente ni el
 * servicio cambian.
 *
 * Mismo principio que ya documenta el TDD para `auth.service.ts` desde el
 * Sprint 1 ("migrar a JWT implica reemplazar el cuerpo de esas funciones");
 * aquí se hace explícito con una interfaz nombrada porque este sprint pide
 * expresamente "crear interfaces… preparar repositorios… preparar
 * adaptadores" para el núcleo del modelo académico.
 */
export interface TitulacionRepository {
  getProduct(studentId: string): Promise<TitulacionProduct | null>
  listProducts(): Promise<TitulacionProduct[]>

  saveDeliverableDraft(
    studentId: string,
    phaseId: string,
    deliverableId: string,
    draftContent: string,
    files: TitulacionFile[],
  ): Promise<TitulacionDeliverable | null>

  /** Publica la versión final de una fase: incrementa `version`, agrega snapshot y marca entregables con contenido como enviados. */
  publishPhase(
    studentId: string,
    phaseId: string,
    author: { id: string; name: string },
    comment: string,
  ): Promise<TitulacionPhase | null>

  /** Duplica una versión ya publicada como nuevo borrador editable, sin perder el historial de versiones previo. */
  duplicatePhaseVersion(
    studentId: string,
    phaseId: string,
    versionNumber: number,
    author: { id: string; name: string },
  ): Promise<TitulacionPhase | null>

  addPhaseFeedback(
    studentId: string,
    phaseId: string,
    entry: { type: TitulacionFeedbackType; authorId: string; authorName: string; content: string },
  ): Promise<TitulacionPhase | null>

  reviewPhase(
    studentId: string,
    phaseId: string,
    action: Extract<TitulacionPhaseStatus, 'aprobada' | 'rechazada'>,
    feedback: string,
    author: { id: string; name: string },
  ): Promise<TitulacionPhase | null>

  addProductObservation(studentId: string, observation: string, author: { id: string; name: string }): Promise<TitulacionProduct | null>

  /** Punto único de entrada de la sincronización automática (Sprint 18, Parte 7). */
  attachEvidence(
    studentId: string,
    evidence: { kind: TitulacionEvidenceKind; label: string; link?: string },
    historyDetail: string,
    sourceModule: string,
  ): Promise<void>

  recordFileDownload(studentId: string, fileId: string, actor: { id: string; name: string }): Promise<void>

  // Administrador (Sprint 18, Parte 12)
  reassignProfessor(studentId: string, professorId: string, professorName: string, actor: { id: string; name: string }): Promise<TitulacionProduct | null>
  unlockPhase(studentId: string, phaseId: string, actor: { id: string; name: string }): Promise<TitulacionPhase | null>
  setProductStatus(studentId: string, status: TitulacionProductStatus, actor: { id: string; name: string }, reason?: string): Promise<TitulacionProduct | null>
}

/**
 * Punto único de resolución del adaptador. Hoy siempre devuelve el
 * adaptador en memoria; el día que exista un backend real, esta función es
 * el único lugar que cambia (por ejemplo, eligiendo entre
 * `TitulacionMockAdapter` y `TitulacionApiAdapter` según una variable de
 * entorno) — `services/titulacion.service.ts` no se entera.
 */
export function getTitulacionRepository(): TitulacionRepository {
  return createTitulacionMockAdapter()
}
