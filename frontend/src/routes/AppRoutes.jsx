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
import SubmitReport from '../pages/citizen/SubmitReport';
import MyReports from '../pages/citizen/MyReports';
import TrackReport from '../pages/citizen/TrackReport';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminComplaints from '../pages/admin/AdminComplaints';
import ComplaintDetails from '../pages/admin/ComplaintDetails';
import Analytics from '../pages/admin/Analytics';
import MapView from '../pages/admin/MapView';
import HeatMap from '../pages/admin/HeatMap';
import AIInsights from '../pages/admin/AIInsights';

// Super Admin Pages
import SuperAdminDashboard from '../pages/superadmin/SuperAdminDashboard';
import SuperAdminPanel from '../pages/superadmin/SuperAdminPanel';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Pages (Public Layout) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Guest Auth Screens */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/superadmin-login" element={<Login />} />
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
        <Route path="submit" element={<SubmitReport />} />
        <Route path="reports" element={<MyReports />} />
        <Route path="track" element={<TrackReport />} />
      </Route>

      {/* 3. Admin Protected Pages (Dashboard Layout) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="complaints" element={<AdminComplaints />} />
        <Route path="complaints/:id" element={<ComplaintDetails />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="maps" element={<MapView />} />
        <Route path="heatmap" element={<HeatMap />} />
        <Route path="insights" element={<AIInsights />} />
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
        <Route path="system" element={<SuperAdminPanel />} />
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
