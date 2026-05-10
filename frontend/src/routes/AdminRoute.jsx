import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import PageLoader from '../components/common/PageLoader';
import { ROUTES } from '../constants/routes.constants';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, isAdmin } = useAuthContext();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!isAdmin) return <Navigate to={ROUTES.DASHBOARD} replace />;

  return children;
};

export default AdminRoute;
