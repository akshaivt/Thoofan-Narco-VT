import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Key, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if redirect due to expired session or prefill parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setSessionExpired(true);
    }
    if (params.get('prefill') === 'superadmin') {
      setFormData({
        email: 'superadmin@narcovt.gov',
        password: 'SuperAdminPassword123!'
      });
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSessionExpired(false);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      const { token, user } = response.data;
      
      // Save state to context (which syncs with local storage)
      login(token, user);

      // Route based on role
      if (user.role === 'citizen') {
        navigate('/citizen/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'superadmin') {
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
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="h-6 w-6 text-gov-gold" />
          </div>
          <h2 className="text-xl font-extrabold text-gov-navy uppercase tracking-wider">Super Admin Console</h2>
          <p className="text-xs text-slate-500 mt-1">Authorized administrative access only. Strictly monitored.</p>
        </div>

        {sessionExpired && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-lg flex items-center space-x-2">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
            <span>Session expired. Please log in again.</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Government Email / Login ID</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue transition-smooth text-sm font-medium"
              placeholder="superadmin@narcovt.gov"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Security Password</label>
              <Link to="/forgot-password" className="text-[10px] text-gov-blue hover:text-gov-navy font-semibold uppercase tracking-wide">
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue transition-smooth text-sm font-medium"
              placeholder="******"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gov-navy hover:bg-gov-blue disabled:bg-slate-400 text-white font-bold py-2.5 rounded-lg shadow-sm transition-smooth flex items-center justify-center space-x-2 text-xs uppercase tracking-wider cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            {!loading && <Key className="h-3.5 w-3.5 text-gov-gold" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
