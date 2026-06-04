import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getComplaints } from '../utils/api';
import ComplaintForm from '../components/ComplaintForm';
import Chatbot from '../components/Chatbot';

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-complaints'); // my-complaints, report-issue, legal-help
  // legal help is provided via the shared Chatbot component

  // Redirect if not a citizen
  useEffect(() => {
    if (user && user.role !== 'citizen') {
      navigate('/admin');
    }
  }, [user, navigate]);

  // Load user's complaints
  useEffect(() => {
    if (user) {
      loadComplaints();
    }
  }, [user]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await getComplaints({ mine: 'true' });
      setComplaints(data.complaints || []);
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setLoading(false);
    }
  };


  if (!user || user.role !== 'citizen') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🏛️ Citizen Portal</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
            { id: 'my-complaints', label: '📋 My Complaints', icon: '📋' },
            { id: 'report-issue', label: '📝 Report Issue', icon: '📝' },
            { id: 'legal-help', label: '⚖️ Legal Help', icon: '⚖️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === tab.id
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* My Complaints */}
          {activeTab === 'my-complaints' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Reported Issues</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : complaints.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <p className="text-lg text-gray-600 mb-4">No complaints reported yet</p>
                  <button
                    onClick={() => setActiveTab('report-issue')}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
                  >
                    Report Your First Issue
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {complaints.map((complaint) => (
                    <div
                      key={complaint.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                          <p className="text-sm text-gray-600">{complaint.location_name}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                          complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {complaint.status}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{complaint.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Category: {complaint.category}</span>
                        <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-sm"><strong>Department:</strong> {complaint.department}</p>
                      </div>
                      {complaint.image_url && (
                        <img
                          src={complaint.image_url}
                          alt={complaint.title}
                          className="mt-4 max-h-48 rounded-lg"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Report Issue */}
          {activeTab === 'report-issue' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Report a New Issue</h2>
              <ComplaintForm onSuccess={() => {
                loadComplaints();
                setActiveTab('my-complaints');
              }} />
            </div>
          )}

          {/* Legal Help - use shared Chatbot UI for the same experience as Admin */}
          {activeTab === 'legal-help' && (
            <div className="max-w-4xl">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">⚖️ Legal Assistance</h2>
                <p className="text-gray-600 mb-6">
                  Ask for legal information related to civic issues, your rights, or reporting procedures.
                </p>

                <Chatbot />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
