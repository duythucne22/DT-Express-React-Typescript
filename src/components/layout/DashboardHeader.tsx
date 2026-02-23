import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ROLE_COLORS } from '../../lib/constants';
import { cn } from '../../lib/utils/cn';

/** Map route segments to readable breadcrumb labels */
const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  orders: 'Orders',
  tracking: 'Tracking',
  carriers: 'Carriers',
  routing: 'Routing',
  reports: 'Reports',
  settings: 'Settings',
  create: 'Create',
};

const DashboardHeader: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  // Build breadcrumb from the current path
  const pathSegments = location.pathname
    .replace(/^\//, '')
    .split('/')
    .filter(Boolean);

  const breadcrumbs = pathSegments.map((seg) => BREADCRUMB_LABELS[seg] || seg);
  const pageTitle = breadcrumbs[breadcrumbs.length - 1] || 'Dashboard';

  const roleColor = user?.role ? ROLE_COLORS[user.role] : null;
  const initials = user?.displayName
    ? user.displayName.charAt(0)
    : '?';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      {/* Left: Breadcrumb + Title */}
      <div>
        <nav className="flex items-center gap-1 text-xs text-slate-400">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span>/</span>}
              <span className={idx === breadcrumbs.length - 1 ? 'text-slate-600 font-medium' : ''}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
        <h1 className="text-lg font-semibold text-slate-900 -mt-0.5">{pageTitle}</h1>
      </div>

      {/* Right: Real-time indicator + User */}
      <div className="flex items-center gap-4">
        {/* Real-time indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="hidden sm:inline">Live</span>
        </div>

        {/* User avatar + role */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900 leading-tight">{user.displayName}</p>
              {roleColor && (
                <span
                  className={cn(
                    'inline-block text-xs font-medium px-1.5 py-0 rounded border',
                    roleColor.bg,
                    roleColor.text,
                    roleColor.border
                  )}
                >
                  {user.role}
                </span>
              )}
            </div>
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-orange-600">{initials}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
