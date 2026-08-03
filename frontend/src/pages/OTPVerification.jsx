import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, CheckCircle } from 'lucide-react';

const OTPVerification = () => {
  const { verifyOTP } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState('verification');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Extract query parameters on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    const purposeParam = params.get('purpose');

    if (emailParam) {
      setEmail(emailParam);
    } else {
      setError('Missing email parameter in request');
    }

    if (purposeParam) {
      setPurpose(purposeParam);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('OTP must be exactly 6 digits');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyOTP(email, otp, purpose);
      setSuccess(data.message);

      setTimeout(() => {
        if (purpose === 'verification') {
          // Account verified successfully. Redirect to Login.
          navigate('/login');
        } else {
          // Password recovery OTP verified. Redirect to Reset Password with email and otp.
          navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
        }
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="h-6 w-6 text-gov-blue" />
          </div>
          <h2 className="text-xl font-extrabold text-gov-navy uppercase tracking-wider">
            {purpose === 'reset' ? 'Password Recovery Verification' : 'Verify Account Email'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            An OTP verification code was dispatched to:
            <br />
            <span className="font-semibold text-slate-800">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center space-x-2">
            <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center mb-2">
              Enter 6-Digit Code
            </label>
            <input
              type="text"
              required
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full text-center px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue text-xl font-bold tracking-[8px]"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full mt-2 bg-gov-navy hover:bg-gov-blue disabled:bg-slate-400 text-white font-bold py-2.5 rounded-lg shadow-sm transition-smooth flex items-center justify-center space-x-2 text-xs uppercase tracking-wider cursor-pointer"
          >
            <span>{loading ? 'Verifying OTP...' : 'Verify Code'}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Check the Node.js server console terminal. The mock OTP was printed there for testing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
