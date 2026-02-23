import type { OrderStatus, UserRole, ServiceLevel, AgentStatus, OrderPriority } from '../../types';

// ============================================
// ROLES
// ============================================

export const USER_ROLES: UserRole[] = ['Admin', 'Dispatcher', 'Driver', 'Viewer'];

export const ROLE_LABELS: Record<UserRole, string> = {
  Admin: '系统管理员',
  Dispatcher: '调度员',
  Driver: '司机',
  Viewer: '客服',
};

export const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  Admin: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  Dispatcher: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Driver: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  Viewer: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
};

export const ROLE_PERMISSIONS: Record<UserRole, {
  canViewAllOrders: boolean;
  canCreateOrder: boolean;
  canConfirmOrder: boolean;
  canShipOrder: boolean;
  canCancelOrder: boolean;
  canMarkDelivered: boolean;
  canViewRevenue: boolean;
  canExportCsv: boolean;
  canViewTrackingMap: boolean;
  canCompareCarriers: boolean;
  canBookCarrier: boolean;
  canCalculateRoutes: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canViewRoleMatrix: boolean;
}> = {
  Admin: {
    canViewAllOrders: true,
    canCreateOrder: true,
    canConfirmOrder: true,
    canShipOrder: true,
    canCancelOrder: true,
    canMarkDelivered: true,
    canViewRevenue: true,
    canExportCsv: true,
    canViewTrackingMap: true,
    canCompareCarriers: true,
    canBookCarrier: true,
    canCalculateRoutes: true,
    canViewReports: true,
    canManageSettings: true,
    canViewRoleMatrix: true,
  },
  Dispatcher: {
    canViewAllOrders: true,
    canCreateOrder: true,
    canConfirmOrder: true,
    canShipOrder: true,
    canCancelOrder: true,
    canMarkDelivered: false,
    canViewRevenue: true,
    canExportCsv: true,
    canViewTrackingMap: true,
    canCompareCarriers: true,
    canBookCarrier: true,
    canCalculateRoutes: true,
    canViewReports: true,
    canManageSettings: true,
    canViewRoleMatrix: false,
  },
  Driver: {
    canViewAllOrders: false,
    canCreateOrder: false,
    canConfirmOrder: false,
    canShipOrder: false,
    canCancelOrder: false,
    canMarkDelivered: true,
    canViewRevenue: false,
    canExportCsv: false,
    canViewTrackingMap: true,
    canCompareCarriers: false,
    canBookCarrier: false,
    canCalculateRoutes: false,
    canViewReports: false,
    canManageSettings: true,
    canViewRoleMatrix: false,
  },
  Viewer: {
    canViewAllOrders: false,
    canCreateOrder: false,
    canConfirmOrder: false,
    canShipOrder: false,
    canCancelOrder: false,
    canMarkDelivered: false,
    canViewRevenue: false,
    canExportCsv: false,
    canViewTrackingMap: true,
    canCompareCarriers: false,
    canBookCarrier: false,
    canCalculateRoutes: false,
    canViewReports: false,
    canManageSettings: true,
    canViewRoleMatrix: false,
  },
};

// ============================================
// ORDER STATUSES
// ============================================

