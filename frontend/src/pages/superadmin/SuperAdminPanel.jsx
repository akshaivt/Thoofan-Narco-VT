import React, { useState, useEffect } from 'react';
import { 
  Database, Shield, Settings, Users, ClipboardList, RefreshCw, Key, Download, Upload, PlusCircle, CheckCircle, AlertTriangle, MapPin 
} from 'lucide-react';
import api from '../../services/api';

const SuperAdminPanel = () => {
  const [activeTab, setActiveTab] = useState('audit');
  
  // Data States
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State for creating Admin
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'admin',
    policeStation: ''
  });

  // Form State for creating Station
  const [newStation, setNewStation] = useState({
    name: '',
    district: '',
    latitude: '',
    longitude: ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTabDetails = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      if (activeTab === 'audit') {
        const response = await api.get('/system/audit-logs');
        if (response.data.success) {
          setAuditLogs(response.data.logs);
        }
      } else if (activeTab === 'stats') {
        const response = await api.get('/system/stats');
        if (response.data.success) {
          setStats(response.data.stats);
        }
      } else if (activeTab === 'admins') {
        const response = await api.get('/system/admins');
        if (response.data.success) {
          setAdmins(response.data.admins);
        }
      } else if (activeTab === 'stations') {
        const response = await api.get('/system/police-stations');
        if (response.data.success) {
          setStations(response.data.stations);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to retrieve administrative logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTabDetails();
  }, [activeTab]);

  useEffect(() => {
    const loadStations = async () => {
      try {
        const response = await api.get('/system/police-stations');
        if (response.data && response.data.success) {
          setStations(response.data.stations);
        }
      } catch (err) {
        console.error('Failed to pre-load stations:', err);
      }
    };
    loadStations();
  }, []);

  const handleBackup = async () => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const response = await api.post('/system/backup');
      if (response.data.success) {
        setSuccessMsg(`Database backup exported successfully: ${response.data.fileName}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Database backup export failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!window.confirm('WARNING: Restoring will overwrite all current collection records. Proceed?')) return;
    
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const response = await api.post('/system/restore');
      if (response.data.success) {
        setSuccessMsg(`Database restored successfully from archive: ${response.data.fileRestored}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Restore procedure failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await api.post('/system/admins', newAdmin);
      if (response.data.success) {
        setSuccessMsg(`Account created: ${response.data.message}`);
        setNewAdmin({ name: '', email: '', phone: '', password: '', role: 'admin', policeStation: '' });
        // Refresh list
        const refreshed = await api.get('/system/admins');
        setAdmins(refreshed.data.admins);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to seed account.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateStation = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await api.post('/system/police-stations', newStation);
      if (response.data.success) {
        setSuccessMsg(`Station registered: ${response.data.message}`);
        setNewStation({ name: '', district: '', latitude: '', longitude: '' });
        // Refresh list
        const refreshed = await api.get('/system/police-stations');
        setStations(refreshed.data.stations);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create police station.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gov-navy uppercase tracking-wider">System Operations console</h1>
          <p className="text-xs text-slate-500 mt-1">Super Admin audit monitoring, system backups, and credential management</p>
        </div>
        <button 
          onClick={fetchTabDetails}
          className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 transition-smooth shrink-0 cursor-pointer"
        >
          <RefreshCw className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 text-xs font-bold uppercase tracking-wider overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-4 border-b-2 transition-smooth cursor-pointer ${
            activeTab === 'audit' ? 'border-gov-navy text-gov-navy' : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <ClipboardList className="h-4.5 w-4.5 inline-block mr-1.5" />
          Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 px-4 border-b-2 transition-smooth cursor-pointer ${
            activeTab === 'stats' ? 'border-gov-navy text-gov-navy' : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <Settings className="h-4.5 w-4.5 inline-block mr-1.5" />
          System Diagnostics & Backup
        </button>
        <button
          onClick={() => setActiveTab('admins')}
          className={`pb-3 px-4 border-b-2 transition-smooth cursor-pointer ${
            activeTab === 'admins' ? 'border-gov-navy text-gov-navy' : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <Users className="h-4.5 w-4.5 inline-block mr-1.5" />
          Manage Admins
        </button>
        <button
          onClick={() => setActiveTab('stations')}
          className={`pb-3 px-4 border-b-2 transition-smooth cursor-pointer ${
            activeTab === 'stations' ? 'border-gov-navy text-gov-navy' : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <MapPin className="h-4.5 w-4.5 inline-block mr-1.5" />
          Manage Stations
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center space-x-2">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg flex items-center space-x-2">
          <AlertTriangle className="h-4.5 w-4.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Panels */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {loading ? (
          <div className="text-center py-10 text-slate-400 text-xs font-semibold uppercase tracking-wider">Retrieving ledger details...</div>
        ) : activeTab === 'audit' ? (
          /* AUDIT LOG PANEL */
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gov-navy">Intrusion & Decryption Audit Trails</h3>
            {auditLogs.length === 0 ? (
              <p className="text-center text-slate-400 py-6 text-xs">No audit logs logged in database.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">Operator</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Complaint Target</th>
                      <th className="py-2.5 px-3">IP Address</th>
                      <th className="py-2.5 px-3">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-medium text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="py-3 px-3 font-bold text-gov-navy">{log.userId?.name || 'Super Admin'}</td>
                        <td className="py-3 px-3 font-bold text-[9px] uppercase tracking-wide text-rose-600">{log.action}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-500">{log.complaintId?.complaintId || 'N/A'}</td>
                        <td className="py-3 px-3 font-mono">{log.ipAddress}</td>
                        <td className="py-3 px-3 font-medium text-slate-500 italic max-w-xs truncate" title={log.reason}>"{log.reason}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'stats' ? (
          /* DIAGNOSTICS & BACKUP PANEL */
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stats Card */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gov-navy border-b border-slate-100 pb-2">System Diagnostics</h3>
                {stats && (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Decryption Count</span>
                      <p className="text-lg font-extrabold text-gov-navy mt-0.5">{stats.decryptsCount}</p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Duplicates Flaged</span>
                      <p className="text-lg font-extrabold text-rose-600 mt-0.5">{stats.duplicateCount}</p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Gemini AI Status</span>
                      <p className="text-xs font-bold text-emerald-600 mt-1">{stats.geminiStatus}</p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Storage Handler</span>
                      <p className="text-xs font-bold text-slate-700 mt-1">{stats.cloudinaryStatus}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Backups Card */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gov-navy border-b border-slate-100 pb-2">Database Backup & Restores</h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Create and manage JSON ledger snapshots. Restoring wipes current documents and loads files from backups natively.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={handleBackup}
                    disabled={actionLoading}
                    className="flex-1 bg-gov-navy hover:bg-gov-blue disabled:bg-slate-300 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="h-4 w-4 text-gov-gold" />
                    <span>{actionLoading ? 'Exporting...' : 'Export Backup JSON'}</span>
                  </button>
                  <button
                    onClick={handleRestore}
                    disabled={actionLoading}
                    className="flex-1 border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-700 font-bold py-3 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{actionLoading ? 'Restoring...' : 'Restore Latest Backup'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'admins' ? (
          /* ADMIN DIRECTORY PANEL */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Seed account Form */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gov-navy border-b border-slate-100 pb-2">Register Administrative User</h3>
              
              <form onSubmit={handleCreateAdmin} className="space-y-3.5 text-xs font-medium">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Name</label>
                  <input
                    type="text"
                    required
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Email</label>
                  <input
                    type="email"
                    required
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={newAdmin.phone}
                    onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Password</label>
                  <input
                    type="password"
                    required
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Administrative Role</label>
                  <select
                    value={newAdmin.role}
                    onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-850 focus:outline-none focus:border-gov-blue font-semibold"
                  >
                    <option value="admin">Standard Investigator (admin)</option>
                    <option value="superadmin">Console Manager (superadmin)</option>
                  </select>
                </div>

                {newAdmin.role === 'admin' && (
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Assigned Police Station</label>
                    <select
                      value={newAdmin.policeStation}
                      onChange={(e) => setNewAdmin({ ...newAdmin, policeStation: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-850 focus:outline-none focus:border-gov-blue font-semibold"
                    >
                      <option value="">Central Intelligence (All Stations)</option>
                      {stations.map((st) => (
                        <option key={st._id} value={st.name}>{st.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-gov-navy hover:bg-gov-blue disabled:bg-slate-300 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-smooth cursor-pointer"
                >
                  <PlusCircle className="h-4.5 w-4.5 text-gov-gold" />
                  <span>{actionLoading ? 'Registering...' : 'Add Account'}</span>
                </button>
              </form>
            </div>

            {/* List of Admins */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gov-navy border-b border-slate-100 pb-2">Active Administrators Directory</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Phone</th>
                      <th className="py-2.5 px-3 text-center">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {admins.map((adm) => (
                      <tr key={adm.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-bold text-gov-navy">{adm.name}</td>
                        <td className="py-3 px-3 font-mono">{adm.email}</td>
                        <td className="py-3 px-3">{adm.phone || 'N/A'}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            adm.role === 'superadmin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {adm.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* POLICE STATIONS PANEL */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Register Station Form */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gov-navy border-b border-slate-100 pb-2">Register Police Station</h3>
              
              <form onSubmit={handleCreateStation} className="space-y-3.5 text-xs font-medium">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Station Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hauz Khas Police Station"
                    value={newStation.name}
                    onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-850 focus:outline-none focus:border-gov-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">District</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. South Delhi"
                    value={newStation.district}
                    onChange={(e) => setNewStation({ ...newStation, district: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-850 focus:outline-none focus:border-gov-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 28.5494"
                    value={newStation.latitude}
                    onChange={(e) => setNewStation({ ...newStation, latitude: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-850 focus:outline-none focus:border-gov-blue font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 77.2044"
                    value={newStation.longitude}
                    onChange={(e) => setNewStation({ ...newStation, longitude: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-850 focus:outline-none focus:border-gov-blue font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-gov-navy hover:bg-gov-blue disabled:bg-slate-300 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-smooth cursor-pointer"
                >
                  <PlusCircle className="h-4.5 w-4.5 text-gov-gold" />
                  <span>{actionLoading ? 'Registering...' : 'Add Station'}</span>
                </button>
              </form>
            </div>

            {/* List of Stations */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gov-navy border-b border-slate-100 pb-2">Active Police Precincts</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-2.5 px-3">Precinct Name</th>
                      <th className="py-2.5 px-3">District</th>
                      <th className="py-2.5 px-3">Coordinates (Lat, Lng)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {stations.map((st) => (
                      <tr key={st._id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-bold text-gov-navy">{st.name}</td>
                        <td className="py-3 px-3 font-semibold text-slate-650">{st.district}</td>
                        <td className="py-3 px-3 font-mono text-slate-550">
                          {st.latitude?.toFixed(4)}, {st.longitude?.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminPanel;
