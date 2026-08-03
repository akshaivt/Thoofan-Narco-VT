import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ShieldAlert, Users, Database, Shield, FolderLock, ArrowRight, EyeOff } from 'lucide-react';
import api from '../../services/api';
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    resolved: 0
  });

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await api.get('/complaints/admin/all');
        if (response.data && response.data.success) {
          const list = response.data.complaints;
          setComplaints(list);
          setStats({
            total: list.length,
            active: list.filter(item => item.status === 'Pending' || item.status === 'Under Investigation').length,
            resolved: list.filter(item => item.status === 'Resolved').length
          });
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (!user) return null;

  // Get 5 most recent complaints
  const recentComplaints = complaints.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gov-navy text-white p-6 sm:p-8 rounded-xl shadow border-b-4 border-gov-gold flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wider">Admin Console</h1>
          <p className="text-xs text-slate-300 mt-1 uppercase tracking-widest font-semibold text-gov-gold">
            Officer operations desk
          </p>
        </div>
        <div className="inline-flex items-center space-x-1.5 bg-gov-blue/50 border border-gov-blue px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gov-gold">
          <ShieldAlert className="h-3.5 w-3.5 text-gov-gold animate-pulse" />
          <span>Operational Security: HIGH</span>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Metric 1: Total Reports */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100 shrink-0">
            <Users className="h-6 w-6 text-gov-blue" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Reports</span>
            <span className="text-2xl font-extrabold text-slate-800">
              {loading ? '...' : stats.total}
            </span>
          </div>
        </div>

        {/* Metric 2: Active Cases */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100 shrink-0">
            <Database className="h-6 w-6 text-gov-gold" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Cases</span>
            <span className="text-2xl font-extrabold text-slate-800">
              {loading ? '...' : stats.active}
            </span>
          </div>
        </div>

        {/* Metric 3: Threat Index */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center border border-teal-100 shrink-0">
            <Shield className="h-6 w-6 text-gov-accent" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Threat Index</span>
            <span className="text-2xl font-extrabold text-slate-800">
              {stats.active > 10 ? 'Elevated' : 'Stable'}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gov-navy flex items-center space-x-1.5">
            <FolderLock className="h-4.5 w-4.5 text-gov-blue" />
            <span>Recent Intelligence Logs</span>
          </h3>
          <Link
            to="/admin/complaints"
            className="text-xs font-bold text-gov-blue hover:text-gov-navy flex items-center space-x-1 uppercase tracking-wide transition-smooth"
          >
            <span>Access Central Database</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-6 text-slate-400 text-xs">Querying database...</div>
        ) : recentComplaints.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">No reports registered in the system.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[9px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <th className="py-2.5 px-3">Complaint ID</th>
                  <th className="py-2.5 px-3">Activity Type</th>
                  <th className="py-2.5 px-3">District</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Reporter</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentComplaints.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/55 transition-smooth">
                    <td className="py-3 px-3 font-mono font-bold text-slate-500">{item.complaintId}</td>
                    <td className="py-3 px-3 font-extrabold uppercase text-gov-navy">{item.activityType}</td>
                    <td className="py-3 px-3 font-semibold">{item.district}</td>
                    <td className="py-3 px-3 font-bold text-[9px] uppercase tracking-wider">{item.priority}</td>
                    <td className="py-3 px-3 font-medium">
                      {item.isConfidential ? (
                        <span className="inline-flex items-center space-x-1 bg-gov-light text-gov-blue px-2 py-0.5 rounded text-[9px] font-bold uppercase border border-slate-200">
                          <EyeOff className="h-3 w-3" />
                          <span>Confidential</span>
                        </span>
                      ) : (
                        item.citizenDetails?.name || 'Anonymous'
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <ComplaintStatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
