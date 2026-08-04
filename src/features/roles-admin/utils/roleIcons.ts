import { Award, ClipboardCheck, GraduationCap, LifeBuoy, Settings, Shield, Users, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { RoleIconKey } from '@/types/rbac'

/** Mapa ícono→componente (Sprint 20) — vive en la capa de UI, `types/rbac.ts` solo guarda la clave. */
export const ROLE_ICON_COMPONENTS: Record<RoleIconKey, LucideIcon> = {
  Shield,
  Users,
  GraduationCap,
  Wallet,
  LifeBuoy,
  ClipboardCheck,
  Settings,
  Award,
}
