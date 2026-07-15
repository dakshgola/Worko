import * as React from "react"
import { cn } from "@/lib/utils"

export interface IconChipProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: "pink" | "yellow" | "mint" | "orange" | "black";
  variant?: "square" | "circle";
}

export function IconChip({
  className,
  color = "pink",
  variant = "square",
  children,
  ...props
}: IconChipProps) {
  const colorClasses = {
    pink: "bg-brutal-pink text-black",
    yellow: "bg-brutal-yellow text-black",
    mint: "bg-brutal-mint text-black",
    orange: "bg-brutal-orange text-white",
    black: "bg-brutal-black text-white",
  }

  const shapeClasses = {
    square: "rounded-[12px]",
    circle: "rounded-full",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center shrink-0 border-[var(--border-thick)] p-2 size-10 shadow-brutal-sm",
        colorClasses[color],
        shapeClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
