import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ShieldCheck, Server, Key, Eye, Lock } from 'lucide-react';

const SuperAdminDashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gov-navy text-white p-6 sm:p-8 rounded-xl shadow border-b-4 border-gov-gold flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wider">Super Admin Console</h1>
          <p className="text-xs text-slate-300 mt-1 uppercase tracking-widest font-semibold text-gov-gold">
            Centralized Platform Administration
          </p>
        </div>
        <div className="inline-flex items-center space-x-1.5 bg-gov-blue/50 border border-gov-blue px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gov-gold">
          <ShieldCheck className="h-3.5 w-3.5 text-gov-gold animate-bounce" />
          <span>System Authority: Superuser</span>
        </div>
      </div>

      {/* Admin Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Settings & Seed Logs */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gov-navy border-b border-slate-100 pb-2 flex items-center space-x-2">
            <Server className="h-4.5 w-4.5 text-gov-blue" />
            <span>Database Seed & User Index</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="font-bold text-gov-navy uppercase tracking-wider block">Admin Seed Accounts</span>
              <div className="mt-2 space-y-1.5 text-slate-600 font-mono">
                <p>1. admin@narcovt.gov [Active]</p>
                <p>2. superadmin@narcovt.gov [Active]</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="font-bold text-gov-navy uppercase tracking-wider block">User Collection Stat</span>
              <p className="text-slate-600 mt-1">Unified collection: MongoDB User Schema contains all user classifications.</p>
            </div>
          </div>
        </div>

        {/* Security Logs & Key Audit */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gov-navy border-b border-slate-100 pb-2 flex items-center space-x-2">
            <Key className="h-4.5 w-4.5 text-gov-blue" />
            <span>Cryptographic Keys & Audit</span>
          </h3>

          <div className="space-y-3">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <Lock className="h-6 w-6 text-gov-gold mx-auto mb-2" />
              <span className="font-bold text-xs uppercase tracking-wider text-gov-navy block">Audit Log Module Locked</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Centralized audit logs, telemetry monitors, and database keyrotations are scheduled for development in future releases.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
