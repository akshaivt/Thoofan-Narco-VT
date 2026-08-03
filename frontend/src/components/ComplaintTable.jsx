import React from 'react';
import { Link } from 'react-router-dom';
import ComplaintStatusBadge from './ComplaintStatusBadge';
import { EyeOff, ChevronRight, Eye } from 'lucide-react';

const ComplaintTable = ({ complaints }) => {
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Medium':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Low':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default:
        return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  if (complaints.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
        No complaints matched the active search filters.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <th className="py-3.5 px-4">Complaint ID</th>
              <th className="py-3.5 px-4">Activity Type</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Reporter</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
            {complaints.map((complaint) => {
              const formattedDate = new Date(complaint.incidentDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <tr key={complaint._id} className="hover:bg-slate-50/50 transition-smooth">
                  {/* Complaint ID */}
                  <td className="py-4 px-4 font-mono font-bold text-slate-500">
                    {complaint.complaintId}
                  </td>
                  
                  {/* Activity Type */}
                  <td className="py-4 px-4 font-extrabold uppercase text-gov-navy truncate max-w-44">
                    {complaint.activityType}
                  </td>
                  
                  {/* Location */}
                  <td className="py-4 px-4">
                    <span className="block font-medium">{complaint.place}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{complaint.district}</span>
                  </td>

                  {/* Incident Date */}
                  <td className="py-4 px-4 font-medium">
                    {formattedDate}
                  </td>

                  {/* Priority */}
                  <td className="py-4 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getPriorityStyle(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </td>

                  {/* Reporter details */}
                  <td className="py-4 px-4 font-semibold">
                    {complaint.isConfidential ? (
                      <span className="inline-flex items-center space-x-1 bg-gov-light text-gov-blue px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border border-slate-200">
                        <EyeOff className="h-3 w-3" />
                        <span>Confidential</span>
                      </span>
                    ) : (
                      <span className="text-slate-800 flex items-center space-x-1">
                        <Eye className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate max-w-28">{complaint.citizenDetails?.name || 'Anonymous'}</span>
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 text-center">
                    <ComplaintStatusBadge status={complaint.status} />
                  </td>

                  {/* Action Link */}
                  <td className="py-4 px-4 text-right">
                    <Link
                      to={`/admin/complaints/${complaint.complaintId}`}
                      className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider text-gov-blue hover:text-gov-navy bg-slate-100 hover:bg-slate-200 border border-slate-250 px-2.5 py-1.5 rounded transition-smooth cursor-pointer"
                    >
                      <span>Open Case</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplaintTable;
