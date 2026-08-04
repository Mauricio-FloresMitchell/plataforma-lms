export type TitulacionExportFormat = 'pdf' | 'word' | 'repositorio'

export interface TitulacionExportResult {
  ready: boolean
  message: string
}

/**
 * Arquitectura de exportación del Producto de Titulación (Sprint 18, Parte
 * 15: "preparar arquitectura... sin implementarla"). Mismo patrón de
 * adaptador que `@/repositories/titulacion.repository` — el día que exista
 * generación real de PDF/Word o un repositorio institucional, se agrega un
 * segundo adaptador (`TitulacionPdfExportAdapter`, etc.) y se cambia solo
 * `getTitulacionExportAdapter()`.
 */
export interface TitulacionExportAdapter {
  exportProduct(productId: string, format: TitulacionExportFormat): Promise<TitulacionExportResult>
}

class StubTitulacionExportAdapter implements TitulacionExportAdapter {
  async exportProduct(_productId: string, format: TitulacionExportFormat): Promise<TitulacionExportResult> {
    const FORMAT_LABEL: Record<TitulacionExportFormat, string> = {
      pdf: 'PDF',
      word: 'Word',
      repositorio: 'repositorio institucional completo',
    }
    return { ready: false, message: `La exportación a ${FORMAT_LABEL[format]} está en preparación y estará disponible en un próximo sprint.` }
  }
}

export function getTitulacionExportAdapter(): TitulacionExportAdapter {
  return new StubTitulacionExportAdapter()
}
