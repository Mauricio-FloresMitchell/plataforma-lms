import type { ReportCareer, ReportTemplate, TemplateId } from '@/types/reportTemplate'

/**
 * Contenido de muestra de las 7 plantillas académicas (Sprint 12).
 *
 * No existe un documento fuente con el contenido exacto de cada plantilla;
 * por decisión del Product Owner (2026-07-29) se diseñó contenido de ejemplo
 * razonable por carrera, editable a futuro sin tocar el motor de renderizado
 * (`@/types/reportTemplate`, `ReportTemplateForm`) ni el resto del módulo.
 *
 * Estado en memoria: no hay mutadores, las 7 plantillas son fijas durante la sesión.
 */

const MIN_ANSWER_LENGTH = 20

function q(id: string, label: string, placeholder?: string) {
  return { id, label, placeholder, minLength: MIN_ANSWER_LENGTH }
}

const TEMPLATES: Record<TemplateId, ReportTemplate> = {
  R01: {
    id: 'R01',
    careers: ['Administración', 'Negocios Internacionales'],
    name: 'R01 · Administración, Negocios y Contaduría',
    titulacionProduct: 'Plan de Negocios',
    titulacionHelpText: 'Explica cómo el avance de esta semana se incorpora a tu Plan de Negocios.',
    specificFields: [
      { id: 'empresa', label: 'Empresa u organización asignada', type: 'text', required: true },
      { id: 'areaAsignada', label: 'Área o departamento de práctica', type: 'text', required: true },
      { id: 'supervisorExterno', label: 'Nombre del supervisor externo', type: 'text', required: true },
    ],
    weeklyQuestions: {
      1: [
        q('diagnostico', 'Describe el diagnóstico inicial de la empresa u organización asignada'),
        q('objetivos', '¿Qué objetivos planteaste para tu intervención?'),
      ],
      2: [
        q('avanceMetodologico', 'Describe el avance metodológico de la semana'),
        q('herramientasAplicadas', '¿Qué herramientas de análisis aplicaste?'),
      ],
      3: [
        q('resultadosPreliminares', '¿Qué resultados preliminares obtuviste?'),
        q('dificultades', '¿Qué dificultades enfrentaste y cómo las resolviste?'),
      ],
      4: [
        q('resultadosFinales', 'Resume los resultados finales de este periodo'),
        q('integracionPlan', '¿Cómo estos resultados se integran a tu Plan de Negocios?'),
      ],
    },
    requiresAnonymization: false,
    filesRequired: true,
  },
  R02: {
    id: 'R02',
    careers: ['Ingeniería en Sistemas'],
    name: 'R02 · Ingeniería en Sistemas',
    titulacionProduct: 'Sistema o Aplicación de Software',
    titulacionHelpText: 'Explica cómo el avance de esta semana se incorpora a tu sistema o aplicación de titulación.',
    specificFields: [
      { id: 'repositorio', label: 'Repositorio del proyecto (GitHub u otro)', type: 'text', required: true },
      { id: 'stackTecnologico', label: 'Stack tecnológico utilizado', type: 'text', required: true },
      { id: 'entornoDespliegue', label: 'Entorno de despliegue (si aplica)', type: 'text', required: false },
    ],
    weeklyQuestions: {
      1: [
        q('requerimientos', 'Describe los requerimientos funcionales identificados'),
        q('arquitectura', '¿Qué arquitectura propusiste para el sistema?'),
      ],
      2: [
        q('avanceDesarrollo', 'Describe el avance de desarrollo de esta semana'),
        q('modulosImplementados', '¿Qué módulos o funcionalidades implementaste?'),
      ],
      3: [
        q('pruebas', '¿Qué pruebas realizaste y qué resultados obtuviste?'),
        q('bugsResueltos', 'Describe errores encontrados y cómo los resolviste'),
      ],
      4: [
        q('resultadosFinales', 'Resume el estado final del sistema'),
        q('integracionProducto', '¿Cómo este avance se integra a tu producto de titulación?'),
      ],
    },
    requiresAnonymization: false,
    filesRequired: true,
  },
  R03: {
    id: 'R03',
    careers: ['Derecho'],
    name: 'R03 · Derecho',
    titulacionProduct: 'Expediente o Caso Práctico Jurídico',
    titulacionHelpText: 'Explica cómo el avance de esta semana se incorpora a tu expediente de titulación.',
    specificFields: [
      { id: 'materiaJuridica', label: 'Materia jurídica del caso (civil, penal, laboral, etc.)', type: 'text', required: true },
      { id: 'instanciaAsignada', label: 'Instancia o despacho donde realizas tu práctica', type: 'text', required: true },
      {
        id: 'clienteAnonimo',
        label: 'Identificador del caso (iniciales o clave — nunca el nombre completo)',
        type: 'text',
        required: true,
      },
    ],
    weeklyQuestions: {
      1: [
        q('planteamiento', 'Describe el planteamiento del caso asignado (sin datos identificables)'),
        q('marcoLegal', '¿Qué marco legal aplica al caso?'),
      ],
      2: [
        q('avanceProcesal', 'Describe el avance procesal o documental de la semana'),
        q('estrategiaJuridica', '¿Qué estrategia jurídica propusiste?'),
      ],
      3: [
        q('resultadosParciales', '¿Qué resultados parciales obtuviste?'),
        q('retosEticos', '¿Qué retos éticos o de confidencialidad enfrentaste?'),
      ],
      4: [
        q('cierreCaso', 'Resume el estado de cierre del caso en este periodo'),
        q('integracionExpediente', '¿Cómo este avance se integra a tu expediente de titulación?'),
      ],
    },
    requiresAnonymization: true,
    filesRequired: true,
  },
  R04: {
    id: 'R04',
    careers: ['Pedagogía'],
    name: 'R04 · Pedagogía',
    titulacionProduct: 'Plan de Intervención Educativa',
    titulacionHelpText: 'Explica cómo el avance de esta semana se incorpora a tu Plan de Intervención Educativa.',
    specificFields: [
      { id: 'institucionEducativa', label: 'Institución educativa asignada', type: 'text', required: true },
      { id: 'nivelEducativo', label: 'Nivel educativo (preescolar, primaria, secundaria, etc.)', type: 'text', required: true },
      { id: 'grupoAtendido', label: 'Grupo o población atendida', type: 'text', required: true },
    ],
    weeklyQuestions: {
      1: [
        q('diagnosticoEducativo', 'Describe el diagnóstico educativo del grupo atendido'),
        q('necesidadesDetectadas', '¿Qué necesidades de aprendizaje detectaste?'),
      ],
      2: [
        q('planeacionDidactica', 'Describe la planeación didáctica de la semana'),
        q('estrategiasAplicadas', '¿Qué estrategias pedagógicas aplicaste?'),
      ],
      3: [
        q('resultadosAprendizaje', '¿Qué resultados de aprendizaje observaste?'),
        q('ajustesRealizados', '¿Qué ajustes realizaste a tu planeación?'),
      ],
      4: [
        q('evaluacionFinal', 'Resume la evaluación final del periodo'),
        q('integracionPlan', '¿Cómo este avance se integra a tu Plan de Intervención Educativa?'),
      ],
    },
    requiresAnonymization: false,
    filesRequired: true,
  },
  R05: {
    id: 'R05',
    careers: ['Psicología'],
    name: 'R05 · Psicología',
    titulacionProduct: 'Reporte de Caso Clínico o Programa de Intervención',
    titulacionHelpText: 'Explica cómo el avance de esta semana se incorpora a tu reporte de caso o programa de intervención.',
    specificFields: [
      { id: 'institucionAsignada', label: 'Institución o consultorio asignado', type: 'text', required: true },
      { id: 'areaPsicologica', label: 'Área de intervención (clínica, educativa, organizacional, etc.)', type: 'text', required: true },
      {
        id: 'pacienteAnonimo',
        label: 'Identificador del caso (iniciales o clave — nunca el nombre completo)',
        type: 'text',
        required: true,
      },
    ],
    weeklyQuestions: {
      1: [
        q('motivoConsulta', 'Describe el motivo de consulta o intervención (sin datos identificables)'),
        q('evaluacionInicial', '¿Qué evaluación inicial realizaste?'),
      ],
      2: [
        q('avanceIntervencion', 'Describe el avance de la intervención de la semana'),
        q('tecnicasAplicadas', '¿Qué técnicas psicológicas aplicaste?'),
      ],
      3: [
        q('resultadosObservados', '¿Qué resultados observaste en el caso?'),
        q('consideracionesEticas', '¿Qué consideraciones éticas y de confidencialidad aplicaste?'),
      ],
      4: [
        q('cierreIntervencion', 'Resume el estado de cierre de la intervención'),
        q('integracionReporte', '¿Cómo este avance se integra a tu reporte de caso?'),
      ],
    },
    requiresAnonymization: true,
    filesRequired: true,
  },
  R06: {
    id: 'R06',
    careers: ['Contabilidad'],
    name: 'R06 · Contaduría Pública',
    titulacionProduct: 'Dictamen o Informe Financiero',
    titulacionHelpText: 'Explica cómo el avance de esta semana se incorpora a tu Dictamen o Informe Financiero.',
    specificFields: [
      { id: 'empresaAsignada', label: 'Empresa u organización asignada', type: 'text', required: true },
      { id: 'areaContable', label: 'Área contable o financiera de práctica', type: 'text', required: true },
      { id: 'periodoFiscal', label: 'Periodo fiscal analizado', type: 'text', required: true },
    ],
    weeklyQuestions: {
      1: [
        q('diagnosticoFinanciero', 'Describe el diagnóstico financiero inicial'),
        q('informacionRecopilada', '¿Qué información contable recopilaste?'),
      ],
      2: [
        q('avanceAnalisis', 'Describe el avance del análisis financiero de la semana'),
        q('indicadoresCalculados', '¿Qué indicadores o razones financieras calculaste?'),
      ],
      3: [
        q('hallazgosPreliminares', '¿Qué hallazgos preliminares identificaste?'),
        q('observacionesControl', '¿Qué observaciones de control interno realizaste?'),
      ],
      4: [
        q('conclusionesFinales', 'Resume las conclusiones finales del periodo'),
        q('integracionDictamen', '¿Cómo este avance se integra a tu Dictamen o Informe Financiero?'),
      ],
    },
    requiresAnonymization: false,
    filesRequired: true,
  },
  R07: {
    id: 'R07',
    careers: ['Mercadotecnia'],
    name: 'R07 · Mercadotecnia',
    titulacionProduct: 'Plan de Mercadotecnia o Campaña',
    titulacionHelpText: 'Explica cómo el avance de esta semana se incorpora a tu Plan de Mercadotecnia.',
    specificFields: [
      { id: 'marcaAsignada', label: 'Marca, empresa o producto asignado', type: 'text', required: true },
      { id: 'segmentoObjetivo', label: 'Segmento de mercado objetivo', type: 'text', required: true },
      { id: 'canalesUtilizados', label: 'Canales utilizados (digital, tradicional, mixto)', type: 'text', required: false },
    ],
    weeklyQuestions: {
      1: [
        q('diagnosticoMercado', 'Describe el diagnóstico de mercado inicial'),
        q('analisisCompetencia', '¿Qué análisis de competencia realizaste?'),
      ],
      2: [
        q('avanceEstrategia', 'Describe el avance de la estrategia de mercadotecnia'),
        q('tacticasPropuestas', '¿Qué tácticas o piezas propusiste?'),
      ],
      3: [
        q('resultadosCampana', '¿Qué resultados preliminares de campaña obtuviste?'),
        q('metricasObservadas', '¿Qué métricas observaste (alcance, engagement, conversión)?'),
      ],
      4: [
        q('resultadosFinales', 'Resume los resultados finales del periodo'),
        q('integracionPlan', '¿Cómo este avance se integra a tu Plan de Mercadotecnia?'),
      ],
    },
    requiresAnonymization: false,
    filesRequired: true,
  },
}

const CAREER_TO_TEMPLATE: Record<ReportCareer, TemplateId> = {
  'Administración': 'R01',
  'Negocios Internacionales': 'R01',
  'Ingeniería en Sistemas': 'R02',
  'Derecho': 'R03',
  'Pedagogía': 'R04',
  'Psicología': 'R05',
  'Contabilidad': 'R06',
  'Mercadotecnia': 'R07',
}

export function getReportTemplate(templateId: TemplateId): ReportTemplate {
  return TEMPLATES[templateId]
}

export function getAllReportTemplates(): ReportTemplate[] {
  return Object.values(TEMPLATES)
}

export function getTemplateIdForCareer(career: ReportCareer): TemplateId {
  return CAREER_TO_TEMPLATE[career]
}
