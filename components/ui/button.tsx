import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[9px] text-[13px] font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[#111111] text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:bg-black hover:shadow-[0_4px_12px_rgba(0,0,0,0.18)] active:scale-[0.98]',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-[#D2D2D7] bg-white text-[#111111] hover:bg-[#F5F5F7] hover:border-[#86868b] hover:text-black',
        secondary: 'bg-secondary text-secondary-foreground shadow-[0_2px_8px_rgba(255,106,0,0.2)] hover:bg-[#FF8533] hover:shadow-[0_4px_12px_rgba(255,106,0,0.3)] active:scale-[0.98]',
        ghost: 'hover:bg-[#F5F5F7] hover:text-[#111111] text-[#424245]',
        link: 'text-[#0071E3] underline-offset-4 hover:underline hover:text-[#0077ED]',
      },
      size: {
        default: 'h-[40px] px-6 py-2',
        sm: 'h-[32px] rounded-[8px] px-3 text-[12px]',
        lg: 'h-[44px] rounded-[10px] px-8 text-[14px]',
        icon: 'h-9 w-9 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
