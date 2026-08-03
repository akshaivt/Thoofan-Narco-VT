import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Shield, Smartphone, Mail, Hash, UserCheck } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gov-navy uppercase tracking-wider">My Profile Profile</h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">Manage your security credentials</p>
      </div>

      {/* Main Profile Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header decoration */}
        <div className="bg-gov-navy h-2.5"></div>

        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-slate-100 rounded-full border border-slate-250 flex items-center justify-center font-bold text-gov-navy text-xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">{user.name}</h3>
              <span className="inline-block px-2 py-0.5 mt-1 text-[9px] font-bold tracking-wider uppercase bg-gov-light text-gov-blue rounded border border-slate-200">
                {user.role}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-4">
            {/* Row 1: Email */}
            <div className="flex items-center space-x-3 text-sm">
              <Mail className="h-4.5 w-4.5 text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</span>
                <span className="block font-medium text-slate-800 break-words">{user.email}</span>
              </div>
            </div>

            {/* Row 2: Phone */}
            <div className="flex items-center space-x-3 text-sm">
              <Smartphone className="h-4.5 w-4.5 text-slate-400 shrink-0" />
              <div className="flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Mobile Phone</span>
                <span className="block font-medium text-slate-800">{user.phone || 'No phone registered'}</span>
              </div>
            </div>

            {/* Row 3: User ID */}
            <div className="flex items-center space-x-3 text-sm">
              <Hash className="h-4.5 w-4.5 text-slate-400 shrink-0" />
              <div className="flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Identity ID</span>
                <span className="block font-mono text-xs text-slate-500">{user.id}</span>
              </div>
            </div>

            {/* Row 4: Status */}
            <div className="flex items-center space-x-3 text-sm">
              <UserCheck className="h-4.5 w-4.5 text-slate-400 shrink-0" />
              <div className="flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Clearance</span>
                <span className="block text-emerald-600 font-bold text-xs uppercase tracking-wider mt-0.5">
                  Verified Account Session
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
