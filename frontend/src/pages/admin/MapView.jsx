import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, ShieldAlert, Layers } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge';

// Helper to create beautiful dynamic marker teardrop pins styled by case status
const createTeardropMarker = (status) => {
  let color = '#ef4444'; // Pending: Red
  if (status === 'Under Investigation') color = '#f59e0b'; // Investigating: Orange
  else if (status === 'Resolved') color = '#10b981'; // Resolved: Green
  else if (status === 'Rejected') color = '#6b7280'; // Rejected: Gray

  const markerHtml = `
    <div style="
      background-color: ${color}; 
      width: 24px; 
      height: 24px; 
      border-radius: 50% 50% 50% 0; 
      transform: rotate(-45deg); 
      border: 2px solid #ffffff; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        background: #ffffff; 
        width: 8px; 
        height: 8px; 
        border-radius: 50%;
      "></div>
    </div>
  `;

  return L.divIcon({
    html: markerHtml,
    className: 'custom-map-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
};

const MapView = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/analytics/map-locations');
      if (response.data && response.data.success) {
        setLocations(response.data.locations);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch geographic complaint records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-10 h-10 border-4 border-gov-navy border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Syncing GIS layers...</p>
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

  // Default coordinate center (Delhi/India coordinates)
  const defaultCenter = [28.6139, 77.2090];
  const zoomLevel = 5;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gov-navy uppercase tracking-wider">Geospatial Intelligence Map</h1>
        <p className="text-xs text-slate-500 mt-1">Live coordinates rendering of active drug complaints</p>
      </div>

      {/* Map Container panel */}
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
            {locations.map((loc) => (
              <Marker
                key={loc._id}
                position={[loc.latitude, loc.longitude]}
                icon={createTeardropMarker(loc.status)}
              >
                <Popup>
                  <div className="text-xs p-1 space-y-2 text-slate-700 min-w-44">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                      <span className="font-mono font-bold text-slate-500">{loc.complaintId}</span>
                      <ComplaintStatusBadge status={loc.status} />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">District:</span>
                        <span className="font-bold text-slate-800">{loc.district}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Place:</span>
                        <span className="font-semibold text-slate-800">{loc.place}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Priority:</span>
                        <span className="font-bold text-gov-gold text-[10px] uppercase tracking-wider">{loc.priority}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Legend details */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-wrap gap-4 text-xs font-semibold text-slate-750">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-full mb-1">Status Pin Code Key:</span>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block border border-white shadow-sm"></span>
          <span>Pending</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block border border-white shadow-sm"></span>
          <span>Under Investigation</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block border border-white shadow-sm"></span>
          <span>Resolved</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-500 inline-block border border-white shadow-sm"></span>
          <span>Rejected</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
