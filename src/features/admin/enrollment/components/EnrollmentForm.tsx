import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { enrollmentSchema, type EnrollmentFormValues } from '../schemas/enrollment-schema'
import {
  CARRERAS_LICENCIATURA,
  MODALIDADES_PREPA,
  PERIODOS_CURSO,
  PERIODOS_LICENCIATURA,
  PROGRAMA_GROUPS,
} from '../types/enrollment'
import type { EnrollmentRequest } from '../types/enrollment'
import { EnrollmentSummary } from './EnrollmentSummary'

interface EnrollmentFormProps {
  onSubmit: (values: EnrollmentRequest) => Promise<void> | void
}

const STEPS = [
  { id: 1, label: 'Datos personales' },
  { id: 2, label: 'Información académica' },
  { id: 3, label: 'Resumen' },
] as const

const FIELD_ERROR = 'text-xs text-destructive'

/**
 * Convierte los valores del formulario (agrupados por Prepa/Licenciatura
 * para la UI) en el payload exacto que espera Apps Script. No calcula ni
 * interpreta reglas de negocio: solo reordena los mismos valores elegidos
 * por el usuario en el objeto { nombreCompleto, correo, telefono, programa,
 * modalidad, periodo } que consume registrarYGenerarPDF().
 */
function toEnrollmentRequest(values: EnrollmentFormValues): EnrollmentRequest {
  const { nombreCompleto, correo, telefono } = values

  if (values.programaGrupo === 'Prepa') {
    return {
      nombreCompleto,
      correo,
      telefono,
      programa: 'Prepa',
      modalidad: values.modalidadPrepa,
      periodo: values.modalidadPrepa === 'Curso' ? values.periodoCurso : '',
    }
  }

  return {
    nombreCompleto,
    correo,
    telefono,
    programa: values.carrera,
    modalidad: values.carrera,
    periodo: values.periodoLicenciatura,
  }
}

