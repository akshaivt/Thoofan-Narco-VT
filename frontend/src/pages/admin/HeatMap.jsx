import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import { Calendar, Filter, Layers } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';

const HeatMap = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/analytics/map-locations');
      if (response.data && response.data.success) {
        setLocations(response.data.locations);
        setFilteredLocations(response.data.locations);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch geospatial logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Filter logic runs on change of filter states
  useEffect(() => {
    let filtered = [...locations];

    if (selectedDistrict !== 'All') {
      filtered = filtered.filter(item => item.district === selectedDistrict);
    }

    if (selectedStatus !== 'All') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => new Date(item.incidentDate) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => new Date(item.incidentDate) <= end);
    }

    setFilteredLocations(filtered);
  }, [selectedDistrict, selectedStatus, startDate, endDate, locations]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-10 h-10 border-4 border-gov-navy border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Loading density profiles...</p>
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

  // Get unique districts for the filter list
  const districts = ['All', ...new Set(locations.map(item => item.district))];

  // Default coordinate center (Delhi/India coordinates)
  const defaultCenter = [28.6139, 77.2090];
  const zoomLevel = 5;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gov-navy uppercase tracking-wider">Caseload Heat Density Overlay</h1>
        <p className="text-xs text-slate-500 mt-1">Aggregated density clusters highlighting drug activity hotspots</p>
      </div>

      {/* Filter panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        {/* District Filter */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-500 uppercase tracking-wide flex items-center space-x-1">
            <Filter className="h-3 w-3" />
            <span>District / Area</span>
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue transition-smooth font-semibold"
          >
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-500 uppercase tracking-wide flex items-center space-x-1">
            <Layers className="h-3 w-3" />
            <span>Case Status</span>
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue transition-smooth font-semibold"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Incident Date From */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-500 uppercase tracking-wide flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>Start Date</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue transition-smooth font-medium"
          />
        </div>

        {/* Incident Date To */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-500 uppercase tracking-wide flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>End Date</span>
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue transition-smooth font-medium"
          />
        </div>
      </div>

      {/* Map Container overlay */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-2">
        <div className="h-[550px] w-full rounded-lg overflow-hidden border border-slate-100 relative z-10">
          <MapContainer 
            center={defaultCenter} 
            zoom={zoomLevel} 
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredLocations.map((loc) => (
              <Circle
                key={loc._id}
                center={[loc.latitude, loc.longitude]}
                radius={25000} // radius in meters (25 km circle for density overlapping)
                pathOptions={{
                  fillColor: '#ef4444',
                  fillOpacity: 0.15,
                  color: 'transparent',
                  stroke: false
                }}
              />
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Map Guidance note */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-500 leading-relaxed font-semibold">
        💡 **Density Mechanics**: Hotspots are generated dynamically using overlapping circle radius parameters. Intense red clusters indicate higher frequency reports in close geographical proximity. Apply filters above to dynamically constrain calculations.
      </div>
    </div>
  );
};

export default HeatMap;
