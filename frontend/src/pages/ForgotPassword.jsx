import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, ArrowRight } from 'lucide-react';

const ForgotPassword = () => {
  const { forgotPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword(email);
      // Redirect to OTP page for reset purpose
      navigate(`/verify-otp?email=${encodeURIComponent(email)}&purpose=reset`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="h-6 w-6 text-gov-blue" />
          </div>
          <h2 className="text-xl font-extrabold text-gov-navy uppercase tracking-wider">Account Recovery</h2>
          <p className="text-xs text-slate-500 mt-1">
            Input your Citizen email ID. A 6-digit password recovery code will be dispatched.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Registered Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue transition-smooth text-sm font-medium"
              placeholder="e.g. citizen@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gov-navy hover:bg-gov-blue disabled:bg-slate-400 text-white font-bold py-2.5 rounded-lg shadow-sm transition-smooth flex items-center justify-center space-x-2 text-xs uppercase tracking-wider cursor-pointer"
          >
            <span>{loading ? 'Processing...' : 'Request OTP'}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Remember credentials?{' '}
            <Link to="/login" className="text-gov-blue hover:text-gov-navy font-bold transition-smooth">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
