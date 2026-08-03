import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import SearchBar from '../../components/SearchBar';
import FilterPanel from '../../components/FilterPanel';
import ComplaintTable from '../../components/ComplaintTable';
import { ShieldAlert, Database, AlertCircle } from 'lucide-react';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [searchId, setSearchId] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    district: '',
    activityType: '',
    incidentDate: ''
  });

  // Unique list options compiled dynamically from fetched data for filtering
  const [districts, setDistricts] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (searchId.trim()) params.append('complaintId', searchId.trim());
      if (filters.status) params.append('status', filters.status);
      if (filters.district) params.append('district', filters.district);
      if (filters.activityType) params.append('activityType', filters.activityType);
      if (filters.incidentDate) params.append('incidentDate', filters.incidentDate);

      const response = await api.get(`/complaints/admin/all?${params.toString()}`);
      if (response.data && response.data.success) {
        setComplaints(response.data.complaints);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to retrieve logs database.');
    } finally {
      setLoading(false);
    }
  };

  // Run search when searchId or filters change
  useEffect(() => {
    fetchComplaints();
  }, [filters]);

  // Load static filter items on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        // Retrieve all records unfiltered to gather distinct district and activity type lists
        const response = await api.get('/complaints/admin/all');
        if (response.data && response.data.success) {
          const list = response.data.complaints;
          
          const uniqueDistricts = [...new Set(list.map(item => item.district).filter(Boolean))];
          const uniqueTypes = [...new Set(list.map(item => item.activityType).filter(Boolean))];
          
          setDistricts(uniqueDistricts);
          setActivityTypes(uniqueTypes);
        }
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    
    loadFilterOptions();
  }, []);

  const handleClearFilters = () => {
    setSearchId('');
    setFilters({
      status: '',
      district: '',
      activityType: '',
      incidentDate: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gov-navy uppercase tracking-wider">Manage Incident Complaints</h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">
            Access secure database reports, verify evidence, and coordinate status changes.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <SearchBar 
            value={searchId} 
            onChange={setSearchId} 
            onSearch={fetchComplaints}
            placeholder="Search by Complaint ID (e.g. OTF-2026-000001)..." 
          />
          <button
            onClick={fetchComplaints}
            className="w-full sm:w-auto bg-gov-navy hover:bg-gov-blue text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-smooth cursor-pointer"
          >
            Execute Search
          </button>
        </div>

        <FilterPanel 
          filters={filters} 
          onChange={setFilters} 
          onClear={handleClearFilters} 
          districts={districts}
          activityTypes={activityTypes}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-gov-navy border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Executing database queries...</p>
        </div>
      ) : (
        /* Complaints Listing Table */
        <ComplaintTable complaints={complaints} />
      )}
    </div>
  );
};

export default AdminComplaints;
