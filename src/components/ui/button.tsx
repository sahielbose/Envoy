import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost";

interface ButtonOwnProps {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

export type ButtonProps =
  | (ButtonOwnProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined })
  | (ButtonOwnProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string });

/**
 * Espresso primary / soft ghost button. Renders an <a> when `href` is given,
 * otherwise a <button>. Mirrors the .btn styles in design/landing.html.
 */
export function Button({ variant = "primary", className, children, ...rest }: ButtonProps) {
  const classes = cn("btn", variant === "ghost" && "btn--ghost", className);

  if (rest.href !== undefined) {
    const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a className={classes} {...anchorProps}>
        {children}
      </a>
    );
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
