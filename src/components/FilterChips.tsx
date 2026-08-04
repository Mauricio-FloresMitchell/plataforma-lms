import { cn } from '@/lib/utils'

export interface FilterChipOption {
  value: string
  label: string
}

interface FilterChipsProps {
  options: FilterChipOption[]
  value: string | null
  onChange: (value: string | null) => void
  allLabel?: string
}

/** Fila de chips de filtro (valor único), reutilizable en cualquier listado. */
export function FilterChips({ options, value, onChange, allLabel = 'Todas' }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip label={allLabel} active={value === null} onClick={() => onChange(null)} />
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          active={value === option.value}
          onClick={() => onChange(option.value)}
        />
      ))}
    </div>
  )
}

interface ChipProps {
  label: string
  active: boolean
  onClick: () => void
}

function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      )}
    >
      {label}
    </button>
  )
}
