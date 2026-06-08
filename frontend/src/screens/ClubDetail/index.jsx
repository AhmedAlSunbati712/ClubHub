import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, CalendarDays, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useClub, useClubOfficers } from '../../api/clubs.ts';
import { useMembershipCount, useUserMemberships } from '../../api/membership.ts';
import { useClubEvents } from '../../api/events.ts';
import ClubHeader from '../../components/clubs/ClubHeader.jsx';
import ClubStats from '../../components/clubs/ClubStats.jsx';
import OfficerList from '../../components/clubs/OfficerList.jsx';
import CapacityBar from '../../components/common/CapacityBar.jsx';
import Button from '../../components/common/Button.jsx';
import CreateEventModal from '../../components/events/CreateEventModal.jsx';
import EditEventModal from '../../components/events/EditEventModal.jsx';
import { formatEventDate } from '../../utils/format.js';

export default function ClubDetail() {
  const { clubId } = useParams();
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const {
    data: club,
    isLoading: isLoadingClub,
    isError: isErrorClub,
  } = useClub(clubId);
  const {
    data: officers,
    isLoading: isLoadingOfficers,
    isError: isErrorOfficers,
  } = useClubOfficers(clubId);
  const {
    data: memberCount = 0,
    isLoading: isLoadingMemberCount,
    isError: isErrorMemberCount,
  } = useMembershipCount(clubId);
  const {
    data: clubEvents,
    isLoading: isLoadingClubEvents,
    isError: isErrorClubEvents,
  } = useClubEvents(clubId);
  const {
    data: userMemberships,
    isLoading: isLoadingUserMemberships,
    isError: isErrorUserMemberships,
  } = useUserMemberships(user?.id);

  const viewerMembership = useMemo(
    () => (userMemberships ?? []).find((membership) => String(membership.clubId) === String(clubId)) ?? null,
    [userMemberships, user?.id, clubId],
  );

  const officerCount = useMemo(
    () => (officers ?? []).length,
    [officers],
  );

  const upcomingEvents = useMemo(
    () =>
      (clubEvents ?? [])
        .filter(
          (event) =>
            event.date &&
            new Date(event.date) >= new Date() &&
            event.status !== 'Cancelled' &&
            event.status !== 'Completed',
        )
        .map((event) => ({
          ...event,
          location: [event.building, event.room].filter(Boolean).join(' '),
          filled: event.confirmedCount,
        })),
    [clubEvents],
  );

  const clubForDisplay = useMemo(() => {
    if (!club) {
      return null;
    }

    return {
      ...club,
      viewerRole: viewerMembership?.role ?? null,
      viewerStatus: viewerMembership?.status ?? null,
      memberCount,
    };
  }, [club, viewerMembership, memberCount]);

  const stats = useMemo(
    () => ({
      members: memberCount,
      officers: officerCount,
      upcomingEvents: upcomingEvents.length,
    }),
    [memberCount, officerCount, upcomingEvents],
  );

  const isLoading =
    isLoadingClub ||
    isLoadingOfficers ||
    isLoadingClubEvents ||
    isLoadingMemberCount ||
    isLoadingUserMemberships;

  const isError =
    isErrorClub ||
    isErrorOfficers ||
    isErrorClubEvents ||
    isErrorMemberCount ||
    isErrorUserMemberships;

  if (isLoading) {
    return (
      <div className="container page">
        <p className="empty-state">Loading...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container page">
        <p className="empty-state">Failed to load club details.</p>
      </div>
    );
  }

  if (!clubForDisplay) {
    return (
      <div className="container page">
        <p className="empty-state">Club not found.</p>
      </div>
    );
  }

  const canManage = clubForDisplay.viewerRole === 'Officer' || clubForDisplay.viewerRole === 'President';

  const openManageEvent = (event) => {
    setSelectedEvent(event);
    setEditOpen(true);
  };

  return (
    <div className="container page">
      <ClubHeader club={clubForDisplay} />

      <div className="club-detail__grid">
        <section className="card card-pad">
          <div className="card-header">
            <h2 className="section-title">Upcoming Events</h2>
            {canManage && (
              <Button variant="primary" onClick={() => setCreateOpen(true)}>
                <Plus size={16} />
                Create Event
              </Button>
            )}
          </div>

          {upcomingEvents.length === 0 ? (
            <p className="empty-state">No upcoming events.</p>
          ) : (
            upcomingEvents.map((event) => (
              <article className="club-event-item" key={event.id}>
                <div className="club-event-item__head">
                  <h3 className="club-event-item__title">{event.title}</h3>
                  {canManage && (
                    <button
                      type="button"
                      className="club-link"
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      onClick={() => openManageEvent(event)}
                    >
                      Manage
                    </button>
                  )}
                </div>
                <div className="meta-list" style={{ marginBottom: 'var(--space-3)' }}>
                  <span className="meta-row">
                    <CalendarDays />
                    {formatEventDate(event.date)}
                  </span>
                  <span className="meta-row">
                    <MapPin />
                    {event.location}
                  </span>
                </div>
                <p className="event-card__desc" style={{ marginBottom: 'var(--space-3)' }}>
                  {event.description}
                </p>
                <CapacityBar filled={event.filled} total={event.capacity} />
              </article>
            ))
          )}
        </section>

        <aside className="club-detail__side">
          <OfficerList officers={officers ?? []} />
          <div className="card card-pad">
            <h2 className="section-title" style={{ marginBottom: 'var(--space-4)' }}>
              Club Stats
            </h2>
            <ClubStats stats={stats} />
          </div>
        </aside>
      </div>

      <CreateEventModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        clubs={[{ id: clubForDisplay.id, name: clubForDisplay.name }]}
        defaultClubId={clubForDisplay.id}
      />
      <EditEventModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        clubId={clubForDisplay.id}
      />
    </div>
  );
}
