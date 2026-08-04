import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Bell, Lock, Palette } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROLE_HOME } from '@/routes/navigation'

/**
 * Página de Configuración (placeholder), compartida por los tres roles.
 * Cada rol accede desde su propio menú de usuario; el contenido es idéntico.
 */
export function SettingsPage() {
  const { user } = useAuth()
  const backTo = user ? ROLE_HOME[user.role] : '/'

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Inicio', to: backTo }, { label: 'Configuración' }]}
        backTo={backTo}
        title="Configuración"
        subtitle="Personaliza tu experiencia en Ludi Class"
      />

      <div className="grid gap-4">
        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Configuración General</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Idioma, zona horaria y preferencias globales
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Próximamente
            </Button>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Notificaciones</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Controla cómo y cuándo recibes notificaciones
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Próximamente
            </Button>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Palette className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Apariencia</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Modo claro/oscuro y personalización visual
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Próximamente
            </Button>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Seguridad y Privacidad</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Contraseña, autenticación y permisos de datos
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Próximamente
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">
          Las opciones de configuración avanzadas estarán disponibles en futuras versiones de Ludi
          Class.
        </p>
      </Card>
    </div>
  )
}
