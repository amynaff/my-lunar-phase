"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-xl px-3 py-1 text-xs font-quicksand font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent-purple)]/20 text-[var(--accent-purple)]",
        secondary:
          "bg-[var(--bg-secondary)] text-[var(--text-secondary)]",
        outline:
          "border border-[var(--border-medium)] text-[var(--text-primary)] bg-transparent",
        phase:
          "bg-[var(--accent-pink)]/20 text-[var(--accent-rose)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
