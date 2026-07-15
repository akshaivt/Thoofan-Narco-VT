import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  EyeOff, 
  Save, 
  AlertCircle, 
  CheckCircle,
  FileImage,
  FileVideo,
  AlertTriangle,
  Lock,
  Unlock,
  Download,
  Eye,
  Brain
} from 'lucide-react';

const ComplaintDetails = () => {
  const { id } = useParams(); // complaintId code (e.g. OTF-2026-000001)
  const { role } = useContext(AuthContext);

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Update state
  const [status, setStatus] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updating, setUpdating] = useState(false);

  // Phase 4 states
  const [revealedProfile, setRevealedProfile] = useState(null);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [revealReason, setRevealReason] = useState('');
  const [revealError, setRevealError] = useState('');
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const handleRevealIdentity = async (e) => {
    e.preventDefault();
    if (!revealReason.trim()) {
      setRevealError('Reason is mandatory.');
      return;
    }
    setRevealError('');
    try {
      const response = await api.post(`/complaints/admin/${complaint._id}/reveal-identity`, {
        reason: revealReason
      });
      if (response.data.success) {
        setRevealedProfile(response.data.reporter);
        setShowRevealModal(false);
      }
    } catch (err) {
      setRevealError(err.response?.data?.message || 'Failed to reveal identity.');
    }
  };

  const handleDownloadPDF = async () => {
    if (!complaint) return;
    setPdfGenerating(true);
    try {
      const response = await api.get(`/complaints/admin/${complaint._id}/pdf`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Operational_Report_${complaint.complaintId}.pdf`;
      link.click();
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate case PDF file.');
    } finally {
      setPdfGenerating(false);
    }
  };

  const fetchComplaintDetails = async () => {
    try {
      const response = await api.get(`/complaints/${id}`);
      if (response.data && response.data.success) {
        const data = response.data.complaint;
        setComplaint(data);
        setStatus(data.status);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to retrieve complaint logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdateSuccess('');
    setUpdateError('');
    setUpdating(true);

    try {
      const response = await api.put(`/complaints/admin/${complaint._id}/status`, { status });
      if (response.data.success) {
        setUpdateSuccess('Complaint status updated successfully.');
        setComplaint(prev => ({ ...prev, status }));
      }
    } catch (err) {
      console.error(err);
      setUpdateError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleNotesUpdate = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setUpdateSuccess('');
    setUpdateError('');
    setUpdating(true);

    try {
      const response = await api.put(`/complaints/admin/${complaint._id}/notes`, { note: newNoteText });
      if (response.data.success) {
        setUpdateSuccess('Investigation note added successfully.');
        setNewNoteText('');
        await fetchComplaintDetails(); // Refresh details to fetch populated notes
      }
    } catch (err) {
      console.error(err);
      setUpdateError(err.response?.data?.message || 'Failed to save notes.');
    } finally {
      setUpdating(false);
    }
  };

  const handleAcceptAISuggestions = async () => {
    setUpdateSuccess('');
    setUpdateError('');
    setUpdating(true);

    try {
      const suggestedPriority = ['Low', 'Medium', 'High'].includes(complaint.aiPriority) 
        ? complaint.aiPriority 
        : 'Medium';
      
      // Update priority
      await api.put(`/complaints/admin/${complaint._id}/status`, { priority: suggestedPriority });

      // Append note
      if (complaint.aiSuggestions) {
        await api.put(`/complaints/admin/${complaint._id}/notes`, { note: `[AI Suggestion Applied]: ${complaint.aiSuggestions}` });
      }

      setUpdateSuccess('AI recommendations applied successfully: Case priority set to ' + suggestedPriority + '.');
      await fetchComplaintDetails();
    } catch (err) {
      console.error(err);
      setUpdateError('Failed to apply AI recommendations.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDismissAISuggestions = () => {
    setUpdateSuccess('AI suggestions dismissed.');
  };

  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-gov-navy border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Loading record...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="space-y-4">
        <Link to="/admin/complaints" className="inline-flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-gov-blue hover:text-gov-navy transition-smooth">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Complaints</span>
        </Link>
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error || 'Complaint not found.'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link 
          to="/admin/complaints" 
          className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-gov-blue hover:text-gov-navy transition-smooth"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Complaints list</span>
        </Link>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadPDF}
            disabled={pdfGenerating}
            className="inline-flex items-center space-x-1.5 bg-gov-blue/15 hover:bg-gov-blue/25 text-gov-blue px-3.5 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-smooth cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{pdfGenerating ? 'Generating...' : 'Export PDF'}</span>
          </button>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</span>
          <ComplaintStatusBadge status={complaint.status} />
        </div>
      </div>

      {/* Main Alerts */}
      {updateSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-semibold rounded-lg flex items-center space-x-2">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>{updateSuccess}</span>
        </div>
      )}
      {updateError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg flex items-center space-x-2">
          <AlertTriangle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
          <span>{updateError}</span>
        </div>
      )}

      {/* Grid layouts: Left details, Right operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Case Specifications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            
            {/* Title Block */}
            <div className="border-b border-slate-100 pb-4 space-y-1">
              <span className="font-mono text-xs font-bold text-slate-400 block leading-none">
                {complaint.complaintId}
              </span>
              <h2 className="text-lg font-extrabold text-gov-navy uppercase tracking-wide">
                {complaint.activityType}
              </h2>
            </div>

            {/* Incident Specifics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start space-x-2">
                <Calendar className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">Incident Date</span>
                  <span className="block text-slate-800 font-semibold mt-0.5">
                    {new Date(complaint.incidentDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Clock className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">Incident Time</span>
                  <span className="block text-slate-800 font-semibold mt-0.5">{complaint.incidentTime}</span>
                </div>
              </div>
            </div>

            {/* Description Description */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 text-slate-400">
                Detailed Suspect / Activity Logs
              </span>
              <p className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs leading-relaxed font-medium">
                {complaint.description}
              </p>
            </div>

            {/* Location Specs */}
            <div className="space-y-3 pt-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                <MapPin className="h-3.5 w-3.5 text-gov-blue" />
                <span>Geographic Specifications</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-lg text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">District / Area</span>
                  <p className="text-slate-800 font-bold mt-1">{complaint.district}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Place Name</span>
                  <p className="text-slate-800 font-bold mt-1">{complaint.place}</p>
                </div>
                <div className="sm:col-span-2 border-t border-slate-200 pt-2.5 mt-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Address</span>
                  <p className="text-slate-700 font-medium mt-1 leading-relaxed">{complaint.address}</p>
                </div>
                {complaint.latitude && complaint.longitude && (
                  <div className="sm:col-span-2 border-t border-slate-200 pt-2.5 mt-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">GPS Coordinates</span>
                    <p className="text-slate-700 font-mono mt-1">
                      Lat: {complaint.latitude}, Lng: {complaint.longitude}
                    </p>
                  </div>
                )}
                {complaint.nearestPoliceStation && (
                  <div className="sm:col-span-2 border-t border-slate-200 pt-2.5 mt-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assigned Nearest Police Station</span>
                    <p className="text-slate-800 font-bold mt-1">
                      {complaint.nearestPoliceStation}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Analysis Panel */}
            <div className="p-5 bg-blue-50/20 border border-blue-100 rounded-xl space-y-4 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gov-navy flex items-center space-x-1.5">
                <Brain className="h-4.5 w-4.5 text-gov-gold" />
                <span>AI Automated Insights</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">AI Category</span>
                  <span className="font-bold text-slate-800">{complaint.aiCategory || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Threat Risk Level</span>
                  <span className={`font-bold uppercase tracking-wide text-[10px] ${
                    complaint.riskLevel === 'Critical' ? 'text-rose-600' :
                    complaint.riskLevel === 'High' ? 'text-amber-600' : 'text-slate-700'
                  }`}>{complaint.riskLevel || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Suggested Priority</span>
                  <span className="font-bold text-slate-800">{complaint.aiPriority || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Duplicate Score</span>
                  <span className={`font-bold ${
                    complaint.duplicateScore > 80 ? 'text-rose-600' : 'text-slate-800'
                  }`}>
                    {complaint.duplicateScore !== null ? `${complaint.duplicateScore}%` : '0%'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">AI Summary Analysis</span>
                <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-200 p-3 rounded-lg font-medium">
                  {complaint.aiSummary || 'No AI summary generated.'}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Suggested Actions</span>
                <p className="text-xs text-slate-600 italic bg-white border border-slate-200 p-3 rounded-lg">
                  "{complaint.aiSuggestions || 'No recommendations generated.'}"
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleAcceptAISuggestions}
                  disabled={updating}
                  className="flex-1 bg-gov-navy hover:bg-gov-blue text-white font-bold py-2 rounded-lg text-[10px] uppercase tracking-wider transition-smooth cursor-pointer shadow-sm text-center border border-gov-navy hover:border-gov-gold"
                >
                  Apply AI Priority & Notes
                </button>
                <button
                  onClick={handleDismissAISuggestions}
                  disabled={updating}
                  className="px-4 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-bold py-2 rounded-lg text-[10px] uppercase tracking-wider transition-smooth cursor-pointer"
                >
                  Ignore
                </button>
              </div>
            </div>

            {/* Evidence media list */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wide text-gov-navy">
                Incident Evidence logs
              </h3>

              {complaint.evidenceImages?.length === 0 && complaint.evidenceVideos?.length === 0 ? (
                <p className="text-xs text-slate-455 text-slate-400 bg-slate-50 border border-slate-150 p-4 rounded-lg text-center font-medium">
                  No photographic or video evidence uploaded.
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Images list */}
                  {complaint.evidenceImages?.length > 0 && (
                    <div className="space-y-2">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                        <FileImage className="h-3.5 w-3.5" />
                        <span>Photographs ({complaint.evidenceImages.length})</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {complaint.evidenceImages.map((img, idx) => (
                          <a 
                            key={idx} 
                            href={getMediaUrl(img)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block border border-slate-200 rounded-lg overflow-hidden h-40 bg-slate-50 flex items-center justify-center hover:opacity-90 transition-smooth"
                          >
                            <img 
                              src={getMediaUrl(img)} 
                              alt={`evidence-img-${idx}`} 
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos list */}
                  {complaint.evidenceVideos?.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                        <FileVideo className="h-3.5 w-3.5" />
                        <span>Videos ({complaint.evidenceVideos.length})</span>
                      </span>
                      <div className="grid grid-cols-1 gap-4">
                        {complaint.evidenceVideos.map((vid, idx) => (
                          <div 
                            key={idx} 
                            className="border border-slate-200 rounded-lg overflow-hidden bg-black flex justify-center items-center h-64 shadow-inner"
                          >
                            <video 
                              src={getMediaUrl(vid)} 
                              controls 
                              className="w-full h-full max-h-64 object-contain"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Side: Reporter & Status updates */}
        <div className="space-y-6">
          
          {/* Reporter Information Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-gov-navy border-b border-slate-100 pb-2 flex items-center space-x-1.5">
              <User className="h-4.5 w-4.5 text-gov-blue" />
              <span>Reporter Profile</span>
            </h3>

            {complaint.isConfidential ? (
              revealedProfile ? (
                /* Decrypted Profile (Super Admin Reveal) */
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-3 text-xs">
                  <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                    <Unlock className="h-4.5 w-4.5 text-emerald-600" />
                    <span className="uppercase tracking-wider text-[9px] bg-emerald-100 px-2 py-0.5 rounded">Decrypted Identity</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reporter Name</span>
                    <span className="block text-slate-800 font-bold mt-0.5">{revealedProfile.name}</span>
                  </div>
                  <div className="border-t border-emerald-100 pt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reporter Email</span>
                    <span className="block text-slate-850 font-medium mt-0.5 font-mono">{revealedProfile.email}</span>
                  </div>
                  <div className="border-t border-emerald-100 pt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reporter Phone</span>
                    <span className="block text-slate-800 font-bold mt-0.5">{revealedProfile.phone}</span>
                  </div>
                </div>
              ) : (
                /* Confidential Locked Display */
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-3">
                  <Lock className="h-6 w-6 text-gov-gold mx-auto" />
                  <span className="inline-block px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase bg-gov-light text-gov-blue rounded border border-slate-200">
                    Confidential Report
                  </span>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    This citizen has requested confidentiality. Profile details are restricted.
                  </p>
                  
                  {role === 'superadmin' ? (
                    <button
                      onClick={() => {
                        setRevealReason('');
                        setRevealError('');
                        setShowRevealModal(true);
                      }}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-lg text-[10px] uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-smooth cursor-pointer shadow-sm"
                    >
                      <Unlock className="h-3.5 w-3.5" />
                      <span>Reveal Identity</span>
                    </button>
                  ) : (
                    <div className="text-[9px] bg-slate-100 border border-slate-200 p-2 rounded text-slate-405 text-slate-400 mt-2 font-semibold">
                      Decryption restricted to Super Administrator.
                    </div>
                  )}
                </div>
              )
            ) : (
              /* Non-confidential display */
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reporter Name</span>
                  <span className="block text-slate-800 font-bold mt-0.5">{complaint.citizenDetails?.name || 'Unknown'}</span>
                </div>
                {complaint.citizenDetails?.email && (
                  <div className="border-t border-slate-100 pt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reporter Email</span>
                    <span className="block text-slate-850 font-medium mt-0.5">{complaint.citizenDetails?.email}</span>
                  </div>
                )}
                {complaint.citizenDetails?.phone && (
                  <div className="border-t border-slate-100 pt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reporter Phone</span>
                    <span className="block text-slate-850 font-medium mt-0.5">{complaint.citizenDetails?.phone}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Update Form */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-gov-navy border-b border-slate-100 pb-2">
              Update Case Status
            </h3>

            <form onSubmit={handleStatusUpdate} className="space-y-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue transition-smooth text-xs font-semibold"
              >
                <option value="Pending">Pending</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <button
                type="submit"
                disabled={updating || status === complaint.status}
                className="w-full bg-gov-navy hover:bg-gov-blue disabled:bg-slate-300 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition-smooth flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{updating ? 'Saving...' : 'Update Status'}</span>
              </button>
            </form>
          </div>

          {/* Admin Investigation Notes Card with logs */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-gov-navy border-b border-slate-100 pb-2">
              Investigation Notes Logs
            </h3>

            {/* List of existing notes */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {complaint.notes && complaint.notes.length > 0 ? (
                complaint.notes.map((noteObj, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                    <p className="text-slate-700 font-medium leading-relaxed">{noteObj.note}</p>
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase">
                      <span>Posted By: Officer</span>
                      <span>{new Date(noteObj.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-2">No notes recorded yet.</p>
              )}
            </div>

            {/* Form to append a note */}
            <form onSubmit={handleNotesUpdate} className="space-y-3 border-t border-slate-100 pt-3">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Add New Note
              </span>
              <textarea
                rows="3"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Type investigation logs or updates..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-850 focus:outline-none focus:border-gov-blue transition-smooth text-xs font-medium"
              />

              <button
                type="submit"
                disabled={updating || !newNoteText.trim()}
                className="w-full bg-gov-navy hover:bg-gov-blue disabled:bg-slate-350 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition-smooth flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{updating ? 'Saving...' : 'Save Note'}</span>
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Identity Reveal Modal Dialog */}
      {showRevealModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-rose-50 border-b border-rose-100 p-4 flex items-center space-x-2.5">
              <AlertTriangle className="h-5 w-5 text-rose-650 animate-pulse" />
              <h3 className="font-extrabold text-gov-navy text-xs uppercase tracking-wider">Identity Disclosure Authorization</h3>
            </div>
            
            <form onSubmit={handleRevealIdentity} className="p-5 space-y-4 text-xs font-medium">
              <p className="text-slate-500 leading-normal">
                You are performing a restricted action. Decrypting the citizen's profile requires a mandatory operational justification. This disclosure will be written to the system audit ledger containing your identity and IP address.
              </p>
              
              {revealError && (
                <div className="p-2.5 bg-rose-50 border border-rose-250 text-rose-800 rounded font-semibold flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{revealError}</span>
                </div>
              )}
              
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Reason for Disclosure</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Provide detailed legal or operational reason for decrypting reporter profile info..."
                  value={revealReason}
                  onChange={(e) => setRevealReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 font-medium text-slate-805 text-slate-800"
                />
              </div>

              <div className="flex space-x-3 pt-2.5">
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-lg text-[10px] uppercase tracking-wider transition-smooth cursor-pointer shadow-sm text-center"
                >
                  Confirm & Decrypt
                </button>
                <button
                  type="button"
                  onClick={() => setShowRevealModal(false)}
                  className="px-4 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-bold py-2.5 rounded-lg text-[10px] uppercase tracking-wider transition-smooth cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Simple ShieldCheck icon since lucide-react name is ShieldCheck
const ShieldCheck = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.67 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
);

export default ComplaintDetails;
