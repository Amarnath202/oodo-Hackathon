const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const API = {
  BASE,

  // Auth
  LOGIN: `${BASE}/auth/login`,
  REGISTER: `${BASE}/auth/register`,
  LOGOUT: `${BASE}/auth/logout`,
  REFRESH_TOKEN: `${BASE}/auth/refresh-token`,
  FORGOT_PASSWORD: `${BASE}/auth/forgot-password`,
  RESET_PASSWORD: `${BASE}/auth/reset-password`,
  GOOGLE_AUTH: `${BASE}/auth/google`,
  ME: `${BASE}/users/me`,

  // Trips
  TRIPS: `${BASE}/trips`,
  TRIP: (id) => `${BASE}/trips/${id}`,
  TRIP_COVER: (id) => `${BASE}/trips/${id}/cover`,

  // Stops
  STOPS: (tripId) => `${BASE}/trips/${tripId}/stops`,
  STOP: (tripId, stopId) => `${BASE}/trips/${tripId}/stops/${stopId}`,
  STOPS_REORDER: (tripId) => `${BASE}/trips/${tripId}/stops/reorder`,

  // Activities
  ACTIVITIES: `${BASE}/activities`,
  ACTIVITY: (id) => `${BASE}/activities/${id}`,
  STOP_ACTIVITIES: (tripId, stopId) => `${BASE}/activities/stops/${stopId}/activities`,
  STOP_ACTIVITY: (tripId, stopId, activityId) => `${BASE}/activities/stops/${stopId}/activities/${activityId}`,

  // Cities
  CITIES: `${BASE}/cities`,
  CITY: (id) => `${BASE}/cities/${id}`,

  // Budget
  BUDGET: (tripId) => `${BASE}/trips/${tripId}/budget`,

  // Checklist
  CHECKLIST: (tripId) => `${BASE}/trips/${tripId}/checklist`,
  CHECKLIST_ITEMS: (tripId) => `${BASE}/trips/${tripId}/checklist/items`,
  CHECKLIST_ITEM: (tripId, itemId) => `${BASE}/trips/${tripId}/checklist/items/${itemId}`,

  // Notes
  NOTES: (tripId) => `${BASE}/trips/${tripId}/notes`,
  NOTE: (tripId, noteId) => `${BASE}/trips/${tripId}/notes/${noteId}`,

  // Share
  SHARE_PUBLISH: (tripId) => `${BASE}/share/trips/${tripId}/publish`,
  SHARE_UNPUBLISH: (tripId) => `${BASE}/share/trips/${tripId}/unpublish`,
  PUBLIC_TRIP: (slug) => `${BASE}/share/itinerary/${slug}`,
  PUBLIC_TRIP_COPY: (slug) => `${BASE}/share/itinerary/${slug}/copy`,

  // User/Profile
  PROFILE: `${BASE}/users/me`,
  PROFILE_PHOTO: `${BASE}/users/me/photo`,
  CHANGE_PASSWORD: `${BASE}/users/me/password`,
  DELETE_ACCOUNT: `${BASE}/users/me`,
  SAVED_DESTINATIONS: `${BASE}/users/me/saved-destinations`,
  SAVED_DESTINATION: (id) => `${BASE}/users/me/saved-destinations/${id}`,

  // Admin
  ADMIN_STATS: `${BASE}/admin/stats`,
  ADMIN_USERS: `${BASE}/admin/users`,
  ADMIN_USER: (id) => `${BASE}/admin/users/${id}`,
  ADMIN_TRIPS: `${BASE}/admin/trips`,
  ADMIN_CITIES: `${BASE}/admin/cities`,
  ADMIN_CITY: (id) => `${BASE}/admin/cities/${id}`,
  ADMIN_ACTIVITIES: `${BASE}/admin/activities`,
  ADMIN_ACTIVITY: (id) => `${BASE}/admin/activities/${id}`,
};
