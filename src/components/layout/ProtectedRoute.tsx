import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import type { RoleName } from "@/types";

interface ProtectedRouteProps {
  role?: RoleName;
  roles?: RoleName[];
}

/** Role-based access control (RBAC) for routes. */
export function ProtectedRoute({ role, roles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();
  const allowedRoles = roles ?? (role ? [role] : undefined);

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Edge case: pending sellers can't access the seller dashboard
  if (
    user.role === "SELLER" &&
    user.sellerStatus !== "APPROVED" &&
    location.pathname.startsWith("/seller") &&
    location.pathname !== "/seller/pending"
  ) {
    return <Navigate to="/seller/pending" replace />;
  }

  return <Outlet />;
}





