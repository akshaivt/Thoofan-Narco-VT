import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ShieldAlert, Users, Database, Shield, Lock } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gov-navy text-white p-6 sm:p-8 rounded-xl shadow border-b-4 border-gov-gold flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wider">Admin Console</h1>
          <p className="text-xs text-slate-300 mt-1 uppercase tracking-widest font-semibold text-gov-gold">
            Officer operations desk
          </p>
        </div>
        <div className="inline-flex items-center space-x-1.5 bg-gov-blue/50 border border-gov-blue px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gov-gold">
          <ShieldAlert className="h-3.5 w-3.5 text-gov-gold animate-pulse" />
          <span>Operational Security: HIGH</span>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100 shrink-0">
            <Users className="h-6 w-6 text-gov-blue" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Officers</span>
            <span className="text-2xl font-extrabold text-slate-800">2</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100 shrink-0">
            <Database className="h-6 w-6 text-gov-gold" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Cases</span>
            <span className="text-2xl font-extrabold text-slate-800">0</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center border border-teal-100 shrink-0">
            <Shield className="h-6 w-6 text-gov-accent" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Threat Index</span>
            <span className="text-2xl font-extrabold text-slate-800">Stable</span>
          </div>
        </div>
      </div>

      {/* Main Operations Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gov-navy border-b border-slate-100 pb-2">
          Intel Logs & Incident Reports
        </h3>

        <div className="mt-6 p-8 bg-slate-50 border border-slate-200 rounded-lg text-center flex flex-col items-center max-w-lg mx-auto">
          <Lock className="h-8 w-8 text-gov-blue mb-3" />
          <h4 className="font-extrabold text-sm text-gov-navy uppercase tracking-wider">Reports Queue Empty</h4>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            There are no reports submitted to the central server. The complaint intake module is disabled in this build and will be loaded in the next release.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
