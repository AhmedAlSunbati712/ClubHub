import { Link, NavLink } from 'react-router-dom';
import { CalendarDays, Users, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';
import RoleBadge from './RoleBadge.jsx';

const TABS = [
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/clubs', label: 'Clubs', icon: Users },
  { to: '/admin', label: 'Admin', icon: ShieldCheck },
];

// DartClubs logo + Events/Clubs/Admin tabs + user badge.
export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link to="/events" className="navbar__logo">
          <span className="navbar__brand-mark">
            <Users size={19} strokeWidth={2.5} />
          </span>
          DartClubs
        </Link>

        <ul className="navbar__tabs">
          {TABS.map(({ to, label, icon: Icon }) => (
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
          <Link to="/profile" className="navbar__user" aria-label="View your profile">
            <span className="navbar__user-meta">
              <span className="navbar__user-name">{user.name}</span>
              <RoleBadge role={user.role} />
            </span>
            <Avatar name={user.name} size="md" />
          </Link>
        )}
      </div>

      {/* mobile bottom tab bar */}
      <div className="navbar__bottom">
        {TABS.map(({ to, label, icon: Icon }) => (
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
