import { useAuth } from '@/features/auth/hooks/useAuth'
import { BackLink } from '@/components/BackLink'
import { Breadcrumb } from '@/components/Breadcrumb'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Mail, BookOpen, Users, Calendar } from 'lucide-react'

export function StudentProfilePage() {
  const { user, logout } = useAuth()

  if (!user) {
    return <div>Error: No user found</div>
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Inicio', to: '/alumno' }, { label: 'Mi Perfil' }]} />
      <BackLink to="/alumno">Volver al Inicio</BackLink>

      <div className="flex items-start gap-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-lg">
            {user.name.split(' ').map((n) => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground mt-1">Alumno</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Correo Electrónico</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Carrera</p>
              <p className="font-medium">Licenciatura en Administración</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Grupo</p>
              <p className="font-medium">CMM-101</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Periodo Académico</p>
              <p className="font-medium">Ciclo 2026-1</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-muted/50">
        <h2 className="text-lg font-semibold mb-4">Información de la Cuenta</h2>
        <div className="space-y-3 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rol</span>
            <span className="font-medium capitalize">{user.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estado</span>
            <span className="font-medium text-green-600">Activo</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Miembro desde</span>
            <span className="font-medium">Julio 2026</span>
          </div>
        </div>
        <Button variant="destructive" onClick={logout} className="w-full">
          Cerrar Sesión
        </Button>
      </Card>
    </div>
  )
}
