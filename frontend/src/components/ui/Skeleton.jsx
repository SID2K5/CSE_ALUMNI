/**
 * Skeleton — shimmer placeholder. Composable primitive.
 *
 *   <Skeleton className="h-4 w-32" />
 *   <Skeleton circle className="w-10 h-10" />
 */
const Skeleton = ({ circle = false, className = "" }) => (
  <div
    className={`bg-surface-2 animate-pulse ${
      circle ? "rounded-full" : "rounded-lg"
    } ${className}`}
    aria-hidden="true"
  />
);

export default Skeleton;
