// pages/ComplaintDetail.jsx - Single complaint view with map
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../contexts/AuthContext';
import { getComplaint, updateComplaintStatus, analyzeComplaintAction } from '../utils/api';
import { getCategoryConfig, getStatusConfig, formatDate } from '../utils/helpers';

// Fix leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionAnalysis, setActionAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  useEffect(() => {
    loadComplaint();
  }, [id]);

  async function loadComplaint() {
    try {
      const data = await getComplaint(id);
      setComplaint(data.complaint);
    } catch (err) {
      setError('Complaint not found or server is offline.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(newStatus) {
    setUpdatingStatus(true);
    try {
      const data = await updateComplaintStatus(id, newStatus);
      setComplaint(data.complaint);
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function loadActionAnalysis() {
    if (!complaint) return;

    setAnalysisLoading(true);
    setAnalysisError('');
    try {
      const result = await analyzeComplaintAction(`${complaint.title}: ${complaint.description}`);
      if (result.success) {
        setActionAnalysis(result);
      } else {
        setAnalysisError(result.message || 'Unable to analyze complaint actions.');
      }
    } catch (err) {
      console.error('Action analysis failed', err);
      setAnalysisError('Unable to analyze complaint actions. Please try again later.');
    } finally {
      setAnalysisLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full" />
      </div>
    );
  }

  const backPath = location.state?.from || (isAdmin ? '/admin' : '/dashboard');

  if (error || !complaint) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="font-display font-bold text-2xl text-gray-800 mb-2">Not Found</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link to={backPath} className="btn-primary">← Back</Link>
      </div>
    );
  }

  const category = getCategoryConfig(complaint.category);
  const status = getStatusConfig(complaint.status);
  const hasLocation = complaint.latitude && complaint.longitude;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <Link to={backPath} className="text-sky-600 hover:text-sky-800 text-sm flex items-center gap-1 mb-6">
          ← {isAdmin ? 'Back to Admin Portal' : 'Back'}
        </Link>

        {/* Main card */}
        <div className="card mb-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${category.bg} flex items-center justify-center flex-shrink-0`}>
                <span className="text-2xl">{category.icon}</span>
              </div>
              <div>
                <span className={`category-pill ${category.pill} text-xs`}>{complaint.category}</span>
                <p className="text-xs text-gray-400 mt-1">#{complaint.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
            <span className={`${status.class} flex-shrink-0`}>
              {status.icon} {complaint.status}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-3">
            {complaint.title}
          </h1>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed mb-6 text-sm">
            {complaint.description}
          </p>

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-4 py-5 border-t border-b border-gray-100 mb-5">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Department</p>
              <p className="text-sm text-gray-700 font-medium">🏢 {complaint.department}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Reported</p>
              <p className="text-sm text-gray-700">🕐 {formatDate(complaint.created_at)}</p>
            </div>
            {complaint.location_name && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Location</p>
                <p className="text-sm text-gray-700">📍 {complaint.location_name}</p>
              </div>
            )}
          </div>

          {/* Image */}
          {complaint.image_url && (
            <div className="mb-5">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Attached Photo</p>
              <img
                src={complaint.image_url}
                alt="Complaint"
                className="rounded-xl max-h-72 object-cover border border-gray-100"
              />
            </div>
          )}


          {/* Status Update Panel */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Update Status (Admin)
            </p>
            <div className="flex flex-wrap gap-2">
              {['Submitted', 'In Progress', 'Resolved'].map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusUpdate(s)}
                  disabled={complaint.status === s || updatingStatus}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    complaint.status === s
                      ? 'bg-sky-600 text-white cursor-default'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-sky-300 hover:text-sky-600'
                  } disabled:opacity-50`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map card */}
        {hasLocation && (
          <div className="card">
            <p className="text-sm font-semibold text-gray-700 mb-3">📍 Issue Location</p>
            <MapContainer
              center={[complaint.latitude, complaint.longitude]}
              zoom={15}
              style={{ height: '280px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <Marker position={[complaint.latitude, complaint.longitude]}>
                <Popup>
                  <strong>{complaint.title}</strong><br />
                  {complaint.location_name}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        {/* AI action analysis CTA */}
        {!isAdmin && (
          <div className="card mt-5 bg-white border border-gray-100 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h3 className="font-display font-semibold text-gray-900">AI Action Plan</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Generate a structured action plan for this complaint, including escalation steps and responsible authorities.
                </p>
              </div>
              <button
                type="button"
                onClick={loadActionAnalysis}
                disabled={analysisLoading}
                className="btn-primary text-sm py-2 px-4"
              >
                {analysisLoading ? 'Analyzing…' : 'Analyze Action Plan'}
              </button>
            </div>

            {analysisError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                {analysisError}
              </div>
            )}

            {actionAnalysis && (
              <div className="space-y-4">
                {actionAnalysis.legal_advice && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Legal Advice</h4>
                    <p className="text-sm text-gray-600">{actionAnalysis.legal_advice}</p>
                  </div>
                )}

                {actionAnalysis.steps && actionAnalysis.steps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Recommended Actions</h4>
                    <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
                      {actionAnalysis.steps.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {actionAnalysis.authority && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Responsible Authority</h4>
                    <p className="text-sm text-gray-600">{actionAnalysis.authority}</p>
                  </div>
                )}

                {actionAnalysis.disclaimer && (
                  <p className="text-xs text-gray-500 italic mt-3">{actionAnalysis.disclaimer}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Legal help CTA */}
        {!isAdmin && (
          <div className="card mt-5 bg-sky-50 border-sky-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-semibold text-sky-900">Need legal guidance?</h3>
                <p className="text-sky-700 text-sm mt-1">
                  Get AI-powered advice on your rights and escalation steps.
                </p>
              </div>
              <Link to="/legal" className="btn-primary text-sm flex-shrink-0">
                ⚖️ Get Legal Help
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
