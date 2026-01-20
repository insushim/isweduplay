'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default:
          'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/25',
        destructive:
          'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25',
        success:
          'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/25',
        warning:
          'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/25',
        outline:
          'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950',
        secondary:
          'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
        ghost:
          'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100',
        link:
          'text-primary-600 underline-offset-4 hover:underline',
        game:
          'bg-gradient-to-b from-amber-400 to-amber-600 text-white font-bold text-lg shadow-lg shadow-amber-500/30 hover:from-amber-500 hover:to-amber-700 border-b-4 border-amber-700 active:border-b-0 active:translate-y-1',
        gameBlue:
          'bg-gradient-to-b from-blue-400 to-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/30 hover:from-blue-500 hover:to-blue-700 border-b-4 border-blue-700 active:border-b-0 active:translate-y-1',
        gameGreen:
          'bg-gradient-to-b from-green-400 to-green-600 text-white font-bold text-lg shadow-lg shadow-green-500/30 hover:from-green-500 hover:to-green-700 border-b-4 border-green-700 active:border-b-0 active:translate-y-1',
        gamePurple:
          'bg-gradient-to-b from-purple-400 to-purple-600 text-white font-bold text-lg shadow-lg shadow-purple-500/30 hover:from-purple-500 hover:to-purple-700 border-b-4 border-purple-700 active:border-b-0 active:translate-y-1',
        gameRed:
          'bg-gradient-to-b from-red-400 to-red-600 text-white font-bold text-lg shadow-lg shadow-red-500/30 hover:from-red-500 hover:to-red-700 border-b-4 border-red-700 active:border-b-0 active:translate-y-1',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-12 rounded-xl px-8 text-base',
        xl: 'h-14 rounded-2xl px-10 text-lg',
        icon: 'h-10 w-10',
        game: 'h-16 px-8 text-xl rounded-2xl',
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
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
