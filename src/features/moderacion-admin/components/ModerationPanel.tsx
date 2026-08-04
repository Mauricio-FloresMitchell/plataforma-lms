import { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/ListSkeleton'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  deleteForumComment,
  deleteForumPost,
  getForumModerationLog,
  getForumReports,
  getForumUserModerationStatuses,
  getForumWarnings,
  issueForumWarning,
  restoreForumContent,
  reviewForumReport,
} from '@/services/forum.service'
import type { ForumAuthor, ForumReport, ModerationLogEntry, UserModerationStatus, UserWarning } from '@/types/forum'
import { ReportCard } from './ReportCard'
import { ModerationLogRow } from './ModerationLogRow'
import { UserWarningsCard } from './UserWarningsCard'

type Tab = 'pendientes' | 'resueltos' | 'historial' | 'advertencias'

const TABS: { id: Tab; label: string }[] = [
  { id: 'pendientes', label: 'Reportes pendientes' },
  { id: 'resueltos', label: 'Reportes resueltos' },
  { id: 'historial', label: 'Historial de moderación' },
  { id: 'advertencias', label: 'Usuarios con advertencias' },
]

/**
 * Moderación del Foro (Sprint 13.2), extraído a un panel sin cabecera propia
 * en el Sprint 19, Parte 7: se fusionó con el Foro (antes vivía en una ruta
 * y sección de Administrador independientes, `/admin/moderacion`) — se
 * monta como una pestaña más dentro de `ForumListPage` cuando el rol es
 * Administrador, en vez de duplicar el punto de entrada.
 */
export function ModerationPanel() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('pendientes')
  const [reports, setReports] = useState<ForumReport[]>([])
  const [log, setLog] = useState<ModerationLogEntry[]>([])
  const [warnings, setWarnings] = useState<UserWarning[]>([])
  const [statuses, setStatuses] = useState<UserModerationStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const moderator: ForumAuthor | null = user
    ? { id: user.id, name: user.name, role: user.role, initials: user.avatarInitials }
    : null

  function reload() {
    setIsLoading(true)
    Promise.all([getForumReports(), getForumModerationLog(), getForumWarnings(), getForumUserModerationStatuses()]).then(
      ([reportsData, logData, warningsData, statusesData]) => {
        setReports(reportsData)
        setLog(logData)
        setWarnings(warningsData)
        setStatuses(statusesData)
        setIsLoading(false)
      },
    )
  }

  useEffect(reload, [])

  async function handleIgnore(reportId: string) {
    if (!moderator) return
    await reviewForumReport(reportId, 'ignorar', moderator)
    reload()
  }

  async function handleResolve(reportId: string) {
    if (!moderator) return
    await reviewForumReport(reportId, 'resolver', moderator)
    reload()
  }

  async function handleDeleteContent(report: ForumReport) {
    if (!moderator) return
    if (!window.confirm('¿Eliminar este contenido? Podrás restaurarlo desde el historial.')) return
    if (report.targetType === 'post') {
      await deleteForumPost(report.postId, moderator, report.id)
    } else {
      await deleteForumComment(report.postId, report.targetType, report.targetId, moderator, report.id)
    }
    reload()
  }

  async function handleWarn(reportId: string, message: string) {
    if (!moderator) return
    await issueForumWarning(reportId, message, moderator)
    reload()
  }

  async function handleRestore(logEntryId: string) {
    if (!moderator) return
    await restoreForumContent(logEntryId, moderator)
    reload()
  }

  const pendingReports = reports.filter((item) => item.status === 'pendiente')
  const resolvedReports = reports.filter((item) => item.status !== 'pendiente')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              tab === item.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {item.label}
            {item.id === 'pendientes' && pendingReports.length > 0 ? ` (${pendingReports.length})` : ''}
          </button>
        ))}
      </div>

      {isLoading ? (
        <ListSkeleton variant="block" count={3} blockHeight="h-32" />
      ) : (
        <>
          {tab === 'pendientes' ? (
            pendingReports.length === 0 ? (
              <EmptyState icon={ShieldAlert} title="Sin reportes pendientes" description="No hay reportes por revisar en este momento." />
            ) : (
              <div className="flex flex-col gap-3">
                {pendingReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onIgnore={() => handleIgnore(report.id)}
                    onResolve={() => handleResolve(report.id)}
                    onDeleteContent={() => handleDeleteContent(report)}
                    onWarn={(message) => handleWarn(report.id, message)}
                  />
                ))}
              </div>
            )
          ) : null}

          {tab === 'resueltos' ? (
            resolvedReports.length === 0 ? (
              <EmptyState icon={ShieldAlert} title="Sin reportes resueltos" description="Aún no se ha resuelto ningún reporte." />
            ) : (
              <div className="flex flex-col gap-3">
                {resolvedReports.map((report) => (
                  <ReportCard key={report.id} report={report} readOnly />
                ))}
              </div>
            )
          ) : null}

          {tab === 'historial' ? (
            log.length === 0 ? (
              <EmptyState icon={ShieldAlert} title="Sin historial" description="Todavía no se ha registrado ninguna acción de moderación." />
            ) : (
              <div className="flex flex-col gap-3">
                {log.map((entry) => (
                  <ModerationLogRow key={entry.id} entry={entry} onRestore={() => handleRestore(entry.id)} />
                ))}
              </div>
            )
          ) : null}

          {tab === 'advertencias' ? (
            statuses.length === 0 ? (
              <EmptyState icon={ShieldAlert} title="Sin advertencias" description="Ningún usuario tiene advertencias registradas." />
            ) : (
              <div className="flex flex-col gap-3">
                {statuses.map((status) => (
                  <UserWarningsCard
                    key={status.userId}
                    status={status}
                    warnings={warnings.filter((warning) => warning.userId === status.userId)}
                  />
                ))}
              </div>
            )
          ) : null}
        </>
      )}
    </div>
  )
}
