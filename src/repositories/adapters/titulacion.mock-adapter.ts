import type { TitulacionRepository } from '@/repositories/titulacion.repository'
import type {
  TitulacionDeliverable,
  TitulacionEvidenceKind,
  TitulacionFeedbackType,
  TitulacionFile,
  TitulacionPhase,
  TitulacionProduct,
  TitulacionProductStatus,
} from '@/types/titulacion'

/**
 * Adaptador en memoria del `TitulacionRepository` (Sprint 18, Parte 16).
 *
 * Es el único archivo del módulo que conoce la forma real del
 * almacenamiento (hoy: un objeto en memoria; mañana: el mismo contrato
 * implementado contra una API real). `services/titulacion.service.ts` nunca
 * importa este archivo directamente — siempre a través de
 * `getTitulacionRepository()` (`repositories/titulacion.repository.ts`).
 */

let sequence = 0
function nextId(prefix: string): string {
  sequence += 1
  return `${prefix}-${sequence}`
}

function seedProducts(): Record<string, TitulacionProduct> {
  return {
    'usr-alumno-001': {
      id: 'tit-001',
      studentId: 'usr-alumno-001',
      studentName: 'María García López',
      objective: 'Diseñar e implementar un tablero de indicadores estratégicos para PyMEs del sector retail.',
      status: 'activo',
      careerId: 'car-001',
      careerName: 'Administración',
      subjectId: 'sub-001',
      subjectName: 'Administración Estratégica',
      professorId: 'usr-profesor-001',
      professorName: 'Ing. Carlos Mendoza',
      version: 3,
      createdAt: '2026-03-10T09:00:00.000Z',
      updatedAt: '2026-07-28T10:00:00.000Z',
      progressPercentage: 20,
      completedDeliverables: 1,
      pendingDeliverables: 6,
      competencies: ['Pensamiento Estratégico', 'Análisis de Datos'],
      observations: 'Buen avance general. Reforzar el marco teórico antes de someter el documento a revisión final.',
      phases: [
        {
          id: 'fase-1',
          title: 'Fase 1 — Propuesta',
          description: 'Planteamiento del problema, objetivos y justificación del proyecto de titulación.',
          objectives: ['Definir el problema a resolver', 'Justificar la viabilidad del proyecto'],
          status: 'aprobada',
          date: '2026-03-18T12:00:00.000Z',
          version: 2,
          versions: [
            {
              version: 1,
              authorId: 'usr-alumno-001',
              authorName: 'María García López',
              createdAt: '2026-03-15T09:00:00.000Z',
              comment: 'Primera versión de la propuesta.',
              changesSummary: 'Creación del planteamiento del problema y objetivos iniciales.',
            },
            {
              version: 2,
              authorId: 'usr-alumno-001',
              authorName: 'María García López',
              createdAt: '2026-03-16T09:00:00.000Z',
              comment: 'Ajustes solicitados por el profesor.',
              changesSummary: 'Se amplió la justificación y se agregó un caso de referencia.',
            },
          ],
          feedback: [
            {
              id: nextId('fb'),
              type: 'aprobacion',
              authorId: 'usr-profesor-001',
              authorName: 'Ing. Carlos Mendoza',
              content: 'Propuesta clara y viable. Aprobada sin observaciones.',
              createdAt: '2026-03-18T12:00:00.000Z',
            },
          ],
          deliverables: [
            {
              id: 'ent-1-1',
              title: 'Planteamiento del problema',
              status: 'aprobado',
              dueDate: '2026-03-15',
              draftContent: 'El problema identificado consiste en la falta de indicadores de desempeño en PyMEs del sector retail.',
              files: [{ id: 'f-1', name: 'planteamiento.pdf', kind: 'pdf', version: 1, uploadedById: 'usr-alumno-001', uploadedByName: 'María García López', uploadedAt: '2026-03-14T10:00:00.000Z', url: '#' }],
              evidence: [{ id: 'ev-1', kind: 'reporte', label: 'Reporte semanal 3 — Administración Estratégica', link: '/alumno/reportes/rep-101', syncedAt: '2026-03-12T09:00:00.000Z' }],
              submittedAt: '2026-03-16T09:00:00.000Z',
            },
            {
              id: 'ent-1-2',
              title: 'Objetivos y justificación',
              status: 'aprobado',
              dueDate: '2026-03-22',
              draftContent: 'Objetivo general: diseñar un tablero de indicadores clave.',
              files: [],
              evidence: [],
              submittedAt: '2026-03-16T09:00:00.000Z',
            },
          ],
        },
        {
          id: 'fase-2',
          title: 'Fase 2 — Marco Teórico',
          description: 'Revisión de literatura y marco conceptual que sustenta el proyecto.',
          objectives: ['Revisar al menos 15 fuentes académicas', 'Construir el marco conceptual'],
          status: 'enviada',
          date: '2026-07-20T09:00:00.000Z',
          version: 1,
          versions: [
            {
              version: 1,
              authorId: 'usr-alumno-001',
              authorName: 'María García López',
              createdAt: '2026-07-20T09:00:00.000Z',
              comment: 'Primer envío del marco teórico.',
              changesSummary: 'Se agregó la revisión de literatura completa.',
            },
          ],
          feedback: [],
          deliverables: [
            {
              id: 'ent-2-1',
              title: 'Revisión de literatura',
              status: 'enviado',
              dueDate: '2026-04-20',
              draftContent: 'Se revisaron 15 fuentes académicas sobre modelos de gestión estratégica.',
              files: [{ id: 'f-2', name: 'revision-literatura.pdf', kind: 'pdf', version: 1, uploadedById: 'usr-alumno-001', uploadedByName: 'María García López', uploadedAt: '2026-07-20T09:00:00.000Z', url: '#' }],
              evidence: [],
              submittedAt: '2026-07-20T09:00:00.000Z',
            },
            {
              id: 'ent-2-2',
              title: 'Marco conceptual',
              status: 'en_proceso',
              dueDate: '2026-04-30',
              files: [],
              evidence: [],
            },
          ],
        },
        {
          id: 'fase-3',
          title: 'Fase 3 — Desarrollo',
          description: 'Metodología, resultados preliminares y análisis de resultados.',
          objectives: ['Definir la metodología', 'Obtener resultados preliminares'],
          status: 'pendiente',
          date: '2026-08-05',
          version: 0,
          versions: [],
          feedback: [],
          deliverables: [
            { id: 'ent-3-1', title: 'Metodología', status: 'pendiente', dueDate: '2026-05-25', files: [], evidence: [] },
            { id: 'ent-3-2', title: 'Resultados preliminares', status: 'pendiente', dueDate: '2026-07-10', files: [], evidence: [] },
            { id: 'ent-3-3', title: 'Análisis de resultados', status: 'pendiente', dueDate: '2026-08-05', files: [], evidence: [] },
          ],
        },
        {
          id: 'fase-4',
          title: 'Fase 4 — Documento Final',
          description: 'Integración del documento completo con formato institucional.',
          objectives: ['Integrar todas las secciones', 'Aplicar formato APA'],
          status: 'pendiente',
          date: '2026-09-01',
          version: 0,
          versions: [],
          feedback: [],
          deliverables: [
            { id: 'ent-4-1', title: 'Integración del documento', status: 'pendiente', dueDate: '2026-09-01', files: [], evidence: [] },
            { id: 'ent-4-2', title: 'Revisión de estilo APA', status: 'pendiente', dueDate: '2026-09-10', files: [], evidence: [] },
          ],
        },
        {
          id: 'fase-5',
          title: 'Fase 5 — Defensa',
          description: 'Presentación final ante el comité evaluador.',
          objectives: ['Preparar presentación', 'Ensayar defensa oral'],
          status: 'pendiente',
          date: '2026-09-25',
          version: 0,
          versions: [],
          feedback: [],
          deliverables: [{ id: 'ent-5-1', title: 'Presentación final', status: 'pendiente', dueDate: '2026-09-25', files: [], evidence: [] }],
        },
      ],
      history: [
        { id: nextId('h'), actorId: 'usr-alumno-001', actorName: 'María García López', action: 'creo', detail: 'Creó el Producto de Titulación', source: 'Web · Alumno', createdAt: '2026-03-10T09:00:00.000Z' },
        { id: nextId('h'), actorId: 'usr-alumno-001', actorName: 'María García López', action: 'publico', detail: 'Publicó la versión 1 de "Fase 1 — Propuesta"', source: 'Web · Alumno', phaseId: 'fase-1', createdAt: '2026-03-15T09:00:00.000Z' },
        { id: nextId('h'), actorId: 'usr-alumno-001', actorName: 'María García López', action: 'publico', detail: 'Publicó la versión 2 de "Fase 1 — Propuesta"', source: 'Web · Alumno', phaseId: 'fase-1', createdAt: '2026-03-16T09:00:00.000Z' },
        { id: nextId('h'), actorId: 'usr-profesor-001', actorName: 'Ing. Carlos Mendoza', action: 'aprobo', detail: 'Aprobó "Fase 1 — Propuesta"', source: 'Web · Profesor', phaseId: 'fase-1', createdAt: '2026-03-18T12:00:00.000Z' },
        { id: nextId('h'), actorId: 'usr-alumno-001', actorName: 'María García López', action: 'publico', detail: 'Publicó la versión 1 de "Fase 2 — Marco Teórico"', source: 'Web · Alumno', phaseId: 'fase-2', createdAt: '2026-07-20T09:00:00.000Z' },
      ],
    },
  }
}

