import { useState, useEffect } from 'react';
import { getComplaints } from '../utils/api';

export default function Heatmap() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clusters, setClusters] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const data = await getComplaints({});
        const items = data.complaints || [];
        setComplaints(items);
        // build clusters
        const gridSize = 0.01; // ~1km
        const map = {};
        items.forEach((complaint) => {
          if (complaint.latitude && complaint.longitude) {
            const gridLat = Math.floor(complaint.latitude / gridSize) * gridSize;
            const gridLng = Math.floor(complaint.longitude / gridSize) * gridSize;
            const key = `${gridLat},${gridLng}`;
            if (!map[key]) map[key] = { lat: gridLat, lng: gridLng, count: 0, issues: [] };
            map[key].count += 1;
            map[key].issues.push(complaint);
          }
        });
        setClusters(Object.values(map));
      } catch (err) {
        setError('Failed to load complaint locations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadComplaints();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading heatmap...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  const maxCount = Math.max(...clusters.map(c => c.count), 1);
  const getColor = (count) => {
    const intensity = count / maxCount;
    if (intensity > 0.75) return 'from-red-500 to-red-700';
    if (intensity > 0.5) return 'from-orange-400 to-orange-600';
    if (intensity > 0.25) return 'from-yellow-300 to-yellow-500';
    return 'from-blue-300 to-blue-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">🗺️ Issue Density Map</h3>
        <p className="text-sm text-gray-500 mb-4">Click a cluster to see detailed reports in that area.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {clusters.map((cluster, idx) => (
          <div
            key={idx}
            onClick={() => setSelected(cluster)}
            role="button"
            tabIndex={0}
            className={`relative rounded-lg p-4 cursor-pointer transition-all hover:scale-105 ${
              cluster.count > 0
                ? `bg-gradient-to-br ${getColor(cluster.count)} text-white shadow-lg`
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <div className="text-center">
              <p className="text-2xl font-bold">{cluster.count}</p>
              <p className="text-xs opacity-90 mt-1">Issues</p>
              <p className="text-xs opacity-75 mt-2">{cluster.lat.toFixed(2)}, {cluster.lng.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {clusters.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No location data available yet</p>
          <p className="text-sm mt-1">Submit complaints with location to see the heatmap</p>
        </div>
      )}

      {/* Legend */}
      {clusters.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">Legend</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-red-700 rounded"></div>
              <span className="text-gray-600">High density (75%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-orange-600 rounded"></div>
              <span className="text-gray-600">Medium-high (50-75%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded"></div>
              <span className="text-gray-600">Medium (25-50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-300 to-blue-500 rounded"></div>
              <span className="text-gray-600">Low density (&lt;25%)</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal for selected cluster */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl overflow-auto max-h-[80vh]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{selected.count} issue{selected.count !== 1 ? 's' : ''} in this area</h3>
                <p className="text-sm text-gray-500">Approx location: {selected.lat.toFixed(3)}, {selected.lng.toFixed(3)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>

            <div className="space-y-4">
              {selected.issues.map(issue => (
                <div key={issue.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50 flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{issue.title}</p>
                    <p className="text-sm text-gray-500">{issue.location_name || `${issue.latitude}, ${issue.longitude}`}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(issue.created_at).toLocaleString()}</p>
                    <p className="text-sm mt-2">Status: <span className="font-semibold">{issue.status}</span></p>
                  </div>
                  <div className="text-right flex flex-col gap-2">
                    <a href={`/complaint/${issue.id}`} className="text-sky-600 hover:underline text-sm">Open</a>
                    {issue.reporter_name && <p className="text-xs text-gray-500">Reporter: {issue.reporter_name}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
