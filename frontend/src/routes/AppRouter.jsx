import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes.constants';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import AuthLayout from '../components/layout/AuthLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import OAuthCallbackPage from '../pages/auth/OAuthCallbackPage';

// Dashboard
import DashboardPage from '../pages/dashboard/DashboardPage';

// Trips
import TripListPage from '../pages/trips/TripListPage';
import CreateTripPage from '../pages/trips/CreateTripPage';
import TripDetailPage from '../pages/trips/TripDetailPage';

// Itinerary
import ItineraryBuilderPage from '../pages/itinerary/ItineraryBuilderPage';
import ItineraryViewPage from '../pages/itinerary/ItineraryViewPage';

// Budget, Checklist, Notes
import BudgetPage from '../pages/budget/BudgetPage';
import ChecklistPage from '../pages/checklist/ChecklistPage';
import NotesPage from '../pages/notes/NotesPage';

// City & Activity
import CitySearchPage from '../pages/city/CitySearchPage';
import ActivitySearchPage from '../pages/activity/ActivitySearchPage';

// Profile & Admin
import ProfilePage from '../pages/profile/ProfilePage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';

// Share (public)
import PublicItineraryPage from '../pages/share/PublicItineraryPage';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.PUBLIC_ITINERARY} element={<PublicItineraryPage />} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        <Route path={ROUTES.OAUTH_CALLBACK} element={<OAuthCallbackPage />} />
      </Route>

      {/* Protected app routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

        {/* Trips */}
        <Route path={ROUTES.TRIPS} element={<TripListPage />} />
        <Route path={ROUTES.CREATE_TRIP} element={<CreateTripPage />} />
        <Route path={ROUTES.TRIP_DETAIL} element={<TripDetailPage />} />

        {/* Itinerary */}
        <Route path={ROUTES.ITINERARY_BUILDER} element={<ItineraryBuilderPage />} />
        <Route path={ROUTES.ITINERARY_VIEW} element={<ItineraryViewPage />} />

        {/* Trip sub-pages */}
        <Route path={ROUTES.BUDGET} element={<BudgetPage />} />
        <Route path={ROUTES.CHECKLIST} element={<ChecklistPage />} />
        <Route path={ROUTES.NOTES} element={<NotesPage />} />

        {/* City & Activity */}
        <Route path={ROUTES.CITIES} element={<CitySearchPage />} />
        <Route path={ROUTES.ACTIVITIES} element={<ActivitySearchPage />} />

        {/* Profile */}
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />

        {/* Admin */}
        <Route
          path={ROUTES.ADMIN}
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