let PRODUCTS: Record<string, TitulacionProduct> = seedProducts()
Object.values(PRODUCTS).forEach((product) => {
  const before = product.updatedAt
  recomputeProduct(product)
  product.updatedAt = before // el recálculo inicial no cuenta como una modificación real
})

function recomputeProduct(product: TitulacionProduct): void {
  const approvedPhases = product.phases.filter((phase) => phase.status === 'aprobada').length
  product.progressPercentage = product.phases.length === 0 ? 0 : Math.round((approvedPhases / product.phases.length) * 100)

  const allDeliverables = product.phases.flatMap((phase) => phase.deliverables)
  product.completedDeliverables = allDeliverables.filter((item) => item.status === 'aprobado').length
  product.pendingDeliverables = allDeliverables.length - product.completedDeliverables

  product.updatedAt = new Date().toISOString()
}

function pushHistory(
  product: TitulacionProduct,
  entry: Omit<TitulacionProduct['history'][number], 'id' | 'createdAt'>,
): void {
  product.history = [
    ...product.history,
    { ...entry, id: nextId('h'), createdAt: new Date().toISOString() },
  ]
}

function findPhase(product: TitulacionProduct, phaseId: string): TitulacionPhase | null {
  return product.phases.find((phase) => phase.id === phaseId) ?? null
}

