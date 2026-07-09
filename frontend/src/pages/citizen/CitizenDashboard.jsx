import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, Shield, FileText, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const CitizenDashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gov-navy text-white p-6 sm:p-8 rounded-xl shadow border-b-4 border-gov-gold flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wider">Welcome, {user.name}</h1>
          <p className="text-xs text-slate-300 mt-1 uppercase tracking-widest font-semibold text-gov-gold">
            Citizen Reporting Console
          </p>
        </div>
        <div className="inline-flex items-center space-x-1.5 bg-gov-blue/50 border border-gov-blue px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gov-gold">
          <Shield className="h-3.5 w-3.5" />
          <span>Verified Account</span>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gov-navy border-b border-slate-100 pb-2">
              Citizen Profile
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-xs">
                <User className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-slate-400 font-semibold leading-none">Name</p>
                  <p className="text-slate-800 font-bold mt-1">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-slate-400 leading-none">📧</span>
                <div>
                  <p className="text-slate-400 font-semibold leading-none">Email</p>
                  <p className="text-slate-800 font-bold mt-1">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
          <Link
            to="/citizen/profile"
            className="mt-6 block text-center bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 hover:text-slate-900 font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition-smooth"
          >
            Manage Profile
          </Link>
        </div>

        {/* Complaint Console Placeholder */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gov-navy border-b border-slate-100 pb-2">
              Confidential Reporting
            </h3>
            
            <div className="mt-4 p-4 bg-slate-50 border border-slate-150 rounded-lg flex items-start space-x-3">
              <Lock className="h-5 w-5 text-gov-gold shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs uppercase tracking-wider text-gov-navy block">
                  Reporting Module Locked
                </span>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  The complaint reporting form is currently locked. This module will be released in Phase 2 alongside peer-to-peer asymmetric encryption, enabling fully secure direct uploads to intelligence servers.
                </p>
              </div>
            </div>
          </div>

          <button
            disabled
            className="mt-6 w-full bg-slate-200 text-slate-400 font-bold py-3 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center space-x-2 border border-dashed border-slate-300"
          >
            <FileText className="h-4 w-4" />
            <span>Create Secure Report (Phase 2)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
