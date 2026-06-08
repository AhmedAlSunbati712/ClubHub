import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { isAdmin } from '../../utils/auth.js';
import { ROUTES } from '../../constants/routes.js';

// Route guard for admin-only screens. Redirects non-admins (incl. students
// and signed-out visitors) to the events page. Renders nothing while the
// initial session check is in flight to avoid a redirect flicker.
export default function RequireAdmin() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAdmin(user)) return <Navigate to={ROUTES.EVENTS} replace />;

  return <Outlet />;
}
