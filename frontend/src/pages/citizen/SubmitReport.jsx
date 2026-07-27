import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import UploadBox from '../../components/UploadBox';
import api from '../../services/api';
import { 
  FileText, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  CheckCircle,
  EyeOff,
  AlertTriangle
} from 'lucide-react';

const SubmitReport = () => {
  const navigate = useNavigate();

  const [policeStations, setPoliceStations] = useState([]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await api.get('/system/police-stations');
        if (response.data && response.data.success) {
          setPoliceStations(response.data.stations);
        }
      } catch (err) {
        console.error('Failed to load police stations:', err);
      }
    };
    fetchStations();
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const findNearestStation = (userLat, userLng) => {
    let nearest = null;
    let minDistance = Infinity;

    policeStations.forEach(station => {
      const dist = calculateDistance(userLat, userLng, station.latitude, station.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = { ...station, distance: dist.toFixed(2) };
      }
    });
    return nearest;
  };

  const [formData, setFormData] = useState({
    activityType: '',
    description: '',
    district: '',
    place: '',
    address: '',
    latitude: '',
    longitude: '',
    nearestPoliceStation: '',
    incidentDate: '',
    incidentTime: '',
    isConfidential: false
  });

  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedId, setSubmittedId] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationAlert, setLocationAlert] = useState('');

  const activityOptions = [
    'Drug Trafficking',
    'Local Distribution / Peddling',
    'Illicit Drug Consumption',
    'Chemical Lab / Manufacturing',
    'Illegal Pharmacy Sales',
    'Other Narcotic Activity'
  ];

  const districtOptions = [
    'Central Delhi',
    'North Delhi',
    'South Delhi',
    'East Delhi',
    'West Delhi',
    'Gurugram',
    'Noida',
    'Ghaziabad'
  ];

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingLocation(true);
    setError('');
    setLocationAlert('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const nearest = findNearestStation(lat, lng);

        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          nearestPoliceStation: nearest ? nearest.name : '',
          district: nearest ? nearest.district : prev.district
        }));

        if (nearest) {
          setLocationAlert(`Nearest Station: ${nearest.name} (${nearest.distance} km away) in ${nearest.district}.`);
        } else {
          setLocationAlert(`Coordinates detected: Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`);
        }
        setDetectingLocation(false);
      },
      (err) => {
        console.error(err);
        setError('Location permission denied or timed out. Please enter coordinates manually.');
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      const nearest = findNearestStation(lat, lng);
      if (nearest && nearest.name !== formData.nearestPoliceStation) {
        setFormData(prev => ({
          ...prev,
          nearestPoliceStation: nearest.name,
          district: nearest.district
        }));
        setLocationAlert(`Nearest Station Auto-Calculated: ${nearest.name} (${nearest.distance} km away) in ${nearest.district}.`);
      }
    }
  }, [formData.latitude, formData.longitude]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmittedId('');

    // Description validation
    if (formData.description.length > 1000) {
      setError('Description cannot exceed 1000 characters.');
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        payload.append(key, formData[key]);
      });

      // Append image files
      images.forEach(file => {
        payload.append('images', file);
      });

      // Append video files
      videos.forEach(file => {
        payload.append('videos', file);
      });

      const response = await api.post('/complaints', payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.success) {
        setSubmittedId(response.data.complaintId);
        // Clear form
        setFormData({
          activityType: '',
          description: '',
          district: '',
          place: '',
          address: '',
          latitude: '',
          longitude: '',
          incidentDate: '',
          incidentTime: '',
          isConfidential: false
        });
        setImages([]);
        setVideos([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit report. Please review your fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gov-navy uppercase tracking-wider">File Confidential Incident Report</h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">
          Provide accurate intelligence logs. Encrypted submission.
        </p>
      </div>

      {submittedId ? (
        /* Success Screen */
        <div className="bg-white border border-emerald-200 rounded-xl p-8 shadow text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-9 w-9 text-emerald-600 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-emerald-800 uppercase tracking-wide">
              Report Submitted Successfully
            </h2>
            <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
              Your incident report has been securely saved and queued for intelligence analysis. Write down your tracking code.
            </p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg inline-block">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Your Tracking ID</span>
            <span className="text-xl font-mono font-bold text-gov-navy tracking-wider select-all">{submittedId}</span>
          </div>
          <div className="flex justify-center space-x-4 pt-2">
            <Link
              to={`/citizen/track?id=${submittedId}`}
              className="bg-gov-navy hover:bg-gov-blue text-white font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-smooth"
            >
              Track Status
            </Link>
            <button
              onClick={() => setSubmittedId('')}
              className="border border-slate-350 hover:border-slate-800 text-slate-600 hover:text-slate-900 font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-smooth"
            >
              File Another Report
            </button>
          </div>
        </div>
      ) : (
        /* Form Screen */
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg">
              {error}
            </div>
          )}

          {/* Section 1: Incident Specifications */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gov-blue border-b border-slate-100 pb-1">
              1. Incident Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Drug Activity Type *
                </label>
                <select
                  required
                  value={formData.activityType}
                  onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue transition-smooth text-sm font-semibold"
                >
                  <option value="">Select Type</option>
                  {activityOptions.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Incident Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-850 focus:outline-none focus:border-gov-blue transition-smooth text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Incident Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.incidentTime}
                    onChange={(e) => setFormData({ ...formData, incidentTime: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-850 focus:outline-none focus:border-gov-blue transition-smooth text-sm font-semibold"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Description of Suspected Activity *
              </label>
              <textarea
                required
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-850 focus:outline-none focus:border-gov-blue transition-smooth text-sm font-medium"
                placeholder="Include specific behaviors, suspect appearance, or vehicle details. Max 1000 characters."
              />
              <span className="block text-[10px] text-right text-slate-400 mt-1">
                {formData.description.length} / 1000 characters
              </span>
            </div>
          </div>

          {/* Section 2: Location Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gov-blue border-b border-slate-100 pb-1">
              2. Incident Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  District *
                </label>
                <select
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue transition-smooth text-sm font-semibold"
                >
                  <option value="">Select District</option>
                  {districtOptions.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Specific Place *
                </label>
                <input
                  type="text"
                  required
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue transition-smooth text-sm font-medium"
                  placeholder="e.g. Near Metro Station / XYZ Market"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Detailed Address / Landmark Details *
              </label>
              <textarea
                required
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-850 focus:outline-none focus:border-gov-blue transition-smooth text-sm font-medium"
                placeholder="Include landmark name, street name, house/shop numbers..."
              />
            </div>

            {/* Coordinates & Nearest Police Station (Location Picker) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Coordinates & Police Routing
                </span>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={detectingLocation}
                  className="bg-gov-blue hover:bg-gov-navy text-white text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded transition-smooth disabled:bg-slate-300 cursor-pointer"
                >
                  {detectingLocation ? 'Locating...' : 'Auto-Detect Location'}
                </button>
              </div>

              {locationAlert && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-250 text-emerald-800 text-[10px] font-semibold rounded flex items-center space-x-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{locationAlert}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 font-mono focus:outline-none focus:border-gov-blue"
                    placeholder="Latitude (e.g. 28.6139)"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 font-mono focus:outline-none focus:border-gov-blue"
                    placeholder="Longitude (e.g. 77.2090)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Nearest Police Station Assigned</label>
                <input
                  type="text"
                  value={formData.nearestPoliceStation}
                  onChange={(e) => setFormData({ ...formData, nearestPoliceStation: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-850 focus:outline-none focus:border-gov-blue font-semibold"
                  placeholder="Auto-calculated or manually specified station..."
                />
              </div>
            </div>
          </div>

          {/* Section 3: Upload Evidence */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gov-blue border-b border-slate-100 pb-1">
              3. Evidence Files
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <UploadBox
                label="Photo Evidence"
                accept=".jpg,.jpeg,.png,.webp"
                multiple={true}
                files={images}
                onChange={setImages}
                maxFiles={5}
                fileType="images"
              />
              <UploadBox
                label="Video Evidence"
                accept=".mp4,.mov,.avi"
                multiple={true}
                files={videos}
                onChange={setVideos}
                maxFiles={2}
                fileType="videos"
              />
            </div>
          </div>

          {/* Section 4: Privacy Settings */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <input
                type="checkbox"
                id="confidentiality"
                checked={formData.isConfidential}
                onChange={(e) => setFormData({ ...formData, isConfidential: e.target.checked })}
                className="mt-1 h-4 w-4 text-gov-navy focus:ring-gov-blue border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="confidentiality" className="cursor-pointer select-none">
                <span className="flex items-center space-x-1.5 font-bold text-xs uppercase tracking-wide text-gov-navy">
                  <EyeOff className="h-4 w-4 text-gov-gold" />
                  <span>Keep My Identity Confidential</span>
                </span>
                <span className="block text-[10px] text-slate-550 text-slate-500 mt-1 leading-relaxed">
                  Your registration profile (name and telephone number) will be hidden from investigating officers. Only platform Super Admins hold keys to reveal reporter profiles.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gov-navy hover:bg-gov-blue disabled:bg-slate-400 text-white font-bold py-3 rounded-lg shadow-sm transition-smooth flex items-center justify-center space-x-2 text-xs uppercase tracking-wider cursor-pointer"
            >
              <span>{loading ? 'Transmitting Intelligence Logs...' : 'Submit Security Report'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SubmitReport;
