/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base — every button gets these
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-1",
    "disabled:pointer-events-none disabled:opacity-60",
    "active:scale-[0.97]",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-brand-yellow text-brand-dark shadow-sm hover:bg-brand-yellow-dark hover:shadow-md hover:-translate-y-0.5",
        dark: "bg-brand-dark text-white shadow-sm hover:bg-brand-dark-2 hover:shadow-md hover:-translate-y-0.5 border border-brand-dark",
        outline:
          "border border-brand-dark bg-transparent text-brand-dark hover:bg-brand-dark hover:text-white hover:shadow-sm hover:-translate-y-0.5",
        ghost: "text-brand-dark hover:bg-gray-100",
        // ✨ Reject / Destructive — perfect hover effect ✨
        destructive:
          "bg-red-500 text-white shadow-sm ring-1 ring-red-500/20 " +
          "hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 " +
          "hover:ring-red-600/40",
        // ✨ Solid red — for confirmed/rejected states (always red, no action)
        rejected:
          "bg-red-50 text-red-700 border border-red-200 shadow-inner cursor-default",
        link: "text-brand-yellow underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };



