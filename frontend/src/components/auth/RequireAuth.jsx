import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../constants/routes.js';

// Route guard for authenticated screens.
// Signed-out visitors go to login; the guard stays quiet while the initial
// session check is still in flight.
export default function RequireAuth() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;

  return <Outlet />;
}
