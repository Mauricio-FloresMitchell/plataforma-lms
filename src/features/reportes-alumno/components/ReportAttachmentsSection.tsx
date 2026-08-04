import { useRef, useState } from 'react'
import { Paperclip, Link2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ReportEvidence, ReportLink, ReportLinkPlatform } from '@/types/report'
import {
  REPORT_FILE_ACCEPT,
  REPORT_FILE_KIND_LABELS,
  REPORT_LINK_PLATFORM_LABELS,
  detectReportFileKind,
  isValidReportLinkUrl,
} from '@/utils/reportAttachments'
import type { ReportFormErrors } from '../schemas/report-schema'

interface ReportAttachmentsSectionProps {
  evidences: ReportEvidence[]
  links: ReportLink[]
  errors: ReportFormErrors
  onAddEvidence: (evidence: ReportEvidence) => void
  onRemoveEvidence: (id: string) => void
  onAddLink: (link: ReportLink) => void
  onRemoveLink: (id: string) => void
}

/** Adjuntos de un reporte: archivos simulados (PDF, DOCX, XLSX, PPTX, JPG, PNG, ZIP) y enlaces externos. */
export function ReportAttachmentsSection({
  evidences,
  links,
  errors,
  onAddEvidence,
  onRemoveEvidence,
  onAddLink,
  onRemoveLink,
}: ReportAttachmentsSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [platform, setPlatform] = useState<ReportLinkPlatform>('github')
  const [url, setUrl] = useState('')
  const [linkError, setLinkError] = useState<string | null>(null)

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      const fileKind = detectReportFileKind(file.name)
      if (fileKind) {
        onAddEvidence({ id: `ev-${Date.now()}`, name: file.name, fileKind })
      }
    }
    event.target.value = ''
  }

  function handleAddLink() {
    if (!isValidReportLinkUrl(platform, url)) {
      setLinkError(`Ingresa un enlace válido de ${REPORT_LINK_PLATFORM_LABELS[platform]}.`)
      return
    }
    onAddLink({ id: `link-${Date.now()}`, platform, url: url.trim() })
    setUrl('')
    setLinkError(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <input ref={inputRef} type="file" accept={REPORT_FILE_ACCEPT} className="hidden" onChange={handleFileSelected} />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <Paperclip className="size-4" />
          Adjuntar archivo
        </Button>

        {evidences.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {evidences.map((evidence) => (
              <li
                key={evidence.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-1.5 text-sm"
              >
                <span className="flex items-center gap-2 truncate">
                  <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{evidence.name}</span>
                  {evidence.fileKind ? (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      ({REPORT_FILE_KIND_LABELS[evidence.fileKind]})
                    </span>
                  ) : null}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveEvidence(evidence.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label={`Quitar ${evidence.name}`}
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Enlace externo</Label>
        <div className="flex flex-wrap gap-2">
          <Select value={platform} onValueChange={(value) => setPlatform(value as ReportLinkPlatform)}>
            <SelectTrigger className="h-10 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(REPORT_LINK_PLATFORM_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://…"
            className="h-10 flex-1 min-w-48"
          />
          <Button type="button" variant="outline" onClick={handleAddLink}>
            <Link2 className="size-4" />
            Agregar
          </Button>
        </div>
        {linkError ? <p className="text-xs text-destructive">{linkError}</p> : null}

        {links.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {links.map((link) => (
              <li
                key={link.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-1.5 text-sm"
              >
                <span className="flex items-center gap-2 truncate">
                  <Link2 className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="shrink-0 text-xs font-medium">{REPORT_LINK_PLATFORM_LABELS[link.platform]}</span>
                  <span className="truncate text-muted-foreground">{link.url}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveLink(link.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label={`Quitar enlace`}
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {errors.attachments ? <p className="text-xs text-destructive">{errors.attachments}</p> : null}
    </div>
  )
}
