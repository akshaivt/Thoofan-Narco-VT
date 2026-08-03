import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ComplaintCard from '../../components/ComplaintCard';
import { FileText, PlusCircle } from 'lucide-react';

const MyReports = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyComplaints = async () => {
      try {
        const response = await api.get('/complaints/my');
        if (response.data && response.data.success) {
          setComplaints(response.data.complaints);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch reports. Please verify your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyComplaints();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-gov-navy border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Loading reports logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gov-navy uppercase tracking-wider">My Submitted Reports</h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">
            Track and monitor status changes of your cases.
          </p>
        </div>
        <Link
          to="/citizen/submit"
          className="bg-gov-navy hover:bg-gov-blue text-white font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow transition-smooth"
        >
          <PlusCircle className="h-4 w-4 text-gov-gold" />
          <span>New Report</span>
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg">
          {error}
        </div>
      )}

      {complaints.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center max-w-md mx-auto space-y-5">
          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto">
            <FileText className="h-7 w-7 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-gov-navy uppercase tracking-wider text-sm">No Reports Filed Yet</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              You have not submitted any drug activity reports. Any submissions will appear here securely.
            </p>
          </div>
          <Link
            to="/citizen/submit"
            className="inline-block bg-gov-navy hover:bg-gov-blue text-white font-bold px-5 py-2 rounded-lg text-xs uppercase tracking-wider transition-smooth"
          >
            File First Report
          </Link>
        </div>
      ) : (
        /* Card Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint._id} complaint={complaint} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReports;
