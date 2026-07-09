import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Database, Users, ShieldAlert, CheckCircle, XCircle, FileSpreadsheet, Download, RefreshCw 
} from 'lucide-react';
import api from '../../services/api';

const COLORS = ['#e11d48', '#d97706', '#059669', '#475569'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch charts and cards summary
      const response = await api.get('/analytics/summary');
      if (response.data && response.data.success) {
        setData(response.data);
      }

      // Fetch all reports to support CSV exporting
      const reportsResponse = await api.get('/complaints/admin/all');
      if (reportsResponse.data && reportsResponse.data.success) {
        setComplaints(reportsResponse.data.complaints);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to retrieve analytics reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleExportCSV = () => {
    if (complaints.length === 0) return;
    setExporting(true);

    try {
      const headers = [
        'Complaint ID', 
        'Activity Type', 
        'District', 
        'Place', 
        'Address',
        'Incident Date', 
        'Incident Time',
        'Priority', 
        'Status', 
        'Risk Level', 
        'AI Summary', 
        'Duplicate Score (%)',
        'Filed At'
      ];

      const rows = complaints.map(c => [
        c.complaintId,
        c.activityType,
        c.district,
        c.place,
        c.address,
        new Date(c.incidentDate).toLocaleDateString(),
        c.incidentTime,
        c.priority,
        c.status,
        c.riskLevel || 'N/A',
        c.aiSummary || 'N/A',
        c.duplicateScore !== null ? `${c.duplicateScore}%` : 'N/A',
        new Date(c.createdAt).toLocaleString()
      ]);

      const csvContent = "\uFEFF" + [
        headers.join(','),
        ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `OTF_Intelligence_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-10 h-10 border-4 border-gov-navy border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Aggregating visual indices...</p>
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

  const { summary, complaintsByMonth, complaintsByDistrict, statusDistribution, activityDistribution } = data;

  return (
    <div className="space-y-6">
      {/* Header and Export controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gov-navy uppercase tracking-wider">Visual Intelligence Console</h1>
          <p className="text-xs text-slate-500 mt-1">Platform analytics, monthly trends, and spatial caseload indices</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0">
          <button 
            onClick={fetchAnalyticsData}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 transition-smooth"
            title="Refresh Analytics"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
          
          <button
            onClick={handleExportCSV}
            disabled={exporting || complaints.length === 0}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 bg-gov-navy hover:bg-gov-blue disabled:bg-slate-300 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider transition-smooth cursor-pointer shadow-sm"
          >
            <Download className="h-4 w-4 text-gov-gold" />
            <span>{exporting ? 'Compiling CSV...' : 'Export Intel Ledger'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Total Ledger</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-extrabold text-slate-800">{summary.total}</span>
            <span className="text-[10px] text-slate-400 font-bold">files</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-rose-500">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-405 text-slate-400 block">Pending Check</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-extrabold text-rose-600">{summary.pending}</span>
            <span className="text-[10px] text-rose-450 text-rose-400 font-bold">active</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-amber-500">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-405 text-slate-400 block">Investigating</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-extrabold text-amber-600">{summary.underInvestigation}</span>
            <span className="text-[10px] text-amber-450 text-amber-450 font-bold">cases</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-emerald-500">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-405 text-slate-400 block">Resolved</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-extrabold text-emerald-600">{summary.resolved}</span>
            <span className="text-[10px] text-emerald-450 text-emerald-400 font-bold">closed</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-slate-500">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-405 text-slate-400 block">Rejected</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-extrabold text-slate-600">{summary.rejected}</span>
            <span className="text-[10px] text-slate-400 font-bold">logs</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-gov-gold">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-405 text-slate-400 block">High Priority</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-extrabold text-gov-navy">{summary.highPriority}</span>
            <span className="text-[10px] text-gov-gold font-bold">critical</span>
          </div>
        </div>
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend Area Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gov-navy border-b border-slate-100 pb-2">
            Complaints Per Month (Timeline Trend)
          </h3>
          <div className="h-80 w-full text-xs font-medium">
            {complaintsByMonth.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">No timeline trends logged.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complaintsByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B2545" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0B2545" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="count" stroke="#0B2545" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* District Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gov-navy border-b border-slate-100 pb-2">
            Caseload Density Per District
          </h3>
          <div className="h-80 w-full text-xs font-medium">
            {complaintsByDistrict.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">No district logs recorded.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={complaintsByDistrict} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="district" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gov-navy border-b border-slate-100 pb-2">
            Status Allocation Ratio
          </h3>
          <div className="h-80 w-full text-xs font-medium flex flex-col sm:flex-row items-center justify-center gap-4">
            {summary.total === 0 ? (
              <div className="text-slate-400">No status distributions to compile.</div>
            ) : (
              <>
                <div className="h-64 w-64 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 shrink-0">
                  {statusDistribution.map((entry, index) => (
                    <div key={entry.name} className="flex items-center space-x-2 text-slate-700">
                      <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="font-bold text-xs uppercase tracking-wide">{entry.name}:</span>
                      <span className="font-extrabold">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Drug Activity Type Distribution Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gov-navy border-b border-slate-100 pb-2">
            Drug Activity Type Ratios
          </h3>
          <div className="h-80 w-full text-xs font-medium">
            {activityDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">No drug activity records logs.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityDistribution} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" width={90} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#B5893D" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
