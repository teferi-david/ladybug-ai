import * as React from 'react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Golden gradient CTA — matches “Upgrade to unlock” on the humanizer (Apple-style: 44pt min tap target, rounded-xl).
 */
export const proUpgradeButtonClassName = cn(
  'font-semibold text-amber-950',
  'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500',
  'hover:from-amber-200 hover:via-yellow-300 hover:to-amber-400',
  'border border-amber-400/60',
  'shadow-[0_0_18px_rgba(234,179,8,0.55),0_0_36px_rgba(250,204,21,0.25)]',
  'hover:shadow-[0_0_24px_rgba(234,179,8,0.7)]',
  'transition-shadow duration-200 ease-out',
  'animate-pulse',
  'rounded-xl',
  'min-h-11 px-5',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2',
  'disabled:animate-none'
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
