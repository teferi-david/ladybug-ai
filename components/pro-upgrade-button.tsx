import * as React from 'react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Primary red CTA — matches site brand; Apple-style 44pt min tap target, rounded-xl.
 */
export const proUpgradeButtonClassName = cn(
  'font-semibold',
  'bg-primary text-primary-foreground shadow-sm',
  'hover:bg-primary/90',
  'rounded-xl',
  'min-h-11 px-5',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
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
