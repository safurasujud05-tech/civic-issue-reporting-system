// components/MapPicker.jsx - Interactive map to pick complaint location
import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon (Leaflet bug with Vite/webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom blue marker
const blueIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component that handles click events on the map
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

export default function MapPicker({ onLocationChange }) {
  // Default center: Bengaluru, India
  const [markerPos, setMarkerPos] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(false);

  const DEFAULT_CENTER = [12.9716, 77.5946];

  // Reverse geocode lat/lng to a readable address
  async function reverseGeocode(lat, lng) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
      const res = await fetch(url);
      const data = await res.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  const handleLocationSelect = useCallback(async (lat, lng) => {
    setMarkerPos([lat, lng]);
    setLoading(true);

    const name = await reverseGeocode(lat, lng);
    setLocationName(name);
    setLoading(false);

    // Notify parent component
    onLocationChange({ latitude: lat, longitude: lng, location_name: name });
  }, [onLocationChange]);

  // Use browser's geolocation API
  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await handleLocationSelect(latitude, longitude);
      },
      () => {
        setLoading(false);
        alert('Unable to get your location. Please click on the map.');
      }
    );
  }

  return (
    <div className="space-y-3">
      {/* Map instructions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          📍 Click on the map to set the issue location
        </p>
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-800 font-medium transition-colors"
        >
          {loading ? (
            <span className="spinner inline-block w-3 h-3 border-2 border-sky-600 border-t-transparent rounded-full" />
          ) : (
            <span>📱</span>
          )}
          Use my location
        </button>
      </div>

      {/* Leaflet Map */}
      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={12}
          style={{ height: '280px', width: '100%' }}
        >
          {/* OpenStreetMap tiles - completely free */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          {markerPos && <Marker position={markerPos} icon={blueIcon} />}
        </MapContainer>
      </div>

      {/* Selected location display */}
      {markerPos && (
        <div className="bg-sky-50 rounded-xl p-3 border border-sky-100">
          <p className="text-xs font-semibold text-sky-700 mb-1">📍 Selected Location</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {loading ? 'Getting address...' : locationName}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {markerPos[0].toFixed(5)}, {markerPos[1].toFixed(5)}
          </p>
        </div>
      )}
    </div>
  );
}
