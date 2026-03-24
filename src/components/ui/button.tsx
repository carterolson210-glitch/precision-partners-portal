import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-navy text-primary-foreground hover:bg-navy/90 text-[15px] font-medium",
        destructive: "bg-background text-destructive border border-destructive hover:bg-destructive/5 text-[15px]",
        outline: "border border-navy bg-background text-navy hover:bg-navy/5 text-[15px]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 text-[15px]",
        ghost: "hover:bg-accent hover:text-accent-foreground text-[15px]",
        link: "text-gold underline-offset-4 hover:underline text-[15px]",
        gold: "bg-gold text-gold-text hover:bg-gold/90 text-[15px] font-medium",
        "gold-outline": "border-2 border-gold text-gold hover:bg-gold/10 text-[15px] font-medium",
        "hero-outline": "border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 text-[15px] font-medium",
      },
      size: {
        default: "h-10 px-6 py-3",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-8 py-3",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
