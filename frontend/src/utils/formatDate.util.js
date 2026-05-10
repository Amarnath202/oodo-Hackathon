export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date)) return '—';

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return date.toLocaleDateString('en-US', defaultOptions);
};

export const formatDateRange = (startDate, endDate) => {
  if (!startDate) return '—';
  const start = formatDate(startDate, { month: 'short', day: 'numeric', year: 'numeric' });
  if (!endDate) return start;
  const end = formatDate(endDate, { month: 'short', day: 'numeric', year: 'numeric' });
  return `${start} – ${end}`;
};

export const formatTime = (timeString) => {
  if (!timeString) return '—';
  const [hours, minutes] = timeString.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export const getDurationDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateString);
};

export const toInputDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date)) return '';
  return date.toISOString().split('T')[0];
};
