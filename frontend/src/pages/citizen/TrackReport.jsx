import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge';
import { Search, ShieldAlert, Calendar, Clock, ClipboardList, Info } from 'lucide-react';

const TrackReport = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [inputCode, setInputCode] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if an ID was passed in query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      setInputCode(id);
      fetchTrackingInfo(id);
    } else {
      setComplaint(null);
      setError('');
    }
  }, [location]);

  const fetchTrackingInfo = async (code) => {
    if (!code) return;
    setLoading(true);
    setError('');
    setComplaint(null);

    try {
      const response = await api.get(`/complaints/${code.trim()}`);
      if (response.data && response.data.success) {
        setComplaint(response.data.complaint);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Could not locate a complaint record matching that ID, or you are not authorized to view it.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    navigate(`/citizen/track?id=${inputCode.trim()}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gov-navy uppercase tracking-wider">Track Intelligence Logs</h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">
          Input your Complaint ID to track status updates.
        </p>
      </div>

      {/* Code Input Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Input Complaint ID
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                required
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="e.g. OTF-2026-000001"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue transition-smooth font-mono text-sm font-bold tracking-wider"
              />
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-gov-navy hover:bg-gov-blue disabled:bg-slate-400 text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-smooth cursor-pointer"
            >
              <span>{loading ? 'Searching...' : 'Track Case'}</span>
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-10 space-y-3">
          <div className="w-8 h-8 border-4 border-gov-navy border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Retrieving logs...</p>
        </div>
      )}

      {complaint && (
        /* Tracking Details Card */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
          
          {/* Top header row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Complaint ID</span>
              <span className="text-lg font-mono font-bold text-gov-navy">{complaint.complaintId}</span>
            </div>
            <ComplaintStatusBadge status={complaint.status} />
          </div>

          {/* Progress logs details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3 text-xs">
              <Calendar className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Submitted Date</span>
                <span className="block text-slate-800 font-semibold mt-1">
                  {new Date(complaint.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs">
              <Clock className="h-4.5 w-4.5 text-slate-450 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Updated</span>
                <span className="block text-slate-800 font-semibold mt-1">
                  {new Date(complaint.updatedAt).toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs">
              <ShieldAlert className="h-4.5 w-4.5 text-gov-gold shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority</span>
                <span className="block text-slate-800 font-bold mt-1 uppercase tracking-wider">
                  {complaint.priority}
                </span>
              </div>
            </div>
          </div>

          {/* Activity specifications */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Activity Type</span>
            <span className="block text-xs font-bold text-gov-navy uppercase tracking-wide">{complaint.activityType}</span>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed border-t border-slate-200 pt-2 font-medium">
              {complaint.description}
            </p>
          </div>

          {/* Status Timeline History */}
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h4 className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wide text-gov-navy">
              <ClipboardList className="h-4.5 w-4.5 text-gov-gold shrink-0" />
              <span>Audit Timeline Checkpoints</span>
            </h4>

            <div className="relative pl-6 border-l-2 border-slate-200 ml-3.5 space-y-5 text-xs">
              {complaint.timeline && complaint.timeline.length > 0 ? (
                complaint.timeline.map((checkpoint, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle Node */}
                    <span className="absolute -left-[31px] top-0.5 h-4 w-4 bg-white border-2 border-gov-navy rounded-full flex items-center justify-center">
                      <span className="h-1.5 w-1.5 bg-gov-gold rounded-full"></span>
                    </span>
                    <div>
                      <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase text-slate-655 text-slate-600 tracking-wider">
                        {checkpoint.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-1">
                        Updated on {new Date(checkpoint.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 h-4 w-4 bg-white border-2 border-gov-navy rounded-full flex items-center justify-center">
                    <span className="h-1.5 w-1.5 bg-gov-gold rounded-full"></span>
                  </span>
                  <div>
                    <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase text-slate-600 tracking-wider">
                      Submitted / Filed
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Received at {new Date(complaint.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Official admin notes */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h4 className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wide text-gov-navy">
              <ClipboardList className="h-4.5 w-4.5 text-gov-gold shrink-0" />
              <span>Official Investigation Updates</span>
            </h4>

            {complaint.notes && complaint.notes.length > 0 ? (
              <div className="space-y-3">
                {complaint.notes.map((noteObj, idx) => (
                  <div key={idx} className="p-4 bg-blue-50/30 border border-blue-100 rounded-lg text-xs font-semibold text-blue-900 leading-relaxed space-y-1">
                    <p className="text-slate-850">{noteObj.note}</p>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      Log Date: {new Date(noteObj.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-lg text-xs font-medium text-slate-500 flex items-center space-x-2">
                <Info className="h-4 w-4 shrink-0 text-slate-400" />
                <span>No investigation notes have been posted yet. Case is currently queued.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackReport;
