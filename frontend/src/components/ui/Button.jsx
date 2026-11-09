import { Loader2 } from "lucide-react";

/**
 * Button — the single call-to-action primitive.
 *
 *   variant: "primary" | "ghost" | "secondary" | "danger"    (default "primary")
 *   size:    "sm" | "md" | "lg"                              (default "md")
 *   as:      "button" | "a"                                  (default "button")
 *   loading: boolean — shows spinner, disables click
 *   iconLeft / iconRight: Lucide icon component (not element)
 *   fullWidth: boolean
 *
 * Styles use the token-based CSS classes defined in index.css.
 */
const sizeMap = {
  sm: "h-8 px-3 text-[13px] rounded-[10px]",
  md: "h-10 px-4 text-sm rounded-[12px]",
  lg: "h-12 px-5 text-[15px] rounded-[14px]",
};

const variantMap = {
  primary: "btn-primary",
  ghost: "btn-ghost",
  secondary:
    "bg-surface text-ink border border-line hover:bg-surface-2 transition-colors",
  danger:
    "bg-danger text-white hover:brightness-95 transition-[filter,background-color]",
};

const Button = ({
  variant = "primary",
  size = "md",
  as = "button",
  loading = false,
  disabled = false,
  iconLeft: IconLeft,
  iconRight: IconRight,
  fullWidth = false,
  className = "",
  children,
  ...rest
}) => {
  const Tag = as;
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold select-none whitespace-nowrap " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <Tag
      className={`${base} ${sizeMap[size]} ${variantMap[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : IconLeft ? (
        <IconLeft size={size === "sm" ? 14 : 16} />
      ) : null}
      {children}
      {!loading && IconRight ? (
        <IconRight size={size === "sm" ? 14 : 16} />
      ) : null}
    </Tag>
  );
};

export default Button;