/** Formulario de registro en 3 pasos: datos personales, académicos y resumen. */
export function EnrollmentForm({ onSubmit }: EnrollmentFormProps) {
  const [step, setStep] = useState(1)

  const {
    register,
    control,
    watch,
    trigger,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      nombreCompleto: '',
      correo: '',
      telefono: '',
      programaGrupo: '',
      modalidadPrepa: '',
      carrera: '',
      periodoCurso: '',
      periodoLicenciatura: '',
    },
  })

  const values = watch()
  const { programaGrupo, modalidadPrepa } = values
  const esPrepa = programaGrupo === 'Prepa'
  const esLicenciatura = programaGrupo === 'Licenciatura'
  const necesitaPeriodoCurso = esPrepa && modalidadPrepa === 'Curso'

  useEffect(() => {
    setValue('modalidadPrepa', '')
    setValue('carrera', '')
    setValue('periodoCurso', '')
    setValue('periodoLicenciatura', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programaGrupo])

  useEffect(() => {
    if (modalidadPrepa !== 'Curso') setValue('periodoCurso', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalidadPrepa])

  async function handleNext() {
    const step2Fields: (keyof EnrollmentFormValues)[] = esPrepa
      ? necesitaPeriodoCurso
        ? ['programaGrupo', 'modalidadPrepa', 'periodoCurso']
        : ['programaGrupo', 'modalidadPrepa']
      : ['programaGrupo', 'carrera', 'periodoLicenciatura']

    const fieldsByStep: Record<number, (keyof EnrollmentFormValues)[]> = {
      1: ['nombreCompleto', 'correo', 'telefono'],
      2: step2Fields,
    }
    const valid = await trigger(fieldsByStep[step])
    if (valid) setStep((current) => current + 1)
  }

  function handleBack() {
    setStep((current) => Math.max(1, current - 1))
  }

  function handleFormSubmit(formValues: EnrollmentFormValues) {
    return onSubmit(toEnrollmentRequest(formValues))
  }

  const progress = (step / STEPS.length) * 100

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="flex flex-col gap-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">{STEPS[step - 1].label}</span>
          <span className="text-muted-foreground">
            Paso {step} de {STEPS.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="nombreCompleto">Nombre completo</Label>
            <Input
              id="nombreCompleto"
              placeholder="Ej: María García López"
              className="h-10"
              aria-invalid={!!errors.nombreCompleto}
              {...register('nombreCompleto')}
            />
            {errors.nombreCompleto ? (
              <p className={FIELD_ERROR}>{errors.nombreCompleto.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="correo">Correo electrónico</Label>
            <Input
              id="correo"
              type="email"
              placeholder="ejemplo@correo.com"
              className="h-10"
              aria-invalid={!!errors.correo}
              {...register('correo')}
            />
            {errors.correo ? <p className={FIELD_ERROR}>{errors.correo.message}</p> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              type="tel"
              placeholder="10 dígitos"
              className="h-10"
              aria-invalid={!!errors.telefono}
              {...register('telefono')}
            />
            {errors.telefono ? <p className={FIELD_ERROR}>{errors.telefono.message}</p> : null}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="programaGrupo">Programa</Label>
            <Controller
              control={control}
              name="programaGrupo"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="programaGrupo"
                    className="h-10 w-full"
                    aria-invalid={!!errors.programaGrupo}
                  >
                    <SelectValue placeholder="Selecciona un programa" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAMA_GROUPS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.programaGrupo ? <p className={FIELD_ERROR}>{errors.programaGrupo.message}</p> : null}
          </div>

          {esPrepa && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="modalidadPrepa">Modalidad</Label>
                <Controller
                  control={control}
                  name="modalidadPrepa"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="modalidadPrepa"
                        className="h-10 w-full"
                        aria-invalid={!!errors.modalidadPrepa}
                      >
                        <SelectValue placeholder="Selecciona una modalidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {MODALIDADES_PREPA.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.modalidadPrepa ? (
                  <p className={FIELD_ERROR}>{errors.modalidadPrepa.message}</p>
                ) : null}
              </div>

              {necesitaPeriodoCurso ? (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="periodoCurso">Periodo</Label>
                  <Controller
                    control={control}
                    name="periodoCurso"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          id="periodoCurso"
                          className="h-10 w-full"
                          aria-invalid={!!errors.periodoCurso}
                        >
                          <SelectValue placeholder="Selecciona un periodo" />
                        </SelectTrigger>
                        <SelectContent>
                          {PERIODOS_CURSO.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.periodoCurso ? <p className={FIELD_ERROR}>{errors.periodoCurso.message}</p> : null}
                </div>
              ) : modalidadPrepa ? (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-muted-foreground">Periodo</Label>
                  <p className="flex h-10 items-center text-sm text-muted-foreground">
                    No aplica para esta modalidad.
                  </p>
                </div>
              ) : null}
            </>
          )}

          {esLicenciatura && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="carrera">Carrera</Label>
                <Controller
                  control={control}
                  name="carrera"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="carrera" className="h-10 w-full" aria-invalid={!!errors.carrera}>
                        <SelectValue placeholder="Selecciona una carrera" />
                      </SelectTrigger>
                      <SelectContent>
                        {CARRERAS_LICENCIATURA.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.carrera ? <p className={FIELD_ERROR}>{errors.carrera.message}</p> : null}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="periodoLicenciatura">Periodo</Label>
                <Controller
                  control={control}
                  name="periodoLicenciatura"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="periodoLicenciatura"
                        className="h-10 w-full"
                        aria-invalid={!!errors.periodoLicenciatura}
                      >
                        <SelectValue placeholder="Selecciona un periodo" />
                      </SelectTrigger>
                      <SelectContent>
                        {PERIODOS_LICENCIATURA.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.periodoLicenciatura ? (
                  <p className={FIELD_ERROR}>{errors.periodoLicenciatura.message}</p>
                ) : null}
              </div>
            </>
          )}
        </div>
      )}

      {step === 3 && <EnrollmentSummary data={values} />}

      <div className="flex items-center justify-between pt-2">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={handleBack}>
            <ArrowLeft className="size-4" />
            Anterior
          </Button>
        ) : (
          <span />
        )}

        {step < STEPS.length ? (
          <Button type="button" onClick={handleNext}>
            Siguiente
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Registrando…
              </>
            ) : (
              'Registrar alumno'
            )}
          </Button>
        )}
      </div>
    </form>
  )
}
