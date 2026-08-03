import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, LogOut, LayoutDashboard, User as UserIcon } from 'lucide-react';

import NotificationCenter from './NotificationCenter';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'citizen') return '/citizen/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'superadmin') return '/superadmin/dashboard';
    return '/';
  };

  return (
    <nav className="bg-gov-navy text-white shadow-md border-b border-gov-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <Link to="/" className="flex items-center space-x-3 group">
            <Shield className="h-8 w-8 text-gov-gold group-hover:scale-105 transition-smooth" />
            <div>
              <span className="font-extrabold text-lg tracking-wider block leading-none text-slate-100 uppercase">
                NarcoVT
              </span>
              <span className="text-[10px] text-gov-gold uppercase tracking-widest font-semibold">
                Confidential Drug Reporting
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-smooth">
              Home
            </Link>
            <Link to="/about" className="text-sm font-medium text-slate-300 hover:text-white transition-smooth">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium text-slate-300 hover:text-white transition-smooth">
              Contact
            </Link>

            {user ? (
              <div className="flex items-center space-x-4 border-l border-gov-blue pl-4">
                {user.role === 'citizen' && <NotificationCenter />}
                <Link
                  to={getDashboardPath()}
                  className="flex items-center space-x-1.5 bg-gov-blue/50 hover:bg-gov-blue px-3 py-1.5 rounded text-xs font-semibold tracking-wider uppercase border border-gov-blue hover:border-gov-gold transition-smooth"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-gov-gold" />
                  <span>Dashboard</span>
                </Link>

                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200">{user.name}</span>
                  <span className="text-[10px] text-gov-gold uppercase font-bold tracking-wider">{user.role}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 hover:text-gov-gold text-slate-300 transition-smooth p-1.5"
                  title="Secure Sign Out"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  <span className="hidden sm:inline text-xs font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center border-l border-gov-blue pl-4">
                <Link
                  to="/register"
                  className="text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded bg-gov-gold hover:bg-amber-400 text-gov-navy transition-smooth shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
