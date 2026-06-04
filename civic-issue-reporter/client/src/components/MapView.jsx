import { Fragment, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getComplaints } from '../utils/api';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon paths for Vite/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const statusColors = {
  Submitted: '#dc2626', // red
  'In Progress': '#eab308', // yellow
  Resolved: '#16a34a', // green
};

const getStatusColor = (status) => statusColors[status] || '#2563eb';

const getMapCenter = (complaints) => {
  if (!complaints.length) return [12.9716, 77.5946];
  const valid = complaints.filter((c) => c.latitude && c.longitude);
  if (!valid.length) return [12.9716, 77.5946];
  const latAvg = valid.reduce((sum, c) => sum + c.latitude, 0) / valid.length;
  const lngAvg = valid.reduce((sum, c) => sum + c.longitude, 0) / valid.length;
  return [latAvg, lngAvg];
};

export default function MapView() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getComplaints({});
      setComplaints((data.complaints || []).filter((c) => c.latitude && c.longitude));
    } catch (err) {
      console.error('Failed to load complaints for MapView', err);
      setError('Unable to load civic issue locations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
    const interval = window.setInterval(loadComplaints, 15000);
    return () => window.clearInterval(interval);
  }, []);

  const complaintsWithLocation = complaints.filter((item) => item.latitude && item.longitude);
  const center = getMapCenter(complaintsWithLocation);

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading live issue heatmap...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-white border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Live Civic Issue Heatmap</h3>
          <p className="text-sm text-gray-500">Map updates automatically and highlights complaint density with colored markers.</p>
        </div>

        <div className="h-[520px]">
          <MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {complaintsWithLocation.map((complaint) => {
              const color = getStatusColor(complaint.status);
              return (
                <Fragment key={complaint.id}>
                  <Circle
                    center={[complaint.latitude, complaint.longitude]}
                    radius={800}
                    pathOptions={{
                      fillColor: color,
                      color: color,
                      weight: 0,
                      fillOpacity: 0.12,
                    }}
                  />
                  <CircleMarker
                    center={[complaint.latitude, complaint.longitude]}
                    radius={10}
                    pathOptions={{
                      color: '#ffffff',
                      fillColor: color,
                      fillOpacity: 1,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold text-gray-900">{complaint.title}</p>
                        <p className="text-gray-600">{complaint.description}</p>
                        <p className="text-xs text-gray-500">Status: <span className="font-semibold">{complaint.status}</span></p>
                      </div>
                    </Popup>
                  </CircleMarker>
                </Fragment>
              );
            })}
          </MapContainer>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Total issues</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{complaintsWithLocation.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">In progress</p>
          <p className="mt-3 text-3xl font-semibold text-yellow-600">{complaintsWithLocation.filter((c) => c.status === 'In Progress').length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Resolved</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">{complaintsWithLocation.filter((c) => c.status === 'Resolved').length}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-sm font-semibold text-gray-900 mb-3">Legend</p>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-red-600 block" />
            <span>Submitted / High priority</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-yellow-500 block" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-emerald-600 block" />
            <span>Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