function findDeliverable(phase: TitulacionPhase, deliverableId: string): TitulacionDeliverable | null {
  return phase.deliverables.find((item) => item.id === deliverableId) ?? null
}

class TitulacionMockAdapter implements TitulacionRepository {
  async getProduct(studentId: string): Promise<TitulacionProduct | null> {
    return PRODUCTS[studentId] ?? null
  }

  async listProducts(): Promise<TitulacionProduct[]> {
    return Object.values(PRODUCTS)
  }

  async saveDeliverableDraft(
    studentId: string,
    phaseId: string,
    deliverableId: string,
    draftContent: string,
    files: TitulacionFile[],
  ): Promise<TitulacionDeliverable | null> {
    const product = PRODUCTS[studentId]
    const phase = product && findPhase(product, phaseId)
    const deliverable = phase && findDeliverable(phase, deliverableId)
    if (!product || !phase || !deliverable) return null

    deliverable.draftContent = draftContent
    deliverable.files = files
    if (deliverable.status === 'pendiente') deliverable.status = 'en_proceso'
    if (phase.status === 'pendiente') phase.status = 'en_proceso'
    recomputeProduct(product)
    return deliverable
  }

  async publishPhase(
    studentId: string,
    phaseId: string,
    author: { id: string; name: string },
    comment: string,
  ): Promise<TitulacionPhase | null> {
    const product = PRODUCTS[studentId]
    const phase = product && findPhase(product, phaseId)
    if (!product || !phase) return null

    phase.version += 1
    const changed = phase.deliverables
      .filter((item) => item.draftContent || item.files.length > 0)
      .map((item) => item.title)
    phase.deliverables.forEach((item) => {
      if (item.draftContent || item.files.length > 0) {
        item.status = 'enviado'
        item.submittedAt = new Date().toISOString()
      }
    })
    phase.status = 'enviada'
    phase.versions = [
      ...phase.versions,
      {
        version: phase.version,
        authorId: author.id,
        authorName: author.name,
        createdAt: new Date().toISOString(),
        comment,
        changesSummary: changed.length > 0 ? `Entregables enviados: ${changed.join(', ')}` : 'Sin cambios en entregables.',
      },
    ]
    product.version += 1
    pushHistory(product, {
      actorId: author.id,
      actorName: author.name,
      action: 'publico',
      detail: `Publicó la versión ${phase.version} de "${phase.title}"`,
      source: 'Web · Alumno',
      phaseId,
    })
    recomputeProduct(product)
    return phase
  }

