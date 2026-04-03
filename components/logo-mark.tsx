import Image from 'next/image'
import { cn } from '@/lib/utils'

/** Subtle floating shadow (Apple / Ryne-style — soft, not heavy). */
export const logoFloatingClass =
  'object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)] drop-shadow-[0_8px_28px_rgba(0,0,0,0.12)]'

type LogoMarkProps = {
  size?: number
  className?: string
  priority?: boolean
  /** Decorative in hero orb — omit for nav / auth. */
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
