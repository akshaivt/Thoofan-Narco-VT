import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, EyeOff, ServerCrash, Key, ChevronRight } from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);

  const getStartedPath = () => {
    if (!user) return '/register';
    if (user.role === 'citizen') return '/citizen/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'superadmin') return '/superadmin/dashboard';
    return '/';
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <section className="bg-gov-navy text-white py-16 px-4 border-b-4 border-gov-gold">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-gov-blue/50 border border-gov-blue px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-gov-gold mb-6">
            <Shield className="h-4 w-4" />
            <span>Secure Encryption Enabled</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Operation Toofan
          </h1>
          <p className="text-gov-gold text-lg sm:text-xl font-bold uppercase tracking-wider mt-2">
            Confidential & Anonymous National Drug Reporting System
          </p>
          <p className="mt-6 text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            A state-of-the-art secure platform for citizens to report drug distribution, trafficking, and illicit substance operations. Protecting your identity is our highest national priority.
          </p>
          
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to={getStartedPath()}
              className="bg-gov-gold hover:bg-amber-400 text-gov-navy font-bold px-6 py-3 rounded-lg shadow transition-smooth flex items-center space-x-2 text-sm uppercase tracking-wider"
            >
              <span>{user ? 'Go to Dashboard' : 'File a Secure Report'}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              to="/about"
              className="border border-slate-400 hover:border-white text-slate-300 hover:text-white font-semibold px-6 py-3 rounded-lg transition-smooth text-sm uppercase tracking-wider"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Core Principles Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gov-navy uppercase tracking-wider mb-12">
          Security & Operational Infrastructure
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6 border border-blue-100">
              <EyeOff className="h-6 w-6 text-gov-blue" />
            </div>
            <h3 className="text-lg font-bold text-gov-navy uppercase tracking-wide">100% Confidentiality</h3>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              No personally identifiable information (PII) is linked to reports unless voluntarily provided. We operate with strict end-to-end anonymity standards.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6 border border-blue-100">
              <Key className="h-6 w-6 text-gov-blue" />
            </div>
            <h3 className="text-lg font-bold text-gov-navy uppercase tracking-wide">Secured Communication</h3>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              Every connection is encrypted, and user registers are verified via secure OTP codes before being cleared for login access.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6 border border-blue-100">
              <ServerCrash className="h-6 w-6 text-gov-blue" />
            </div>
            <h3 className="text-lg font-bold text-gov-navy uppercase tracking-wide">Dynamic Incident Mapping</h3>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              Submissions feed into an intelligence pipeline that clusters reports to target local drug cartels and distribution centers.
            </p>
          </div>
        </div>
      </section>

      {/* Emergency Warning Strip */}
      <section className="bg-slate-200 border-t border-b border-slate-300 py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <div className="bg-gov-navy text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Important
          </div>
          <p className="text-xs text-slate-700 leading-normal">
            This platform is NOT for emergency response. If you are in immediate physical danger, please contact local emergency authorities (112 / 911) immediately.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
