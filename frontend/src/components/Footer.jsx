import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gov-navy text-slate-300 py-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:justify-between sm:items-center">
        <div className="flex justify-center items-center space-x-2 text-sm">
          <span className="font-semibold tracking-wider text-slate-100 uppercase">🛡️ NarcoVT</span>
          <span className="text-slate-500">|</span>
          <span>Confidential Drug Reporting Portal</span>
        </div>
        <p className="mt-4 sm:mt-0 text-xs text-slate-400">
          &copy; {currentYear} Ministry of Home Affairs & Security. All rights reserved. Secure encrypted connection.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
