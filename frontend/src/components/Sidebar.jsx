import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  User as UserIcon, 
  ShieldAlert, 
  Settings, 
  Lock,
  Database,
  FileText,
  PlusCircle,
  Search,
  BarChart3,
  MapPin,
  Flame,
  Brain
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
              to="/citizen/submit"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth mt-1 ${
                  isActive
                    ? 'bg-gov-blue text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`
              }
            >
              <PlusCircle className="h-5 w-5" />
              <span>Submit Report</span>
            </NavLink>
            <NavLink
              to="/citizen/reports"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth mt-1 ${
                  isActive
                    ? 'bg-gov-blue text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`
              }
            >
              <FileText className="h-5 w-5" />
              <span>My Reports</span>
            </NavLink>
            <NavLink
              to="/citizen/track"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth mt-1 ${
                  isActive
                    ? 'bg-gov-blue text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`
              }
            >
              <Search className="h-5 w-5" />
              <span>Track Report</span>
            </NavLink>
            <NavLink
              to="/citizen/profile"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth mt-1 ${
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
            <NavLink
              to="/admin/complaints"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth mt-1 ${
                  isActive
                    ? 'bg-gov-blue text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`
              }
            >
              <ShieldAlert className="h-5 w-5" />
              <span>Manage Complaints</span>
            </NavLink>
            <NavLink
              to="/admin/analytics"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth mt-1 ${
                  isActive
                    ? 'bg-gov-blue text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`
              }
            >
              <BarChart3 className="h-5 w-5" />
              <span>Intelligence Analytics</span>
            </NavLink>
            <NavLink
              to="/admin/maps"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth mt-1 ${
                  isActive
                    ? 'bg-gov-blue text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`
              }
            >
              <MapPin className="h-5 w-5" />
              <span>Caseload Map</span>
            </NavLink>
            <NavLink
              to="/admin/heatmap"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth mt-1 ${
                  isActive
                    ? 'bg-gov-blue text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`
              }
            >
              <Flame className="h-5 w-5" />
              <span>Caseload Heatmap</span>
            </NavLink>
            <NavLink
              to="/admin/insights"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth mt-1 ${
                  isActive
                    ? 'bg-gov-blue text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`
              }
            >
              <Brain className="h-5 w-5" />
              <span>AI Insights</span>
            </NavLink>
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
            
            <NavLink
              to="/admin/complaints"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth mt-1 ${
                  isActive
                    ? 'bg-gov-blue text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`
              }
            >
              <ShieldAlert className="h-5 w-5" />
              <span>Manage Complaints</span>
            </NavLink>

            <NavLink
              to="/admin/analytics"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth mt-1 ${
                  isActive
                    ? 'bg-gov-blue text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`
              }
            >
              <BarChart3 className="h-5 w-5" />
              <span>Intelligence Analytics</span>
            </NavLink>
            <NavLink
              to="/admin/maps"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth mt-1 ${
                  isActive
                    ? 'bg-gov-blue text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`
              }
            >
              <MapPin className="h-5 w-5" />
              <span>Caseload Map</span>
            </NavLink>
            <NavLink
              to="/admin/heatmap"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth mt-1 ${
                  isActive
                    ? 'bg-gov-blue text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`
              }
            >
              <Flame className="h-5 w-5" />
              <span>Caseload Heatmap</span>
            </NavLink>
            <NavLink
              to="/admin/insights"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth mt-1 ${
                  isActive
                    ? 'bg-gov-blue text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`
              }
            >
              <Brain className="h-5 w-5" />
              <span>AI Insights</span>
            </NavLink>

            {/* Super Admin can also view standard Admin content */}
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth mt-1 ${
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
                <NavLink
                  to="/superadmin/system"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth ${
                      isActive
                        ? 'bg-gov-blue text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`
                  }
                >
                  <Database className="h-5 w-5" />
                  <span>System Operations</span>
                </NavLink>
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
          {user.policeStation && (
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-2 border-t border-slate-205 border-slate-200 pt-1.5 leading-normal">
              {user.policeStation}
            </p>
          )}
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
