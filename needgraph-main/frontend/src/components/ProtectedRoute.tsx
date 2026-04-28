import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../contexts/AuthContext';
import { USE_FIREBASE } from '../lib/firebase';

interface Props {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

/**
 * ProtectedRoute — wraps routes that require authentication.
 * When Firebase is disabled (dev mode) this is a transparent pass-through.
 */
export default function ProtectedRoute({ children, requiredRoles }: Props) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // If Firebase is disabled, always allow access (dev mode)
  if (!USE_FIREBASE) return <>{children}</>;

  // Still loading auth state — show skeleton
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-[#0A0A0F]">
        <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Role check
  if (requiredRoles && profile && !requiredRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
