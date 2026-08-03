import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, ArrowRight, Eye, RefreshCw, BarChart2 } from 'lucide-react';
import api from '../../services/api';
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge';

const AIInsights = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('threats');

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/complaints/admin/all');
      if (response.data && response.data.success) {
        setComplaints(response.data.complaints);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch AI insights logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-10 h-10 border-4 border-gov-navy border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Processing AI indices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl text-center">
        {error}
      </div>
    );
  }

  // Filter lists
  const highRiskThreats = complaints.filter(
    item => item.riskLevel === 'High' || item.riskLevel === 'Critical' || item.priority === 'High'
  );

  const duplicateFlags = complaints.filter(
    item => item.duplicateScore && item.duplicateScore > 80
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gov-navy uppercase tracking-wider">AI Intelligence Insights</h1>
          <p className="text-xs text-slate-500 mt-1">Cross-referenced duplicate detection and threat level assessments</p>
        </div>
        <button
          onClick={fetchInsights}
          className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-650 transition-smooth"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('threats')}
          className={`pb-3 px-4 flex items-center space-x-1.5 border-b-2 transition-smooth cursor-pointer ${
            activeTab === 'threats' 
              ? 'border-gov-navy text-gov-navy' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ShieldAlert className="h-4.5 w-4.5" />
          <span>Critical Threat Risks ({highRiskThreats.length})</span>
        </button>
        
        <button
          onClick={() => setActiveTab('duplicates')}
          className={`pb-3 px-4 flex items-center space-x-1.5 border-b-2 transition-smooth cursor-pointer ${
            activeTab === 'duplicates' 
              ? 'border-gov-navy text-gov-navy' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <AlertTriangle className="h-4.5 w-4.5" />
          <span>Duplicate Report Flags ({duplicateFlags.length})</span>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'threats' ? (
          highRiskThreats.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center text-xs text-slate-400">
              No reports classified as high risk or critical priority.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {highRiskThreats.map((item) => (
                <div key={item._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-gov-navy/30 transition-smooth">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-400">{item.complaintId}</span>
                        <h4 className="text-xs font-extrabold uppercase tracking-wide text-gov-navy mt-0.5">{item.activityType}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                        item.riskLevel === 'Critical' 
                          ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {item.riskLevel || 'High Risk'}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-500">
                      <p><span className="font-bold text-slate-450 uppercase text-[9px]">Location:</span> {item.place}, {item.district}</p>
                      <p className="line-clamp-2 italic mt-1.5 text-slate-600">"{item.aiSummary || item.description}"</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                    <ComplaintStatusBadge status={item.status} />
                    <Link
                      to={`/admin/complaints/${item.complaintId}`}
                      className="text-[10px] font-bold uppercase tracking-wider text-gov-blue hover:text-gov-navy flex items-center space-x-1"
                    >
                      <span>Investigate File</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          duplicateFlags.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center text-xs text-slate-400">
              No report cross-references flagging similarity above 80%.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {duplicateFlags.map((item) => (
                <div key={item._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-gov-navy/30 transition-smooth">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-400">{item.complaintId}</span>
                        <h4 className="text-xs font-extrabold uppercase tracking-wide text-gov-navy mt-0.5">{item.activityType}</h4>
                      </div>
                      <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border border-rose-100 flex items-center space-x-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>{item.duplicateScore}% Duplicate</span>
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-500">
                      <p><span className="font-bold text-slate-450 uppercase text-[9px]">Location:</span> {item.place}, {item.district}</p>
                      <p className="line-clamp-2 italic mt-1.5 text-slate-650">"{item.description}"</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                    <ComplaintStatusBadge status={item.status} />
                    <Link
                      to={`/admin/complaints/${item.complaintId}`}
                      className="text-[10px] font-bold uppercase tracking-wider text-gov-blue hover:text-gov-navy flex items-center space-x-1"
                    >
                      <span>Examine Files</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AIInsights;
