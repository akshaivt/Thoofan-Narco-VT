import React from 'react';

const ComplaintStatusBadge = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Under Investigation':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-855 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStyles()}`}>
      {status}
    </span>
  );
};

export default ComplaintStatusBadge;
