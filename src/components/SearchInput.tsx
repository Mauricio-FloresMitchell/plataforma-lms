import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  'aria-label'?: string
}

/** Buscador con ícono, reutilizable en toda tabla o listado de la plataforma. */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar…',
  'aria-label': ariaLabel,
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 pl-9"
        aria-label={ariaLabel ?? placeholder}
      />
    </div>
  )
}
