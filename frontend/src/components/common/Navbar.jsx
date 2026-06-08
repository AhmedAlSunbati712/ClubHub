import { Link, NavLink, useNavigate } from 'react-router-dom';
import { CalendarDays, Users, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { isAdmin } from '../../utils/auth.js';
import Avatar from './Avatar.jsx';
import RoleBadge from './RoleBadge.jsx';
import { ROUTES } from '../../constants/routes.js';

// DartClubs logo + Events/Clubs/Admin tabs + user badge.
export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const tabs = [
    { to: ROUTES.EVENTS, label: 'Events', icon: CalendarDays },
    { to: ROUTES.CLUBS, label: 'Clubs', icon: Users },
    ...(isAdmin(user) ? [{ to: ROUTES.ADMIN, label: 'Admin', icon: ShieldCheck }] : []),
  ];

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link to={ROUTES.EVENTS} className="navbar__logo">
          <span className="navbar__brand-mark">
            <Users size={19} strokeWidth={2.5} />
          </span>
          DartClubs
        </Link>

        <ul className="navbar__tabs">
          {tabs.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `navbar__tab${isActive ? ' is-active' : ''}`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <span className="navbar__spacer" />

        {user && (
          <div className="navbar__user-actions">
            <Link to={ROUTES.PROFILE} className="navbar__user" aria-label="View your profile">
              <span className="navbar__user-meta">
                <span className="navbar__user-name">{user.name}</span>
                <RoleBadge role={user.role} />
              </span>
              <Avatar name={user.name} size="md" />
            </Link>
            <button
              type="button"
              className="btn btn-secondary btn-sm navbar__logout"
              onClick={() => {
                logout();
                navigate(ROUTES.LOGIN);
              }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* mobile bottom tab bar */}
      <div className="navbar__bottom">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `navbar__bottom-tab${isActive ? ' is-active' : ''}`}
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
