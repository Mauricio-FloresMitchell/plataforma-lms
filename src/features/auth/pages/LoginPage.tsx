import { GraduationCap } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { APP_NAME, APP_TAGLINE } from '@/utils/brand'
import { MOCK_PASSWORD } from '@/mocks/users'
import { LoginForm } from '../components/LoginForm'

const DEMO_ACCOUNTS = [
  { label: 'Alumno', email: 'alumno@ludiclass.com' },
  { label: 'Profesor', email: 'profesor@ludiclass.com' },
  { label: 'Administrador', email: 'admin@ludiclass.com' },
]

export function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <GraduationCap className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{APP_NAME}</h1>
            <p className="text-sm text-muted-foreground">{APP_TAGLINE}</p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="gap-1">
            <h2 className="text-base font-semibold text-foreground">Inicia sesión</h2>
            <p className="text-sm text-muted-foreground">
              Accede con tu cuenta para continuar.
            </p>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <div className="rounded-lg border border-dashed border-border bg-card/50 p-4 text-xs text-muted-foreground">
          <p className="mb-2 font-medium text-foreground">Cuentas de demostración</p>
          <ul className="flex flex-col gap-1">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email} className="flex justify-between gap-2">
                <span>{account.label}</span>
                <span className="font-mono">{account.email}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2">
            Contraseña: <span className="font-mono">{MOCK_PASSWORD}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
