/**
 * Badge — compact status pill. Uses token-based colours.
 *
 *   variant: "neutral" | "success" | "warning" | "danger" | "info" | "accent"
 *   size:    "sm" | "md"                               (default "sm")
 */
const variantMap = {
  neutral: "bg-surface-2 text-muted border border-line",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "bg-red-500/10 text-red-600 dark:text-red-400",
  info: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  accent: "bg-brand-soft text-brand",
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
