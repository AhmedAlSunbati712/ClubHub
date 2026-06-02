import { Link, useNavigate } from 'react-router-dom';
import { Mail, Users, Clock, CalendarDays, Award, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from '../components/common/Avatar.jsx';
import RoleBadge from '../components/common/RoleBadge.jsx';
import StatCard from '../components/common/StatCard.jsx';
import EventListItem from '../components/events/EventListItem.jsx';
import { formatDate } from '../utils/format.js';

// Image 3 — My Profile.
export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const qs = user.quickStats ?? {};

  return (
    <div className="container page">
      <div className="page-head">
        <div className="page-head__titles">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your clubs, events, and account settings</p>
        </div>
      </div>

      <div className="profile__grid">
        <div className="profile__side">
          <section className="card profile-card">
            <Avatar name={user.name} size="xl" />
            <h2 className="profile-card__name">{user.name}</h2>
            <span className="profile-card__email">
              <Mail />
              {user.email}
            </span>
            <RoleBadge role={user.role} />
            <button
              type="button"
              className="btn btn-secondary btn-block"
              style={{ marginTop: 'var(--space-4)' }}
              onClick={() => navigate('/login')}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </section>

          <section className="card card-pad">
            <h2 className="section-title" style={{ marginBottom: 'var(--space-4)' }}>
              Quick Stats
            </h2>
            <div className="quick-stats">
              <StatCard label="Active Clubs" value={qs.activeClubs ?? 0} icon={Users} tone="green" />
              <StatCard
                label="Pending Applications"
                value={qs.pendingApplications ?? 0}
                icon={Clock}
                tone="amber"
              />
              <StatCard
                label="Upcoming Events"
                value={qs.upcomingEvents ?? 0}
                icon={CalendarDays}
                tone="navy"
              />
              <StatCard label="Officer Roles" value={qs.officerRoles ?? 0} icon={Award} tone="violet" />
            </div>
          </section>
        </div>

        <div className="profile__main">
          <section className="card card-pad">
            <h2 className="section-title" style={{ marginBottom: 'var(--space-3)' }}>
              My Clubs
            </h2>
            {(user.myClubs ?? []).map((club) => {
              const canManage = club.role === 'Officer' || club.role === 'President';
              return (
                <div className="my-club-row" key={club.id}>
                  <span className="icon-tile">
                    <Users />
                  </span>
                  <div className="my-club-row__body">
                    <Link to={`/clubs/${club.id}`} className="my-club-row__name" style={{ color: 'var(--text)' }}>
                      {club.name}
                    </Link>
                    <span className="my-club-row__meta">
                      <span className="pill pill-category">{club.category}</span>
                      Joined {formatDate(club.joinDate)}
                    </span>
                  </div>
                  <div className="my-club-row__right">
                    <RoleBadge role={club.role} />
                    {canManage && (
                      <Link to={`/clubs/${club.id}/manage`} className="btn btn-secondary btn-sm">
                        Manage
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </section>

          <section className="card card-pad">
            <h2 className="section-title" style={{ marginBottom: 'var(--space-3)' }}>
              Upcoming Events
            </h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {(user.upcomingEvents ?? []).map((event) => (
                <EventListItem key={event.id} event={event} />
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
