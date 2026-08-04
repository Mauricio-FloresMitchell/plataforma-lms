import { GraduationCap, Loader2 } from 'lucide-react'
import { APP_NAME, APP_TAGLINE } from '@/utils/brand'

/** Pantalla de arranque con branding, mostrada mientras se restaura la sesión. */
export function SplashScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-background">
      <div className="flex flex-col items-center gap-4">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <GraduationCap className="size-8" />
        </span>
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{APP_NAME}</h1>
          <p className="text-sm text-muted-foreground">{APP_TAGLINE}</p>
        </div>
      </div>
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  )
}
