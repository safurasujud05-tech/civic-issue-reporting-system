// components/ComplaintCard.jsx - Card for displaying a single complaint
import { Link } from 'react-router-dom';
import { getCategoryConfig, getStatusConfig, formatDate, truncate } from '../utils/helpers';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ComplaintCard({ complaint: initialComplaint, onVote }) {
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(initialComplaint);
  const category = getCategoryConfig(complaint.category);
  const status = getStatusConfig(complaint.status);
  const isAdmin = user?.role === 'admin';

  return (
    <Link
      to={`/complaint/${complaint.id}`}
      className="card-hover block"
      onClick={(e) => { /* allow link navigation as usual */ }}
    >
      {/* Image */}
      {complaint.image_url && (
        <div className="mb-4 -mt-6 -mx-6 rounded-t-2xl overflow-hidden h-40">
          <img
            src={complaint.image_url}
            alt={complaint.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {/* Category icon */}
          <div className={`w-9 h-9 rounded-xl ${category.bg} flex items-center justify-center flex-shrink-0`}>
            <span className="text-lg">{category.icon}</span>
          </div>
          {/* Category pill */}
          <span className={`category-pill ${category.pill} text-xs`}>
            {complaint.category}
          </span>
        </div>

        {/* Status badge */}
        <span className={status.class}>
          {status.icon} {complaint.status}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display font-semibold text-gray-900 mb-2 leading-snug">
        {complaint.title}
      </h3>

      {/* Description preview */}
      <p className="text-sm text-gray-500 leading-relaxed mb-4">
        {truncate(complaint.description)}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1">
          <span>🏢</span>
          <span className="truncate max-w-[160px]">{complaint.department}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🕐</span>
          <span>{formatDate(complaint.created_at)}</span>
        </div>
      </div>

      {/* Location */}
      {complaint.location_name && complaint.location_name !== 'Location not specified' && (
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
          <span>📍</span>
          <span className="truncate">{truncate(complaint.location_name, 60)}</span>
        </div>
      )}
    </Link>
  );
}
