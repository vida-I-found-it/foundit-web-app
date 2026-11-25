import { cva, type VariantProps } from "class-variance-authority";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-control text-sm font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg hover:brightness-105",
        outline: "border border-border bg-surface text-fg hover:border-fg/40",
        ghost: "text-muted hover:text-fg",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Variants = VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & Variants) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function ButtonLink({
  className,
  variant,
  size,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & Variants) {
  return <a className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
