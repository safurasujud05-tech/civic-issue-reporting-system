import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getComplaints, updateComplaintStatus } from '../utils/api';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import MapView from '../components/MapView';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await getComplaints({});
      setComplaints(data.complaints || []);
    } catch (err) {
      setError('Failed to load complaints');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const changeStatus = async (id, status) => {
    try {
      await updateComplaintStatus(id, status);
      await loadComplaints();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Admin Portal</h1>
            <p className="text-sm text-gray-500 mt-1">View complaint summaries and analytics.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to="/government" className="btn-secondary text-sm py-2 px-4">
              View Analytics Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-4">
              <h3 className="font-semibold mb-3">All Complaints</h3>
              {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : (
                <div className="space-y-3">
                  {complaints.map(c => (
                    <div key={c.id} className="p-3 rounded-lg border border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="max-w-3xl">
                        <p className="font-semibold text-gray-800">{c.title}</p>
                        <p className="text-sm text-gray-500">{c.location_name || 'No location specified'}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(c.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div>
                          <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Status</label>
                          <select
                            value={c.status}
                            onChange={(e) => changeStatus(c.id, e.target.value)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                          >
                            <option>Submitted</option>
                            <option>In Progress</option>
                            <option>Resolved</option>
                          </select>
                        </div>
                        <Link
                          to={`/complaint/${c.id}`}
                          state={{ from: '/admin' }}
                          className="text-sky-600 hover:text-sky-800 text-sm font-semibold"
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-4">
              <h3 className="font-semibold mb-3">Heatmap</h3>
              <MapView />
            </div>

          </div>

          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="font-semibold mb-3">Analytics</h3>
              <AnalyticsDashboard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
