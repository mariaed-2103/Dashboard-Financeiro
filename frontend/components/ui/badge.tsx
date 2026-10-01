import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive transition-all duration-200 overflow-hidden tracking-wide',
  {
    variants: {
      variant: {
        default:
          'border-[rgba(147,51,234,0.4)] bg-[rgba(147,51,234,0.12)] text-purple-300 ' +
          '[a&]:hover:bg-[rgba(147,51,234,0.22)]',
        secondary:
          'border-[rgba(147,51,234,0.2)] bg-[rgba(26,26,46,0.9)] text-purple-300/80 ' +
          '[a&]:hover:bg-[rgba(147,51,234,0.15)]',
        destructive:
          'border-red-500/25 bg-red-500/10 text-red-400 ' +
          '[a&]:hover:bg-red-500/20',
        outline:
          'border-[rgba(254,80,0,0.4)] bg-[rgba(254,80,0,0.08)] text-orange-400 ' +
          '[a&]:hover:bg-[rgba(254,80,0,0.15)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
