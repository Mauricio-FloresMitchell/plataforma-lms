import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

type ComingSoonButtonProps = Omit<React.ComponentProps<typeof Button>, 'onClick'>

/**
 * Botón placeholder para acciones aún no implementadas.
 * Al pulsarlo muestra brevemente "Disponible próximamente" sin navegar.
 */
export function ComingSoonButton({
  children,
  variant = 'outline',
  size = 'sm',
  disabled,
  ...props
}: ComingSoonButtonProps) {
  const [revealed, setRevealed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  function handleClick() {
    setRevealed(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setRevealed(false), 1600)
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={disabled || revealed}
      aria-live="polite"
      onClick={handleClick}
      {...props}
    >
      {revealed ? 'Disponible próximamente' : children}
    </Button>
  )
}
