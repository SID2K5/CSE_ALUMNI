/**
 * Badge — compact status pill. Uses token-based colours.
 *
 *   variant: "neutral" | "success" | "warning" | "danger" | "info" | "accent"
 *   size:    "sm" | "md"                               (default "sm")
 */
const variantMap = {
  // Semantic tokens — each pairs a `*-soft` surface with its colour,
  // and both flip with the theme.
  neutral: "bg-surface-2 text-muted border border-line",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  accent: "bg-accent-soft text-accent-strong dark:text-accent",
  verified: "bg-info-soft text-verified",
};

const sizeMap = {
  sm: "px-2 py-[2px] text-[10.5px]",
  md: "px-2.5 py-1 text-[11.5px]",
};

const Badge = ({
  variant = "neutral",
  size = "sm",
  className = "",
  children,
}) => (
  <span
    className={`inline-flex items-center gap-1 font-semibold uppercase tracking-wide rounded-md ${sizeMap[size]} ${variantMap[variant]} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
