import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Universal Public Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-50">
        <Outlet />
      </main>

      {/* Universal Public Footer */}
      <Footer />
    </div>
  );
};

export default PublicLayout;