  async duplicatePhaseVersion(
    studentId: string,
    phaseId: string,
    versionNumber: number,
    author: { id: string; name: string },
  ): Promise<TitulacionPhase | null> {
    const product = PRODUCTS[studentId]
    const phase = product && findPhase(product, phaseId)
    const snapshot = phase?.versions.find((item) => item.version === versionNumber)
    if (!product || !phase || !snapshot) return null

    // El contenido íntegro de versiones pasadas no se conserva por entregable
    // (solo el resumen de cambios) — "duplicar" reabre la fase para editar
    // desde su estado actual, dejando trazabilidad de qué versión la originó.
    phase.status = 'en_proceso'
    pushHistory(product, {
      actorId: author.id,
      actorName: author.name,
      action: 'modifico',
      detail: `Reabrió "${phase.title}" a partir de la versión ${versionNumber} para continuar editando`,
      source: 'Web · Alumno',
      phaseId,
    })
    recomputeProduct(product)
    return phase
  }

  async addPhaseFeedback(
    studentId: string,
    phaseId: string,
    entry: { type: TitulacionFeedbackType; authorId: string; authorName: string; content: string },
  ): Promise<TitulacionPhase | null> {
    const product = PRODUCTS[studentId]
    const phase = product && findPhase(product, phaseId)
    if (!product || !phase) return null

    phase.feedback = [
      ...phase.feedback,
      { id: nextId('fb'), ...entry, createdAt: new Date().toISOString() },
    ]
    pushHistory(product, {
      actorId: entry.authorId,
      actorName: entry.authorName,
      action: 'comento',
      detail: `Comentó "${phase.title}"`,
      source: 'Web · Profesor',
      phaseId,
    })
    recomputeProduct(product)
    return phase
  }

  async reviewPhase(
    studentId: string,
    phaseId: string,
    action: 'aprobada' | 'rechazada',
    feedback: string,
    author: { id: string; name: string },
  ): Promise<TitulacionPhase | null> {
    const product = PRODUCTS[studentId]
    const phase = product && findPhase(product, phaseId)
    if (!product || !phase) return null

    phase.status = action
    phase.deliverables.forEach((item) => {
      if (item.status === 'enviado') item.status = action === 'aprobada' ? 'aprobado' : 'rechazado'
    })
    phase.feedback = [
      ...phase.feedback,
      { id: nextId('fb'), type: action === 'aprobada' ? 'aprobacion' : 'rechazo', authorId: author.id, authorName: author.name, content: feedback, createdAt: new Date().toISOString() },
    ]
    product.version += 1
    pushHistory(product, {
      actorId: author.id,
      actorName: author.name,
      action: action === 'aprobada' ? 'aprobo' : 'rechazo',
      detail: `${action === 'aprobada' ? 'Aprobó' : 'Rechazó'} "${phase.title}" — ${feedback}`,
      source: 'Web · Profesor',
      phaseId,
    })
    recomputeProduct(product)
    return phase
  }

