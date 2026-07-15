import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-bold tracking-tight transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black border-[var(--border-thick)] font-display disabled:pointer-events-none disabled:opacity-50 active:translate-x-0 active:translate-y-0",
  {
    variants: {
      variant: {
        default:
          "bg-brutal-pink text-black shadow-brutal-sm hover:shadow-brutal-md hover:-translate-x-[2px] hover:-translate-y-[2px] active:shadow-brutal-sm",
        destructive:
          "bg-danger text-white shadow-brutal-sm hover:shadow-brutal-md hover:-translate-x-[2px] hover:-translate-y-[2px] active:shadow-brutal-sm",
        outline:
          "bg-brutal-white text-black shadow-brutal-sm hover:shadow-brutal-md hover:-translate-x-[2px] hover:-translate-y-[2px] active:shadow-brutal-sm",
        secondary:
          "bg-brutal-yellow text-black shadow-brutal-sm hover:shadow-brutal-md hover:-translate-x-[2px] hover:-translate-y-[2px] active:shadow-brutal-sm",
        ghost: "border-transparent hover:bg-hover-overlay",
        link: "border-transparent text-brutal-pink underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2 text-base rounded-[12px]",
        sm: "h-8 px-3 text-xs rounded-[8px]",
        lg: "h-12 px-8 text-lg rounded-[14px]",
        icon: "h-10 w-10 rounded-[12px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
