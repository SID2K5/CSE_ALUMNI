/**
 * EmptyState — centred icon + headline + description + optional action.
 *
 *   icon: Lucide icon component (not an element)
 *   title: string
 *   description: string | ReactNode
 *   action: ReactNode (usually a <Button>)
 *   compact: tighter padding
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
  className = "",
}) => (
  <div
    className={`flex flex-col items-center justify-center text-center ${
      compact ? "py-10" : "py-20"
    } px-6 ${className}`}
  >
    {Icon && (
      <div className="w-14 h-14 rounded-full bg-surface-2 border border-line flex items-center justify-center mb-4">
        <Icon size={24} className="text-muted" />
      </div>
    )}
    {title && (
      <h3 className="font-display font-semibold text-ink text-lg mb-1">
        {title}
      </h3>
    )}
    {description && (
      <p className="text-sm text-muted max-w-sm">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
