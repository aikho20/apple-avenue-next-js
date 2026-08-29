'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const labelVariants = cva(
  'font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      size: {
        xs: 'text-[11px] font-medium text-[#9CA3AF]',
        sm: 'text-[12.5px] leading-[1.6] text-[#6B7280]',
        md: 'text-[13px] text-[#374151]',
        lg: 'text-[14px] font-semibold text-[#1F2937]',
        xl: 'text-[22px] font-bold tracking-tight text-[#1F2937]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, size, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants({ size }), className)} {...props} />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
