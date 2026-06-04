import { useEffect, useState } from 'react';
import { getDashboardStats } from '../utils/api';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function GovernmentDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!stats) return null;

  const categories = Object.keys(stats.byCategory || {});
  const categoryValues = categories.map(k => stats.byCategory[k]);

  const statuses = Object.keys(stats.byStatus || {});
  const statusValues = statuses.map(k => stats.byStatus[k]);

  const barData = {
    labels: categories,
    datasets: [
      {
        label: 'Complaints by Category',
        data: categoryValues,
        backgroundColor: ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'],
      },
    ],
  };

  const pieData = {
    labels: statuses,
    datasets: [
      {
        data: statusValues,
        backgroundColor: ['#60a5fa', '#f59e0b', '#34d399'],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">City-level charts and complaint analytics.</p>
          </div>
          <div>
            <a
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition"
            >
              ← Back to Admin Portal
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">Total Complaints</p>
            <p className="text-3xl font-bold text-sky-600">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">Categories</p>
            <ul className="mt-3 space-y-2">
              {categories.map(cat => (
                <li key={cat} className="flex justify-between text-sm">
                  <span className="text-gray-700">{cat}</span>
                  <strong className="text-gray-900">{stats.byCategory[cat]}</strong>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">Status</p>
            <ul className="mt-3 space-y-2">
              {statuses.map(s => (
                <li key={s} className="flex justify-between text-sm">
                  <span className="text-gray-700">{s}</span>
                  <strong className="text-gray-900">{stats.byStatus[s]}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Category-wise Complaints</h3>
            <Bar data={barData} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
            <Pie data={pieData} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Recent Complaints</h3>
          <div className="space-y-3">
            {stats.recentComplaints.map(c => (
              <div key={c.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50 flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">{c.title}</p>
                  <p className="text-xs text-gray-500">{c.category} • {c.location_name || 'No location'}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(c.created_at).toLocaleString()}</p>
                </div>
                <div className="text-sm text-gray-600">{c.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
