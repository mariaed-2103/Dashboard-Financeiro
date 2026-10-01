import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold tracking-wide transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-[#fe5000] via-[#c026d3] to-[#9333ea] text-white ' +
          'shadow-[0_0_20px_rgba(254,80,0,0.3),0_4px_16px_rgba(8,8,15,0.5)] ' +
          'hover:shadow-[0_0_35px_rgba(254,80,0,0.5),0_0_60px_rgba(147,51,234,0.3)] ' +
          'hover:scale-[1.03] hover:opacity-90 active:scale-[0.97]',

        destructive:
          'bg-destructive text-white hover:bg-destructive/90 ' +
          'shadow-[0_0_15px_rgba(239,68,68,0.25)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]',

        outline:
          'border border-[rgba(147,51,234,0.35)] bg-transparent text-purple-300 ' +
          'hover:bg-[rgba(147,51,234,0.1)] hover:border-[rgba(147,51,234,0.6)] ' +
          'hover:text-purple-200 hover:shadow-[0_0_15px_rgba(147,51,234,0.15)]',

        secondary:
          'bg-[#1a1a2e] text-purple-200 border border-[rgba(147,51,234,0.15)] ' +
          'hover:bg-[#1f1f38] hover:border-[rgba(147,51,234,0.3)]',

        ghost:
          'bg-transparent text-muted-foreground ' +
          'hover:bg-[rgba(147,51,234,0.08)] hover:text-purple-200',

        link: 'text-purple-400 underline-offset-4 hover:underline hover:text-purple-300',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5 text-xs',
        lg: 'h-11 rounded-xl px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
