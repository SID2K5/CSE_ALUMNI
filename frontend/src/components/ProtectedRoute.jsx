import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Route guard with optional role gating.
 *
 *   <ProtectedRoute>                        requires login
 *   <ProtectedRoute allow={["admin"]}>      requires login + role in list
 *   <ProtectedRoute block={["alumni"]}>     requires login + role NOT in list
 *
 * Unauthorized users land on `/feed` (not `/`) so they don't log out.
 * The backend still enforces real authorization — this only stops
 * broken UIs from rendering.
 */
const ProtectedRoute = ({ children, allow, block }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const role = user.role;

  if (allow && allow.length > 0 && !allow.includes(role)) {
    return <Navigate to="/feed" replace />;
  }

  if (block && block.length > 0 && block.includes(role)) {
    return <Navigate to="/feed" replace />;
  }

  return children;
};

export default ProtectedRoute;
