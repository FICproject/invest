/**
 * Format ISO date string into readable date (e.g. 15 Apr 2026, Mar 19, 2026)
 */
export const formatDate = (dateString, format = 'medium') => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';

  if (format === 'short') {
    // Mar 19, 2026
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  if (format === 'dayMonthYear') {
    // 15 Apr 2026
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  // Default: 15 Apr 2026
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Format relative time (e.g. 2 hours ago, 1 day ago)
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 172800) return '1 day ago';
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};
