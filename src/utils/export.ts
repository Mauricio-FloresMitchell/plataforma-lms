/**
 * Exportación client-side reutilizada por Reportes, Leaderboard, Auditoría y
 * Backups (Sprint 13). No hay servidor ni librería de generación de
 * archivos: "Exportar Excel" produce un CSV (que Excel abre nativamente) y
 * "Exportar PDF" produce un HTML imprimible (el navegador lo convierte a PDF
 * vía "Imprimir → Guardar como PDF") — ambos honestos sobre lo que generan,
 * sin agregar dependencias nuevas.
 */

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/** Exporta filas como CSV (abre nativamente en Excel/Sheets). */
export function downloadCsv(filename: string, rows: Record<string, string | number>[]): void {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`
  const csv = [headers.join(','), ...rows.map((row) => headers.map((header) => escape(row[header] ?? '')).join(','))].join('\n')
  triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename)
}

/** Exporta contenido serializable como JSON. */
export function downloadJson(filename: string, data: unknown): void {
  triggerDownload(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), filename)
}

/** Exporta un documento HTML imprimible (equivalente a "Exportar PDF" sin librería de generación). */
export function downloadPrintableHtml(filename: string, title: string, bodyHtml: string): void {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:sans-serif;padding:2rem;color:#1a1a1a} h1{font-size:1.25rem} table{width:100%;border-collapse:collapse;margin-top:1rem} td,th{border:1px solid #ddd;padding:6px 8px;text-align:left;font-size:0.85rem}</style>
</head><body><h1>${title}</h1>${bodyHtml}</body></html>`
  triggerDownload(new Blob([html], { type: 'text/html;charset=utf-8;' }), filename)
}
