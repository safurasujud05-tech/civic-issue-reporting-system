// pages/Dashboard.jsx - Shows all complaints with filters, analytics, and heatmap
import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import ComplaintCard from '../components/ComplaintCard';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import MapView from '../components/MapView';
import { useAuth } from '../contexts/AuthContext';
import { getComplaints } from '../utils/api';

const STATUS_FILTERS = ['All', 'Submitted', 'In Progress', 'Resolved'];
const CATEGORY_FILTERS = ['All', 'Electricity', 'Water', 'Roads', 'Garbage'];

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('complaints');

  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get('category') || 'All'
  );

  // Load complaints from API
  const loadComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (statusFilter !== 'All') filters.status = statusFilter;
      if (categoryFilter !== 'All') filters.category = categoryFilter;

      const data = await getComplaints(filters);
      // ensure sorted by votes desc
      const list = data.complaints || [];
      list.sort((a, b) => (b.votes || 0) - (a.votes || 0));
      setComplaints(list);
    } catch (err) {
      setError('Failed to load complaints. Is the backend server running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin');
      return;
    }
    loadComplaints();
  }, [statusFilter, categoryFilter, user, navigate]);

  // Calculate stats from complaints
  const stats = {
    total: complaints.length,
    submitted: complaints.filter(c => c.status === 'Submitted').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
  };


  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">
              {user?.role === 'admin' ? 'Admin Dashboard' : 'Citizen Portal'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {user?.role === 'admin'
                ? 'Manage all complaints, analytics, and the city heatmap.'
                : 'Track your reports, see nearby issues, and follow status updates.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {user?.role === 'admin' && (
              <Link to="/admin" className="btn-secondary text-sm py-2 px-4">
                Go to Admin Portal
              </Link>
            )}
            {user?.role !== 'admin' && (
              <>
                <Link to="/citizen-dashboard" className="btn-secondary text-sm py-2 px-4">
                  My Complaints
                </Link>
                <Link to="/report" className="btn-primary self-start">
                  + New Report
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: '📋', color: 'text-gray-700', bg: 'bg-gray-100' },
            { label: 'Submitted', value: stats.submitted, icon: '📝', color: 'text-amber-700', bg: 'bg-amber-50' },
            { label: 'In Progress', value: stats.inProgress, icon: '🔄', color: 'text-blue-700', bg: 'bg-blue-50' },
            { label: 'Resolved', value: stats.resolved, icon: '✅', color: 'text-emerald-700', bg: 'bg-emerald-50' },
          ].map((stat, i) => (
            <div key={i} className="card text-center">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg} mb-3`}>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <p className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-400 text-xs mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-8">
            {[
              { id: 'complaints', label: '📋 Complaints', icon: '📋' },
              { id: 'analytics', label: '📊 Analytics', icon: '📊' },
              { id: 'heatmap', label: '🗺️ Heatmap', icon: '🗺️' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <>
            {user ? (
              <div className="mb-6 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-700">
                Showing reports for <strong>{user.name}</strong>. If you want to manage city-wide issues, visit the Admin Portal.
              </div>
            ) : (
              <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                Sign in to see your personal reports and submit new issues from your citizen account.
              </div>
            )}
            {/* Filters */}
            <div className="card mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Status filter */}
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Filter by Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_FILTERS.map(status => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          statusFilter === status
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category filter */}
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Filter by Category</p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_FILTERS.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          categoryFilter === cat
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Refresh */}
                <div className="flex items-end">
                  <button
                    onClick={loadComplaints}
                    className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
                ❌ {error}
                <button onClick={loadComplaints} className="ml-3 underline">Try again</button>
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="spinner w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full mb-4" />
                <p className="text-gray-400 text-sm">Loading complaints...</p>
              </div>
            ) : complaints.length === 0 ? (
              // Empty state
              <div className="text-center py-20">
                <p className="text-5xl mb-4">📭</p>
                <h3 className="font-display font-semibold text-gray-700 text-xl mb-2">No complaints found</h3>
                <p className="text-gray-400 text-sm mb-6">
                  {statusFilter !== 'All' || categoryFilter !== 'All'
                    ? 'Try changing your filters'
                    : 'Be the first to report a civic issue!'}
                </p>
                <Link to="/report" className="btn-primary">Report an Issue</Link>
              </div>
            ) : (
              // Complaints grid
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500 font-medium">
                    Showing <span className="text-gray-900 font-semibold">{complaints.length}</span> complaint{complaints.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {complaints.map(complaint => (
                    <ComplaintCard key={complaint.id} complaint={complaint} onVote={(updated) => {
                      // update local state and re-sort
                      setComplaints(prev => {
                        const next = prev.map(p => (p.id === updated.id ? updated : p));
                        next.sort((a, b) => (b.votes || 0) - (a.votes || 0));
                        return next;
                      });
                    }} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="card">
            <AnalyticsDashboard />
          </div>
        )}

        {/* Heatmap Tab */}
        {activeTab === 'heatmap' && (
          <div className="card">
            <MapView />
          </div>
        )}
      </div>
    </div>
  );
}
