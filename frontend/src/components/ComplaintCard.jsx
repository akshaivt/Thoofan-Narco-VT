import React from 'react';
import { Link } from 'react-router-dom';
import ComplaintStatusBadge from './ComplaintStatusBadge';
import { Calendar, MapPin, EyeOff, ShieldAlert } from 'lucide-react';

const ComplaintCard = ({ complaint }) => {
  const formattedDate = new Date(complaint.incidentDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-smooth flex flex-col justify-between space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-slate-400 block leading-none">
              {complaint.complaintId}
            </span>
            <h3 className="font-extrabold text-gov-navy text-sm sm:text-base leading-snug uppercase tracking-wide">
              {complaint.activityType}
            </h3>
          </div>
          <ComplaintStatusBadge status={complaint.status} />
        </div>

        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
          {complaint.description}
        </p>
      </div>

      <div className="border-t border-slate-100 pt-3 flex flex-wrap justify-between items-center text-[10px] text-slate-500 gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </span>
          <span className="flex items-center space-x-1">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>{complaint.district}</span>
          </span>
        </div>

        {complaint.isConfidential && (
          <span className="flex items-center space-x-1 bg-gov-light text-gov-blue px-2 py-0.5 rounded border border-slate-200 font-bold uppercase tracking-wider">
            <EyeOff className="h-3 w-3" />
            <span>Confidential</span>
          </span>
        )}
      </div>

      <Link
        to={`/citizen/track?id=${complaint.complaintId}`}
        className="w-full text-center bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-250 py-2 rounded-lg text-xs font-bold uppercase tracking-wider block transition-smooth"
      >
        Track Status
      </Link>
    </div>
  );
};

export default ComplaintCard;
