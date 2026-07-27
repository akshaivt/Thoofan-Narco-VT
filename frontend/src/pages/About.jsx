import React from 'react';
import { ShieldAlert, BookOpen, UserCheck, HelpCircle } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gov-navy uppercase tracking-wider">About NarcoVT</h1>
        <div className="w-16 h-1 bg-gov-gold mx-auto mt-3"></div>
        <p className="text-slate-600 mt-4 max-w-xl mx-auto">
          Learn about our mission, operational structure, and security controls for safe drug reporting.
        </p>
      </div>

      <div className="space-y-8">
        {/* Card 1: Mission */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg shrink-0">
            <BookOpen className="h-6 w-6 text-gov-navy" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gov-navy uppercase tracking-wide">Our National Mission</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              NarcoVT is a strategic initiative designed to combat illicit drug networks. By combining community vigilance with advanced intelligence processing, we seek to disable supply chains and safeguard communities.
            </p>
          </div>
        </div>

        {/* Card 2: Roles */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg shrink-0">
            <UserCheck className="h-6 w-6 text-gov-navy" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gov-navy uppercase tracking-wide">Portal Role Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="p-3 bg-slate-50 border border-slate-150 rounded">
                <span className="font-bold text-xs uppercase tracking-wider text-gov-navy block">Citizen</span>
                <span className="text-xs text-slate-500 mt-1 block">Registers with verification to file confidential, encrypted reports.</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-150 rounded">
                <span className="font-bold text-xs uppercase tracking-wider text-gov-navy block">Admin</span>
                <span className="text-xs text-slate-500 mt-1 block">Inspects incoming reports, coordinates with local task forces.</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-150 rounded">
                <span className="font-bold text-xs uppercase tracking-wider text-gov-navy block">Super Admin</span>
                <span className="text-xs text-slate-500 mt-1 block">Manages administrative settings, credentials, and logs.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Security & Anonymity */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg shrink-0">
            <ShieldAlert className="h-6 w-6 text-gov-navy" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gov-navy uppercase tracking-wide">Is reporting truly secure?</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Yes. All telemetry is stripped from submissions. The database stores hashed secrets and does not log geolocation coordinates. In upcoming phases, we will introduce client-side symmetric-key encryption, ensuring that even backend systems cannot read report details without authorized admin keys.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
