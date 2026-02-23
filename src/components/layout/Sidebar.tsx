import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Truck,
  LayoutDashboard,
  Package,
  MapPin,
  Route,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { SIDEBAR_MENU, ROLE_COLORS } from '../../lib/constants';
import { cn } from '../../lib/utils/cn';
import type { UserRole } from '../../types';

// Map icon name strings to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Package,
  MapPin,
  Truck,
  Route,
  BarChart3,
  Settings,
};

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const role = user?.role as UserRole | undefined;
  const menuItems = role ? SIDEBAR_MENU[role] : [];
  const roleColor = role ? ROLE_COLORS[role] : null;

  const handleLogout = () => {
    logout();
    navigate('/auth/login', { replace: true });
  };

  return (
    <aside
      className={cn(
        'h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-200">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-slate-900 truncate">DTEx</span>
          )}
        </div>
      </div>

      {/* User Info (expanded only) */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-slate-600">
                {user.displayName.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.displayName}</p>
              {roleColor && (
                <span
                  className={cn(
                    'inline-block text-xs font-medium px-1.5 py-0.5 rounded border mt-0.5',
                    roleColor.bg,
                    roleColor.text,
                    roleColor.border
                  )}
                >
                  {role}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || Package;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-orange-50 text-orange-600 border-l-[3px] border-orange-500 ml-[-1px]'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                      collapsed && 'justify-center px-0'
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <IconComponent className="w-5 h-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-slate-200 p-2 space-y-1">
        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 shrink-0 mx-auto" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium',
            'text-red-600 hover:bg-red-50 transition-colors',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
