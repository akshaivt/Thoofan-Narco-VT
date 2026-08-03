import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, EyeOff, ServerCrash, Key, ChevronRight, Lock, User } from 'lucide-react';
import api from '../services/api';

const Home = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [loginTab, setLoginTab] = useState('citizen');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check query parameters for session expiration
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setSessionExpired(true);
    }
  }, [location]);

  const getStartedPath = () => {
    if (!user) return '/register';
    if (user.role === 'citizen') return '/citizen/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'superadmin') return '/superadmin/dashboard';
    return '/';
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSessionExpired(false);
    setLoading(true);

    // Block Super Admin from logging in through the home page console
    if (formData.email.toLowerCase().trim() === 'superadmin@narcovt.gov') {
      setError('Access Denied: Please use the secure URL command console to log in as Super Admin.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/login', formData);
      const { token, user: userData } = response.data;
      
      // Save state to context (which syncs with local storage)
      login(token, userData);

      // Route based on role
      if (userData.role === 'citizen') {
        navigate('/citizen/dashboard');
      } else if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (userData.role === 'superadmin') {
        navigate('/superadmin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || 'Invalid email or password';
      
      // If citizen exists but is not verified, redirect them to verify page
      if (message.includes('not verified')) {
        navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}&purpose=verification`);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <section className="bg-gov-navy text-white py-12 px-4 border-b-4 border-gov-gold">
        <div className="max-w-7xl mx-auto">
          {user ? (
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 bg-gov-blue/50 border border-gov-blue px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-gov-gold mb-6">
                <Shield className="h-4 w-4" />
                <span>Secure Encryption Enabled</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                NarcoVT
              </h1>
              <p className="text-gov-gold text-lg sm:text-xl font-bold uppercase tracking-wider mt-2">
                Confidential & Anonymous National Drug Reporting System
              </p>
              <p className="mt-6 text-slate-300 text-sm sm:text-base leading-relaxed">
                A state-of-the-art secure platform for citizens to report drug distribution, trafficking, and illicit substance operations. Protecting your identity is our highest national priority.
              </p>

              <div className="mt-8 p-4 bg-slate-950/40 border border-gov-gold/30 rounded-xl max-w-lg mx-auto">
                <p className="text-gov-gold font-serif italic text-base sm:text-lg tracking-wide">
                  "Narcotics is a dirty business..."
                </p>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
                  — Sagar Alias Jacky
                </span>
              </div>
              
              <div className="mt-10 flex justify-center gap-4">
                <Link
                  to={getStartedPath()}
                  className="bg-gov-gold hover:bg-amber-400 text-gov-navy font-bold px-6 py-3 rounded-lg shadow transition-smooth flex items-center space-x-2 text-sm uppercase tracking-wider"
                >
                  <span>Go to Dashboard</span>
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
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Hero Text */}
              <div className="lg:col-span-7 text-left space-y-6">
                <div className="inline-flex items-center space-x-2 bg-gov-blue/50 border border-gov-blue px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-gov-gold">
                  <Shield className="h-4 w-4" />
                  <span>Secure Encryption Enabled</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  NarcoVT
                </h1>
                <p className="text-gov-gold text-lg sm:text-xl font-bold uppercase tracking-wider">
                  Confidential & Anonymous National Drug Reporting System
                </p>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  A state-of-the-art secure platform for citizens to report drug distribution, trafficking, and illicit substance operations. Protecting your identity is our highest national priority.
                </p>

                <div className="p-4 bg-slate-950/40 border border-gov-gold/30 rounded-xl max-w-lg">
                  <p className="text-gov-gold font-serif italic text-base sm:text-lg tracking-wide">
                    "Narcotics is a dirty business..."
                  </p>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
                    — Sagar Alias Jacky
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-4 pt-2">
                  <Link
                    to="/register"
                    className="bg-gov-gold hover:bg-amber-400 text-gov-navy font-bold px-6 py-3 rounded-lg shadow transition-smooth flex items-center space-x-2 text-sm uppercase tracking-wider"
                  >
                    <span>File a Secure Report</span>
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

              {/* Right Column: Portal Login Form */}
              <div className="lg:col-span-5">
                <div className="bg-slate-900/80 border border-gov-gold/30 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
                  {/* Tab Toggle Buttons */}
                  <div className="flex border-b border-slate-700 mb-6 text-xs font-bold uppercase tracking-wider">
                    <button
                      onClick={() => {
                        setLoginTab('citizen');
                        setError('');
                        setFormData({ email: '', password: '' });
                      }}
                      className={`w-1/2 pb-3 text-center border-b-2 transition-smooth cursor-pointer ${
                        loginTab === 'citizen' ? 'border-gov-gold text-gov-gold' : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🔑 Citizen Portal
                    </button>
                    <button
                      onClick={() => {
                        setLoginTab('police');
                        setError('');
                        setFormData({ email: '', password: '' });
                      }}
                      className={`w-1/2 pb-3 text-center border-b-2 transition-smooth cursor-pointer ${
                        loginTab === 'police' ? 'border-gov-gold text-gov-gold' : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🛡️ Police Console
                    </button>
                  </div>

                  <div className="text-center mb-6">
                    <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
                      {loginTab === 'citizen' ? 'Citizen Secure Intake' : 'Official Police Access'}
                    </h2>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mt-1">
                      {loginTab === 'citizen' ? 'Report narcotics anonymously & securely' : 'Audit monitored police officer login'}
                    </p>
                  </div>

                  {sessionExpired && (
                    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-semibold rounded-lg flex items-center space-x-2">
                      <Shield className="h-4 w-4 shrink-0 text-gov-gold" />
                      <span>Session expired. Please sign in again.</span>
                    </div>
                  )}

                  {error && (
                    <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs font-semibold rounded-lg">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        {loginTab === 'citizen' ? 'Registered Email Address' : 'Official Police Email / ID'}
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/50 border border-slate-700 focus:border-gov-gold rounded-lg text-slate-100 focus:outline-none transition-smooth text-sm font-medium placeholder-slate-650"
                          placeholder={loginTab === 'citizen' ? 'yourname@email.com' : 'officer@narcovt.gov'}
                        />
                        <div className="absolute left-3 top-3.5 text-slate-500">
                          <User className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Security Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/50 border border-slate-700 focus:border-gov-gold rounded-lg text-slate-100 focus:outline-none transition-smooth text-sm font-medium placeholder-slate-650"
                          placeholder="••••••••"
                        />
                        <div className="absolute left-3 top-3.5 text-slate-500">
                          <Lock className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 bg-gov-gold hover:bg-amber-400 disabled:bg-amber-400/55 disabled:cursor-not-allowed text-gov-navy font-bold py-3 px-4 rounded-lg shadow-md transition-smooth text-xs uppercase tracking-wider cursor-pointer"
                    >
                      {loading ? 'Authenticating...' : (loginTab === 'citizen' ? 'Sign In to Report' : 'Sign In to Console')}
                    </button>

                    {loginTab === 'citizen' && (
                      <div className="text-center mt-4">
                        <span className="text-xs text-slate-400">
                          Don't have a secure reporting account?{' '}
                          <Link to="/register" className="text-gov-gold hover:text-amber-400 font-bold underline">
                            Register Here
                          </Link>
                        </span>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}
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
