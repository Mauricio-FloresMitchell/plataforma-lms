import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MockFileInput } from '@/components/MockFileInput'
import { getSubjectDetailAsync } from '@/services/subject.service'
import type { ProfessorSubjectListItem, SubjectStudent } from '@/types/subject'
import type { MockAttachment } from '@/types/subject'
import { announcementSchema, type AnnouncementFormValues } from '../schemas/announcement-schema'

interface AnnouncementFormProps {
  subjects: ProfessorSubjectListItem[]
  defaultSubjectId?: string
  onSubmit: (values: AnnouncementFormValues, targetName: string | undefined, attachments: MockAttachment[]) => Promise<void> | void
}

const FIELD_ERROR = 'text-xs text-destructive'

const SCOPE_LABELS: Record<AnnouncementFormValues['scope'], string> = {
  alumno: 'Un alumno',
  grupo: 'Todo el grupo',
  materia: 'Toda la materia',
}

export function AnnouncementForm({ subjects, defaultSubjectId, onSubmit }: AnnouncementFormProps) {
  const [students, setStudents] = useState<SubjectStudent[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [attachments, setAttachments] = useState<MockAttachment[]>([])

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      subjectId: defaultSubjectId ?? '',
      scope: 'materia',
      targetId: '',
      content: '',
    },
  })

  const subjectId = watch('subjectId')
  const scope = watch('scope')
  const subject = subjects.find((s) => s.id === subjectId)

  useEffect(() => {
    if (!subjectId || scope !== 'alumno') {
      setStudents([])
      return
    }

    let cancelled = false
    setIsLoadingStudents(true)
    getSubjectDetailAsync(subjectId, 'profesor')
      .then((detail) => {
        if (!cancelled) setStudents(detail?.students ?? [])
      })
      .finally(() => {
        if (!cancelled) setIsLoadingStudents(false)
      })

    return () => {
      cancelled = true
    }
  }, [subjectId, scope])

  useEffect(() => {
    setValue('targetId', '')
  }, [scope, setValue])

  function handleFormSubmit(values: AnnouncementFormValues) {
    const targetName =
      values.scope === 'alumno'
        ? students.find((s) => s.id === values.targetId)?.name
        : values.scope === 'grupo'
          ? subject?.groupName
          : undefined

    return onSubmit(values, targetName, attachments)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subjectId">Materia</Label>
        <Controller
          control={control}
          name="subjectId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="subjectId" className="h-10 w-full" aria-invalid={!!errors.subjectId}>
                <SelectValue placeholder="Selecciona una materia" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.subjectId ? <p className={FIELD_ERROR}>{errors.subjectId.message}</p> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="scope">Enviar a</Label>
        <Controller
          control={control}
          name="scope"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={!subjectId}>
              <SelectTrigger id="scope" className="h-10 w-full" aria-invalid={!!errors.scope}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SCOPE_LABELS) as AnnouncementFormValues['scope'][]).map((value) => (
                  <SelectItem key={value} value={value}>
                    {SCOPE_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {scope === 'alumno' && subjectId ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="targetId">Alumno</Label>
          <Controller
            control={control}
            name="targetId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={isLoadingStudents}>
                <SelectTrigger id="targetId" className="h-10 w-full" aria-invalid={!!errors.targetId}>
                  <SelectValue placeholder={isLoadingStudents ? 'Cargando alumnos…' : 'Selecciona un alumno'} />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.targetId ? <p className={FIELD_ERROR}>{errors.targetId.message}</p> : null}
        </div>
      ) : null}

      {scope === 'grupo' && subject ? (
        <p className="text-sm text-muted-foreground">
          Se enviará a todo el grupo <span className="font-medium text-foreground">{subject.groupName}</span>.
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="content">Contenido</Label>
        <Textarea
          id="content"
          placeholder="Escribe el aviso…"
          className="min-h-28"
          aria-invalid={!!errors.content}
          {...register('content')}
        />
        {errors.content ? <p className={FIELD_ERROR}>{errors.content.message}</p> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Adjunto</Label>
        <MockFileInput
          label="Adjuntar archivo"
          kind="archivo"
          attachments={attachments}
          onAdd={(a) => setAttachments((prev) => [...prev, a])}
          onRemove={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Enviando…
          </>
        ) : (
          'Enviar aviso'
        )}
      </Button>
    </form>
  )
}
