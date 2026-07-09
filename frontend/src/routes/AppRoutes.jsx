import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Public Pages
import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';

// Auth Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import OTPVerification from '../pages/OTPVerification';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

// Citizen Pages
import CitizenDashboard from '../pages/citizen/CitizenDashboard';
import Profile from '../pages/citizen/Profile';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';

// Super Admin Pages
import SuperAdminDashboard from '../pages/superadmin/SuperAdminDashboard';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Pages (Public Layout) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Guest Auth Screens */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* 2. Citizen Protected Pages (Dashboard Layout) */}
      <Route
        path="/citizen"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<CitizenDashboard />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* 3. Admin Protected Pages (Dashboard Layout) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>

      {/* 4. Super Admin Protected Pages (Dashboard Layout) */}
      <Route
        path="/superadmin"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<SuperAdminDashboard />} />
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