  async addProductObservation(studentId: string, observation: string, author: { id: string; name: string }): Promise<TitulacionProduct | null> {
    const product = PRODUCTS[studentId]
    if (!product) return null

    product.observations = observation
    pushHistory(product, {
      actorId: author.id,
      actorName: author.name,
      action: 'modifico',
      detail: 'Agregó una observación general al proyecto',
      source: 'Web · Profesor',
    })
    recomputeProduct(product)
    return product
  }

  async attachEvidence(
    studentId: string,
    evidence: { kind: TitulacionEvidenceKind; label: string; link?: string },
    historyDetail: string,
    sourceModule: string,
  ): Promise<void> {
    const product = PRODUCTS[studentId]
    if (!product) return

    const activePhase = product.phases.find((phase) => phase.status !== 'aprobada') ?? product.phases[product.phases.length - 1]
    if (activePhase) {
      const evidenceEntry = { id: nextId('ev'), ...evidence, syncedAt: new Date().toISOString() }
      if (activePhase.deliverables[0]) {
        activePhase.deliverables[0].evidence = [...activePhase.deliverables[0].evidence, evidenceEntry]
      }
    }

    if (evidence.kind === 'evaluacion' || evidence.kind === 'badge') {
      const competencyLabel = evidence.label
      if (!product.competencies.includes(competencyLabel)) {
        product.competencies = [...product.competencies, competencyLabel]
      }
    }

    pushHistory(product, {
      actorId: 'system',
      actorName: 'Sincronización automática',
      action: 'sincronizo',
      detail: historyDetail,
      source: `Sync · ${sourceModule}`,
    })
    recomputeProduct(product)
  }

  async recordFileDownload(studentId: string, fileId: string, actor: { id: string; name: string }): Promise<void> {
    const product = PRODUCTS[studentId]
    if (!product) return
    const file = product.phases.flatMap((phase) => phase.deliverables).flatMap((item) => item.files).find((item) => item.id === fileId)
    pushHistory(product, {
      actorId: actor.id,
      actorName: actor.name,
      action: 'descargo',
      detail: file ? `Descargó "${file.name}"` : `Descargó un archivo (${fileId})`,
      source: 'Web',
    })
  }

  async reassignProfessor(studentId: string, professorId: string, professorName: string, actor: { id: string; name: string }): Promise<TitulacionProduct | null> {
    const product = PRODUCTS[studentId]
    if (!product) return null
    const previous = product.professorName
    product.professorId = professorId
    product.professorName = professorName
    product.version += 1
    pushHistory(product, {
      actorId: actor.id,
      actorName: actor.name,
      action: 'reasigno_profesor',
      detail: `Reasignó el profesor de "${previous ?? 'sin asignar'}" a "${professorName}"`,
      source: 'Web · Administrador',
    })
    recomputeProduct(product)
    return product
  }

  async unlockPhase(studentId: string, phaseId: string, actor: { id: string; name: string }): Promise<TitulacionPhase | null> {
    const product = PRODUCTS[studentId]
    const phase = product && findPhase(product, phaseId)
    if (!product || !phase) return null
    phase.status = 'en_proceso'
    pushHistory(product, {
      actorId: actor.id,
      actorName: actor.name,
      action: 'desbloqueo_fase',
      detail: `Desbloqueó "${phase.title}"`,
      source: 'Web · Administrador',
      phaseId,
    })
    recomputeProduct(product)
    return phase
  }

  async setProductStatus(studentId: string, status: TitulacionProductStatus, actor: { id: string; name: string }, reason?: string): Promise<TitulacionProduct | null> {
    const product = PRODUCTS[studentId]
    if (!product) return null
    product.status = status
    product.version += 1
    pushHistory(product, {
      actorId: actor.id,
      actorName: actor.name,
      action: status === 'cerrado' ? 'cerro_producto' : 'edito_estado',
      detail: `Cambió el estado a "${status}"${reason ? ` — ${reason}` : ''}`,
      source: 'Web · Administrador',
    })
    recomputeProduct(product)
    return product
  }
}

let singleton: TitulacionMockAdapter | null = null

export function createTitulacionMockAdapter(): TitulacionRepository {
  if (!singleton) singleton = new TitulacionMockAdapter()
  return singleton
}
