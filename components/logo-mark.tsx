import Image from 'next/image'
import { cn } from '@/lib/utils'

/** Soft shadow beneath the mark (Ryne-style “floating” — diffuse, not a hard ring). */
export const logoFloatingClass =
  'object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.06)] drop-shadow-[0_18px_42px_rgba(0,0,0,0.14)]'

type LogoMarkProps = {
  size?: number
  className?: string
  priority?: boolean
  alt?: string
}

export function LogoMark({ size = 40, className, priority, alt = 'Ladybug AI' }: LogoMarkProps) {
  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={size}
      height={size}
      className={cn(logoFloatingClass, className)}
      priority={priority}
    />
  )
}
