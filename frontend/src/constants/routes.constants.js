export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  OAUTH_CALLBACK: '/oauth/callback',

  // Main
  DASHBOARD: '/dashboard',

  // Trips
  TRIPS: '/trips',
  CREATE_TRIP: '/trips/create',
  TRIP_DETAIL: '/trips/:tripId',
  TRIP_DETAIL_PATH: (id) => `/trips/${id}`,

  // Itinerary
  ITINERARY_BUILDER: '/trips/:tripId/builder',
  ITINERARY_BUILDER_PATH: (id) => `/trips/${id}/builder`,
  ITINERARY_VIEW: '/trips/:tripId/view',
  ITINERARY_VIEW_PATH: (id) => `/trips/${id}/view`,

  // Budget
  BUDGET: '/trips/:tripId/budget',
  BUDGET_PATH: (id) => `/trips/${id}/budget`,

  // Checklist
  CHECKLIST: '/trips/:tripId/checklist',
  CHECKLIST_PATH: (id) => `/trips/${id}/checklist`,

  // Notes
  NOTES: '/trips/:tripId/notes',
  NOTES_PATH: (id) => `/trips/${id}/notes`,

  // City & Activity
  CITIES: '/cities',
  ACTIVITIES: '/activities',

  // Share
  PUBLIC_ITINERARY: '/share/:slug',
  PUBLIC_ITINERARY_PATH: (slug) => `/share/${slug}`,

  // Profile & Admin
  PROFILE: '/profile',
  ADMIN: '/admin',
};
