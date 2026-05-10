export const APP_NAME = 'Traveloop';
export const APP_TAGLINE = 'Personalized Travel Planning Made Easy';

export const ACTIVITY_TYPES = [
  'Sightseeing',
  'Adventure',
  'Food & Dining',
  'Culture',
  'Shopping',
  'Relaxation',
  'Sports',
  'Nature',
  'Nightlife',
  'Family',
];

export const CHECKLIST_CATEGORIES = [
  'Clothing',
  'Documents',
  'Electronics',
  'Toiletries',
  'Medications',
  'Money',
  'Accessories',
  'Other',
];

export const BUDGET_CATEGORIES = [
  'Transport',
  'Stay',
  'Activities',
  'Meals',
];

export const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'createdAt:asc', label: 'Oldest First' },
  { value: 'name:asc', label: 'Name A–Z' },
  { value: 'name:desc', label: 'Name Z–A' },
  { value: 'startDate:asc', label: 'Start Date (Earliest)' },
  { value: 'startDate:desc', label: 'Start Date (Latest)' },
];

export const PAGE_SIZE = 9;

export const PASSWORD_REQUIREMENTS = [
  { id: 'length', label: 'At least 8 characters', regex: /.{8,}/ },
  { id: 'uppercase', label: 'One uppercase letter', regex: /[A-Z]/ },
  { id: 'lowercase', label: 'One lowercase letter', regex: /[a-z]/ },
  { id: 'number', label: 'One number', regex: /[0-9]/ },
  { id: 'special', label: 'One special character', regex: /[^A-Za-z0-9]/ },
];

export const SOCKET_EVENTS = {
  TRIP_UPDATED: 'trip:updated',
  STOP_ADDED: 'stop:added',
  STOP_UPDATED: 'stop:updated',
  STOP_DELETED: 'stop:deleted',
  STOP_REORDERED: 'stop:reordered',
  ACTIVITY_ADDED: 'activity:added',
  ACTIVITY_REMOVED: 'activity:removed',
  BUDGET_UPDATED: 'budget:updated',
  BUDGET_ALERT: 'budget:alert',
  NOTE_ADDED: 'note:added',
  NOTE_UPDATED: 'note:updated',
  NOTE_DELETED: 'note:deleted',
};

export const REGIONS = [
  'Europe',
  'Asia',
  'North America',
  'South America',
  'Africa',
  'Oceania',
  'Middle East',
  'Caribbean',
];
