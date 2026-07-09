import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  User as UserIcon, 
  ShieldAlert, 
  Settings, 
  Lock,
  Database
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  // Define navigation links for each role
  const renderLinks = () => {
    switch (user.role) {
      case 'citizen':
        return (
          <>
            <NavLink
              to="/citizen/dashboard"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth ${
                  isActive
                    ? 'bg-gov-blue text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`
              }
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Citizen Dashboard</span>
            </NavLink>
            <NavLink
              to="/citizen/profile"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth ${
                  isActive
                    ? 'bg-gov-blue text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`
              }
            >
              <UserIcon className="h-5 w-5" />
              <span>My Profile</span>
            </NavLink>
          </>
        );

      case 'admin':
        return (
          <>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth ${
                  isActive
                    ? 'bg-gov-blue text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`
              }
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Admin Dashboard</span>
            </NavLink>
            <div className="pt-4 mt-4 border-t border-slate-200">
              <span className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Operations Desk
              </span>
              <div className="mt-2 text-slate-400 text-xs px-4 flex items-center space-x-1.5 font-medium">
                <ShieldAlert className="h-4 w-4 text-gov-gold" />
                <span>Reports Access Restricted</span>
              </div>
            </div>
          </>
        );

      case 'superadmin':
        return (
          <>
            <NavLink
              to="/superadmin/dashboard"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth ${
                  isActive
                    ? 'bg-gov-blue text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`
              }
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Super Admin Dashboard</span>
            </NavLink>
            
            {/* Super Admin can also view standard Admin content */}
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth mt-1.5 ${
                  isActive
                    ? 'bg-gov-blue text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`
              }
            >
              <Settings className="h-5 w-5" />
              <span>Admin Dashboard (Read)</span>
            </NavLink>

            <div className="pt-4 mt-4 border-t border-slate-200">
              <span className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                System Administration
              </span>
              <div className="mt-2 space-y-1">
                <div className="text-slate-600 text-xs px-4 py-1.5 flex items-center space-x-2">
                  <Database className="h-4 w-4 text-gov-blue" />
                  <span>Audit Logs</span>
                </div>
                <div className="text-slate-600 text-xs px-4 py-1.5 flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-gov-blue" />
                  <span>Keys Management</span>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-1.5">
        <div className="px-4 py-2 mb-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Signed in as</p>
          <p className="text-xs font-bold text-gov-navy truncate">{user.name}</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-gov-light text-gov-blue rounded-full border border-slate-200">
            {user.role}
          </span>
        </div>
        {renderLinks()}
      </div>

      {/* Security Seal */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
        <div className="flex justify-center mb-1">
          <Lock className="h-4 w-4 text-gov-accent" />
        </div>
        <p className="text-[10px] font-bold text-gov-navy uppercase tracking-wider">Secured Session</p>
        <p className="text-[9px] text-slate-500 mt-0.5">SHA-256 OTP Encrypted</p>
      </div>
    </aside>
  );
};

export default Sidebar;
