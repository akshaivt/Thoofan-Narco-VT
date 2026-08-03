import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const DashboardLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Body with Sidebar & Content */}
      <div className="flex flex-1 flex-row">
        {/* Left Sidebar Navigation (role-dependent) */}
        <Sidebar />

        {/* Right Content Area */}
        <div className="flex flex-col flex-1 bg-slate-100 min-h-[calc(100vh-4rem)]">
          {/* Main Dashboard Pages Container */}
          <main className="flex-grow p-6 sm:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>

          {/* Standard Footer aligned with content */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
