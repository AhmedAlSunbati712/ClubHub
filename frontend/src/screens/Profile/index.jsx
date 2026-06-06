import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { Mail, Users, Clock, CalendarDays, Award, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import RoleBadge from '../../components/common/RoleBadge.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import EventListItem from '../../components/events/EventListItem.jsx';
import { formatDate } from '../../utils/format.js';
import { ROUTES } from '../../constants/routes.js';
import { useUserMemberships } from '../../api/membership.ts';
import { useUserRsvps } from '../../api/user.ts';
import { CLUBS_KEY } from '../../api/clubs.ts';
import { useQueries } from '@tanstack/react-query';
import api from '../../api/axios.ts';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userId = user?.id;

  const {
    data: userMemberships,
    isLoading: isLoadingUserMemberships,
    isError: isErrorUserMemberships,
  } = useUserMemberships(userId);

  const clubIds = userMemberships?.map((membership) => membership.clubId) ?? [];
  const {
    data: userRsvps,
    isLoading: isLoadingUserRsvps,
    isError: isErrorUserRsvps,
  } = useUserRsvps(userId);

  const clubsQuery = useQueries({
    queries: clubIds.map((id) => ({
      queryKey: [CLUBS_KEY, id],
      queryFn: async () => {
        const response = await api.get(`/api/clubs/${id}`);
        return {
          id: response.data.ClubID,
          name: response.data.ClubName,
          category: response.data.Category,
        };
      },
      enabled: Boolean(userId),
    })),
  });

  const clubsById = useMemo(() => {
    return Object.fromEntries(
      clubsQuery
        .filter((query) => query.data)
        .map((query) => [query.data.id, query.data]),
    );
  }, [clubsQuery]);

  const myClubs = useMemo(() => {
    return (userMemberships ?? []).map((membership) => ({
      id: membership.clubId,
      role: membership.role,
      joinDate: membership.joinDate,
      status: membership.status,
      name: clubsById[membership.clubId]?.name ?? '',
      category: clubsById[membership.clubId]?.category ?? '',
    }));
  }, [userMemberships, clubsById]);

  const upcomingEvents = useMemo(() => {
    return (userRsvps ?? []).map((rsvp) => ({
      id: rsvp.eventId,
      title: rsvp.title,
      status: rsvp.rsvpStatus.toLowerCase(),
      date: rsvp.eventDateTime,
      club: rsvp.clubName,
      location: [rsvp.building, rsvp.room].filter(Boolean).join(' '),
    }));
  }, [userRsvps]);

  const isLoadingProfileData =
    isLoadingUserMemberships ||
    isLoadingUserRsvps ||
    clubsQuery.some((query) => query.isLoading);

  const qs = useMemo(() => ({
    activeClubs: myClubs.filter((club) => club.status === 'Active').length,
    pendingApplications: myClubs.filter((club) => club.status === 'Pending').length,
    upcomingEvents: upcomingEvents.length,
    officerRoles: myClubs.filter((club) => club.role === 'Officer' || club.role === 'President').length,
  }), [myClubs, upcomingEvents]);

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (isLoadingProfileData) {
    return <div>Loading...</div>;
  }

  if (isErrorUserMemberships || isErrorUserRsvps) {
    return <div>Error fetching profile data</div>;
  }

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
              onClick={() => {
                logout();
                navigate(ROUTES.LOGIN);
              }}
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
            {myClubs.map((club) => {
              const canManage = club.role === 'Officer' || club.role === 'President';
              return (
                <div className="my-club-row" key={club.id}>
                  <span className="icon-tile">
                    <Users />
                  </span>
                  <div className="my-club-row__body">
                    <Link
                      to={ROUTES.CLUB_DETAIL.replace(':clubId', club.id)}
                      className="my-club-row__name"
                      style={{ color: 'var(--text)' }}
                    >
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
                      <Link
                        to={ROUTES.MANAGE_CLUB.replace(':clubId', club.id)}
                        className="btn btn-secondary btn-sm"
                      >
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
              {upcomingEvents.map((event) => (
                <EventListItem key={event.id} event={event} />
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
