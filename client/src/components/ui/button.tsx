import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-purple-600/40 text-gray-900 bg-white/90 backdrop-blur-[20px] shadow-lg dark:bg-gray-900/90 dark:text-gray-100 dark:border-purple-400/40 hover:scale-[1.02] hover:shadow-xl hover:border-purple-600/60 hover:bg-white/95 dark:hover:bg-gray-900/95",
        secondary:
          "text-gray-900 bg-white/80 backdrop-blur-[20px] shadow-md dark:bg-gray-900/80 dark:text-gray-100 hover:scale-[1.02] hover:shadow-lg hover:bg-white/90 dark:hover:bg-gray-900/90",
        ghost: "text-gray-900 dark:text-gray-100 hover:scale-[1.02] hover:shadow-lg hover:bg-white/60 dark:hover:bg-gray-900/60 hover:backdrop-blur-[12px]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
