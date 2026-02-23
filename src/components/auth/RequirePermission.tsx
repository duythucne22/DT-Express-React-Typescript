import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ROLE_PERMISSIONS } from '../../lib/constants';

interface RequirePermissionProps {
  permission: keyof typeof ROLE_PERMISSIONS.Admin;
  children: React.ReactNode;
}

export default function RequirePermission({ permission, children }: RequirePermissionProps) {
  const hasPermission = useAuthStore((s) => s.hasPermission);

  if (!hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
