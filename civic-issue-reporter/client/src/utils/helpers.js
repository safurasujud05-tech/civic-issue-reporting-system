// utils/helpers.js - Utility functions for UI

// Category icons and colors
export const CATEGORY_CONFIG = {
  Electricity: {
    icon: '⚡',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    pill: 'bg-yellow-100 text-yellow-800',
  },
  Water: {
    icon: '💧',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    pill: 'bg-blue-100 text-blue-800',
  },
  Roads: {
    icon: '🛣️',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    pill: 'bg-orange-100 text-orange-800',
  },
  Garbage: {
    icon: '🗑️',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    pill: 'bg-green-100 text-green-800',
  },
};

// Status configuration
export const STATUS_CONFIG = {
  Submitted: {
    icon: '📝',
    class: 'badge-submitted',
    dotColor: 'bg-amber-400',
  },
  'In Progress': {
    icon: '🔄',
    class: 'badge-progress',
    dotColor: 'bg-blue-400',
  },
  Resolved: {
    icon: '✅',
    class: 'badge-resolved',
    dotColor: 'bg-emerald-400',
  },
};

/**
 * Format a date to readable string
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get category config with fallback
 */
export function getCategoryConfig(category) {
  return CATEGORY_CONFIG[category] || {
    icon: '📋',
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    pill: 'bg-gray-100 text-gray-800',
  };
}

/**
 * Get status config with fallback
 */
export function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG['Submitted'];
}

/**
 * Truncate text to a given length
 */
export function truncate(text, maxLength = 120) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
