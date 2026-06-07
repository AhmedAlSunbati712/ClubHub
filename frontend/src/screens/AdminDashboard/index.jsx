import { Link } from 'react-router-dom';
import {
  Users,
  CalendarDays,
  GraduationCap,
  IdCard,
  ArrowRight,
  MapPin,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAdminStats } from '../../api/admin.ts';
import TopClubsList from '../../components/admin/TopClubsList.jsx';
import CapacityBar from '../../components/common/CapacityBar.jsx';
import CountUp from '../../components/common/CountUp.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { formatDate } from '../../utils/format.js';
import { ROUTES } from '../../constants/routes.js';

const EMPTY_TOTALS = { clubs: 0, events: 0, students: 0, memberships: 0 };

// Image 4 — Admin Dashboard.
export default function AdminDashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useAdminStats();

  const stats = data?.totals ?? EMPTY_TOTALS;
  const topClubs = data?.topClubs ?? [];
  const upcomingEvents = data?.upcomingEvents ?? [];

  const tiles = [
    { label: 'Total Clubs', value: stats.clubs, icon: Users, cls: 'dash-tile--1' },
    { label: 'Total Events', value: stats.events, icon: CalendarDays, cls: 'dash-tile--2' },
    { label: 'Active Students', value: stats.students, icon: GraduationCap, cls: 'dash-tile--3' },
    { label: 'Total Memberships', value: stats.memberships, icon: IdCard, cls: 'dash-tile--4' },
  ];

  return (
    <div className="container page">
      <div className="page-head">
        <div className="page-head__titles">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {user?.name?.split(' ')[0] ?? 'Admin'}! Here's what's happening across DartClubs.
          </p>
        </div>
      </div>

      {isLoading ? (
        <EmptyState
          icon={LayoutDashboard}
          title="Loading dashboard"
          hint="Crunching the latest numbers across DartClubs."
        />
      ) : isError ? (
        <EmptyState
          icon={LayoutDashboard}
          title="Unable to load dashboard"
          hint="Try refreshing the page."
        />
      ) : (
      <>
      <div className="dash-tiles">
        {tiles.map(({ label, value, icon: Icon, cls }) => (
          <div className={`dash-tile ${cls}`} key={label}>
            <span className="dash-tile__icon">
              <Icon />
            </span>
            <div>
              <div className="dash-tile__label">{label}</div>
              <div className="dash-tile__value tnum">
                <CountUp value={value} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <section className="card card-pad">
          <h2 className="section-title" style={{ marginBottom: 'var(--space-4)' }}>
            Quick Actions
          </h2>
          <div className="quick-actions">
            <Link to={ROUTES.ADMIN_CLUBS} className="btn btn-primary btn-block">
              <Users size={16} />
              Manage Clubs
              <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
            </Link>
            <Link to={ROUTES.ADMIN_LOCATIONS} className="btn btn-secondary btn-block">
              <MapPin size={16} />
              Manage Locations
            </Link>
            <Link to={ROUTES.ADMIN_STUDENTS} className="btn btn-secondary btn-block">
              <GraduationCap size={16} />
              View All Students
            </Link>
          </div>
        </section>

        <section className="card card-pad">
          <h2 className="section-title" style={{ marginBottom: 'var(--space-3)' }}>
            Top Clubs by Members
          </h2>
          <TopClubsList clubs={topClubs} />
        </section>

        <section className="card card-pad">
          <h2 className="section-title" style={{ marginBottom: 'var(--space-3)' }}>
            Upcoming Events
          </h2>
          {upcomingEvents.map((event) => (
            <div className="dash-event" key={event.id}>
              <div className="dash-event__title">{event.title}</div>
              <div className="dash-event__meta">
                {event.club} · {formatDate(event.date)}
              </div>
              <CapacityBar filled={event.filled} total={event.capacity} compact />
              <div className="capacity-bar__count tnum" style={{ marginTop: 'var(--space-2)', display: 'block' }}>
                {event.filled} / {event.capacity} confirmed
              </div>
            </div>
          ))}
        </section>
      </div>
      </>
      )}
    </div>
  );
}