export const ORDER_STATUSES: OrderStatus[] = [
  'Created',
  'Confirmed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export const STATUS_CONFIG: Record<OrderStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  Created: { label: 'Created', color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  Confirmed: { label: 'Confirmed', color: 'text-cyan-700', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' },
  Shipped: { label: 'Shipped', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  Delivered: { label: 'Delivered', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  Cancelled: { label: 'Cancelled', color: 'text-gray-600', bgColor: 'bg-gray-100', borderColor: 'border-gray-200' },
};

export const ORDER_PRIORITIES: OrderPriority[] = ['Low', 'Normal', 'High', 'Urgent'];

export const PRIORITY_CONFIG: Record<OrderPriority, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  Low: { label: 'Low', color: 'text-slate-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-200' },
  Normal: { label: 'Normal', color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  High: { label: 'High', color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  Urgent: { label: 'Urgent', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
};

// ============================================
// SERVICE LEVELS
// ============================================

export const SERVICE_LEVELS: ServiceLevel[] = ['Express', 'Standard', 'Economy'];

export const SERVICE_LEVEL_CONFIG: Record<ServiceLevel, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  Express: { label: 'Express', color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  Standard: { label: 'Standard', color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  Economy: { label: 'Economy', color: 'text-slate-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-200' },
};

// ============================================
// CARRIER CODES
// ============================================

export const CARRIER_CODES = ['SF', 'JD', 'ZTO', 'YTO', 'STO', 'YUNDA', 'EMS'] as const;

export const CARRIER_NAMES: Record<string, string> = {
  SF: '顺丰速运 (SF Express)',
  JD: '京东物流 (JD Logistics)',
  ZTO: '中通快递 (ZTO Express)',
  YTO: '圆通速递 (YTO Express)',
  STO: '申通快递 (STO Express)',
  YUNDA: '韵达快递 (Yunda Express)',
  EMS: '中国邮政 (China EMS)',
};

// ============================================
// AGENT STATUS
// ============================================

export const AGENT_STATUS_CONFIG: Record<AgentStatus, {
  label: string;
  color: string;
  bgColor: string;
  dotColor: string;
}> = {
  Available: { label: 'Available', color: 'text-green-700', bgColor: 'bg-green-50', dotColor: 'bg-green-500' },
  OnDelivery: { label: 'On Delivery', color: 'text-amber-700', bgColor: 'bg-amber-50', dotColor: 'bg-amber-500' },
  Offline: { label: 'Offline', color: 'text-slate-500', bgColor: 'bg-slate-100', dotColor: 'bg-slate-400' },
  Break: { label: 'On Break', color: 'text-blue-700', bgColor: 'bg-blue-50', dotColor: 'bg-blue-500' },
};

// ============================================
// MAP CONFIG
// ============================================

export const MAP_CONFIG = {
  defaultCenter: { lat: 31.2304, lng: 121.4737 }, // Shanghai
  defaultZoom: 10,
  tileStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
};

// ============================================
// SIDEBAR MENU ITEMS PER ROLE
// ============================================

export interface SidebarItem {
  label: string;
  path: string;
  icon: string; // lucide icon name
}

export const SIDEBAR_MENU: Record<UserRole, SidebarItem[]> = {
  Admin: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Orders', path: '/dashboard/orders', icon: 'Package' },
    { label: 'Tracking', path: '/dashboard/tracking', icon: 'MapPin' },
    { label: 'Carriers', path: '/dashboard/carriers', icon: 'Truck' },
    { label: 'Routing', path: '/dashboard/routing', icon: 'Route' },
    { label: 'Reports', path: '/dashboard/reports', icon: 'BarChart3' },
    { label: 'Settings', path: '/dashboard/settings', icon: 'Settings' },
  ],
  Dispatcher: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Orders', path: '/dashboard/orders', icon: 'Package' },
    { label: 'Tracking', path: '/dashboard/tracking', icon: 'MapPin' },
    { label: 'Carriers', path: '/dashboard/carriers', icon: 'Truck' },
    { label: 'Routing', path: '/dashboard/routing', icon: 'Route' },
    { label: 'Reports', path: '/dashboard/reports', icon: 'BarChart3' },
    { label: 'Settings', path: '/dashboard/settings', icon: 'Settings' },
  ],
  Driver: [
    { label: 'My Orders', path: '/dashboard/orders', icon: 'Package' },
    { label: 'Tracking', path: '/dashboard/tracking', icon: 'MapPin' },
    { label: 'Settings', path: '/dashboard/settings', icon: 'Settings' },
  ],
  Viewer: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'My Orders', path: '/dashboard/orders', icon: 'Package' },
    { label: 'Tracking', path: '/dashboard/tracking', icon: 'MapPin' },
    { label: 'Settings', path: '/dashboard/settings', icon: 'Settings' },
  ],
};

// ============================================
// REDIRECT PATHS BY ROLE (after login)
// ============================================

export const ROLE_REDIRECT: Record<UserRole, string> = {
  Admin: '/dashboard',
  Dispatcher: '/dashboard/orders',
  Driver: '/dashboard/orders',
  Viewer: '/dashboard',
};

// ============================================
// TEST ACCOUNTS (for login page hint)
// ============================================

export const TEST_ACCOUNTS = [
  { username: 'admin', password: 'admin123', role: 'Admin' as UserRole, displayName: '系统管理员' },
  { username: 'dispatcher', password: 'passwd123', role: 'Dispatcher' as UserRole, displayName: '调度员小李' },
  { username: 'driver', password: 'passwd123', role: 'Driver' as UserRole, displayName: '司机王师傅' },
  { username: 'viewer', password: 'passwd123', role: 'Viewer' as UserRole, displayName: '客服张小姐' },
];
