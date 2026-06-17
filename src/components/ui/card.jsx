import * as React from 'react'
import { cn } from '../../lib/utils'

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-2xl border bg-card text-card-foreground', className)}
    {...props}
  />
))
Card.displayName = 'Card'

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-[13px_15px]', className)} {...props} />
))
CardContent.displayName = 'CardContent'

export { Card, CardContent }
