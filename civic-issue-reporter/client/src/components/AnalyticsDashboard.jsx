import { useState, useEffect } from 'react';
import { getAnalytics } from '../utils/api';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await getAnalytics();
        setAnalytics(data);
      } catch (err) {
        setError('Failed to load analytics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!analytics) return null;

  const categoryEntries = Object.entries(analytics.categoryCounts || {}).sort((a, b) => b[1] - a[1]);
  const statusEntries = Object.entries(analytics.statusCounts || {});
  const maxCategory = Math.max(...categoryEntries.map(([, count]) => count), 1);

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Complaints Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          {statusEntries.map(([status, count]) => (
            <div key={status} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-3xl font-bold text-sky-600">{count}</p>
              <p className="text-sm text-gray-600 mt-1">{status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Issues by Category */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Top Issues by Category</h3>
        <div className="space-y-3">
          {categoryEntries.map(([category, count]) => (
            <div key={category} className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium text-gray-700 truncate">{category}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-sky-400 to-sky-600 h-full flex items-center justify-end pr-3 transition-all"
                  style={{ width: `${(count / maxCategory) * 100}%` }}
                >
                  <span className="text-xs font-bold text-white">{count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Quick Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <p className="text-2xl font-bold text-blue-600">{analytics.totalComplaints}</p>
            <p className="text-sm text-blue-700">Total Complaints</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
            <p className="text-2xl font-bold text-emerald-600">{Object.keys(analytics.categoryCounts || {}).length}</p>
            <p className="text-sm text-emerald-700">Categories</p>
          </div>
        </div>
      </div>
    </div>
  );
}
