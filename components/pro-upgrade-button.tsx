import * as React from 'react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Golden gradient CTA for trial / pricing (Apple-style: 44pt min tap target, rounded-xl).
 */
export const proUpgradeButtonClassName = cn(
  'font-semibold text-amber-950',
  'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500',
  'hover:from-amber-200 hover:via-yellow-300 hover:to-amber-400',
  'border border-amber-400/60',
  /* Glow comes from animate-upgrade-soft-glow in globals.css (smooth, slow) */
  'animate-upgrade-soft-glow',
  'rounded-xl',
  'min-h-11 px-5',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2',
  'disabled:animate-none disabled:shadow-[0_0_12px_rgba(234,179,8,0.35)]'
)

export type ProUpgradeButtonProps = ButtonProps

export const ProUpgradeButton = React.forwardRef<HTMLButtonElement, ProUpgradeButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        type="button"
        variant={variant}
        size={size}
        className={cn(proUpgradeButtonClassName, className)}
        {...props}
      />
    )
  }
)
ProUpgradeButton.displayName = 'ProUpgradeButton'
