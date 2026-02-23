import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Shield, 
  Zap, 
  CheckCircle2, 
  XCircle,
  Users,
  Eye,
  Plus,
  Check,
  Send,
  Ban,
  MapPin,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { ROLE_PERMISSIONS, ROLE_COLORS, USER_ROLES, ROLE_LABELS } from '../../lib/constants';
import { toast } from 'sonner';

// Define the 6 key permissions we want to display
const KEY_PERMISSIONS = [
  { key: 'canViewAllOrders' as const, label: 'View All Orders', icon: Eye },
  { key: 'canCreateOrder' as const, label: 'Create Order', icon: Plus },
  { key: 'canConfirmOrder' as const, label: 'Confirm Order', icon: Check },
  { key: 'canShipOrder' as const, label: 'Ship Order', icon: Send },
  { key: 'canCancelOrder' as const, label: 'Cancel Order', icon: Ban },
  { key: 'canMarkDelivered' as const, label: 'Mark Delivered', icon: CheckCircle2 },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { isRealTimeEnabled, toggleRealTime } = useUIStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.displayName || '');
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  if (!user) return null;

  const roleColors = ROLE_COLORS[user.role];
  const isAdmin = user.role === 'Admin';
  const permissions = ROLE_PERMISSIONS[user.role];

  // Get region display
  const getRegionDisplay = () => {
    if (user.role === 'Admin') return 'All Regions';
    if (user.role === 'Dispatcher' || user.role === 'Driver') return 'East China';
    return 'N/A';
  };

  const handleSaveProfile = () => {
    // Simulate save (no actual API call)
    setIsEditing(false);
    setShowSaveConfirmation(true);
    toast.success('Profile updated successfully');
    setTimeout(() => setShowSaveConfirmation(false), 3000);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName(user?.displayName || '');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left: Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="text-sm text-slate-600 hover:text-slate-700 font-medium px-3 py-1 rounded-md hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="text-sm text-white bg-orange-500 hover:bg-orange-600 font-medium px-3 py-1 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Avatar and basic info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                {!isEditing ? (
                  <>
                    <p className="text-lg font-semibold text-slate-900 truncate">{user.displayName}</p>
                    <p className="text-sm text-slate-500 truncate">@{user.username}</p>
                  </>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Display Name"
                    />
                  </div>
                )}
                <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-sm font-medium border ${roleColors.bg} ${roleColors.text} ${roleColors.border}`}>
                  <Shield size={14} />
                  {ROLE_LABELS[user.role]}
                </div>
              </div>
            </div>

            {/* Region display */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Assigned Region</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-medium text-slate-700">{getRegionDisplay()}</p>
              </div>
            </div>

            {/* Member since */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Member Since</p>
              <p className="text-sm font-medium text-slate-700">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Save confirmation */}
            <AnimatePresence>
              {showSaveConfirmation && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-700 font-medium">Profile saved successfully!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Permissions Grid */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Your Permissions</h2>
            <p className="text-sm text-slate-500 mt-1">Based on your role</p>
          </div>

          <div className="space-y-3">
            {KEY_PERMISSIONS.map(({ key, label, icon: Icon }) => {
              const hasPermissionForKey = permissions[key];
              return (
                <div
                  key={key}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    hasPermissionForKey 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${
                      hasPermissionForKey ? 'text-green-600' : 'text-slate-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      hasPermissionForKey ? 'text-slate-800' : 'text-slate-500'
                    }`}>
                      {label}
                    </span>
                  </div>
                  {hasPermissionForKey ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-time Updates Toggle (Full Width) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className={`w-5 h-5 ${
              isRealTimeEnabled ? 'text-emerald-500' : 'text-slate-400'
            }`} />
            <div>
              <p className="text-sm font-medium text-slate-900">Real-time Updates</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Enable live tracking updates on the Tracking page
              </p>
            </div>
          </div>
          <button
            onClick={toggleRealTime}
            className={`w-12 h-6 rounded-full transition-all duration-200 relative ${
              isRealTimeEnabled ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
            aria-label="Toggle real-time updates"
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                isRealTimeEnabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Role Permissions Matrix - Admin Only */}
      {isAdmin && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-orange-500" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Role Permissions Matrix</h2>
              <p className="text-sm text-slate-500 mt-1">Compare permissions across all roles</p>
            </div>
          </div>

          {/* Permissions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Permission
                  </th>
                  {USER_ROLES.map((role) => {
                    const colors = ROLE_COLORS[role];
                    return (
                      <th key={role} className="text-center py-3 px-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
                          <Shield size={12} />
                          {ROLE_LABELS[role]}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {KEY_PERMISSIONS.map(({ key, label, icon: Icon }) => (
                  <tr key={key} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-700">{label}</span>
                      </div>
                    </td>
                    {USER_ROLES.map((role) => {
                      const rolePerms = ROLE_PERMISSIONS[role];
                      const hasIt = rolePerms[key];
                      return (
                        <td key={role} className="text-center py-4 px-4">
                          {hasIt ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-400 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Role Summary Cards */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {USER_ROLES.map((role) => {
              const rolePerms = ROLE_PERMISSIONS[role];
              const colors = ROLE_COLORS[role];
              const permCount = KEY_PERMISSIONS.filter(p => rolePerms[p.key]).length;
              const totalPerms = KEY_PERMISSIONS.length;
              const percentage = (permCount / totalPerms) * 100;
              
              return (
                <div
                  key={role}
                  className={`p-4 rounded-lg border ${
                    role === user.role 
                      ? 'border-orange-200 bg-orange-50' 
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${colors.text}`}>
                      {ROLE_LABELS[role]}
                    </span>
                    {role === user.role && (
                      <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded border border-orange-200">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          role === 'Admin' ? 'bg-orange-500' :
                          role === 'Dispatcher' ? 'bg-blue-500' :
                          role === 'Driver' ? 'bg-green-500' :
                          'bg-slate-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {permCount}/{totalPerms}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
