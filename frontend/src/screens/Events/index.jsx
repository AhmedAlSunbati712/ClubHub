import { useMemo, useState } from 'react';
import { CalendarSearch, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEvents, useSelfCheckIn } from '../../api/events.ts';
import { useCreateRsvp, useDeleteRsvp, useUpdateRsvp } from '../../api/rsvp.ts';
import { useClubs } from '../../api/clubs.ts';
import { useUserMemberships } from '../../api/membership.ts';
import { useUserRsvps } from '../../api/user.ts';
import { useAuth } from '../../context/AuthContext.jsx';
import SearchBar from '../../components/common/SearchBar.jsx';
import EventCard from '../../components/events/EventCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Button from '../../components/common/Button.jsx';
import CreateEventModal from '../../components/events/CreateEventModal.jsx';
import { ROUTES } from '../../constants/routes.js';

const RSVP_STATUS = {
  CONFIRMED: 'Confirmed',
  WAITLISTED: 'Waitlisted',
  CANCELLED: 'Cancelled',
};

const CLUB_ROLE = {
  OFFICER: 'Officer',
  PRESIDENT: 'President',
};

const EVENT_STATUS = {
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
};

const eventCategoryLabel = (category) => category || 'Unknown';

export default function Events() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const { data: events = [], isLoading: isLoadingEvents, error: eventsError } = useEvents();
  const { data: clubs = [], isLoading: isLoadingClubs, error: clubsError } = useClubs();
  const { data: userMemberships = [] } = useUserMemberships(user?.id);
  const { data: userRsvps = [] } = useUserRsvps(user?.id);

  const { mutate: createRsvp } = useCreateRsvp();
  const { mutate: updateRsvp } = useUpdateRsvp();
  const { mutate: deleteRsvp } = useDeleteRsvp();
  const { mutate: selfCheckIn } = useSelfCheckIn();

  const clubsById = useMemo(
    () =>
      Object.fromEntries(
        clubs.map((club) => [club.id, club]),
      ),
    [clubs],
  );

  const membershipsByClubId = useMemo(
    () =>
      Object.fromEntries(
        userMemberships.map((membership) => [membership.clubId, membership]),
      ),
    [userMemberships],
  );

  const rsvpsByEventId = useMemo(
    () =>
      Object.fromEntries(
        userRsvps.map((rsvp) => [rsvp.eventId, rsvp]),
      ),
    [userRsvps],
  );

  const hostableClubs = useMemo(() => {
    const activeClubs = clubs.filter((club) => club.status === 'Active');
    if (user?.role === 'Admin') {
      return activeClubs.map((club) => ({ id: club.id, name: club.name }));
    }

    return activeClubs
      .filter((club) => {
        const membership = membershipsByClubId[club.id];
        return (
          membership?.status === 'Active' &&
          [CLUB_ROLE.OFFICER, CLUB_ROLE.PRESIDENT].includes(membership.role)
        );
      })
      .map((club) => ({ id: club.id, name: club.name }));
  }, [clubs, membershipsByClubId, user?.role]);

  const eventCategories = useMemo(
    () =>
      Array.from(
        new Set(
          clubs
            .filter((club) => club.status === 'Active')
            .map((club) => eventCategoryLabel(club.category)),
        ),
      ).sort(),
    [clubs],
  );

  const eventsForDisplay = useMemo(() => {
    const now = new Date();

    return events
      .filter((event) => {
        if ([EVENT_STATUS.CANCELLED, EVENT_STATUS.COMPLETED].includes(event.status)) {
          return false;
        }
        return true;
      })
      .map((event) => {
        const club = clubsById[event.clubId];
        const userRsvp = rsvpsByEventId[event.id];
        const eventDate = event.date ? new Date(event.date) : null;
        const userState =
          userRsvp?.rsvpStatus === RSVP_STATUS.CONFIRMED
            ? 'confirmed'
            : userRsvp?.rsvpStatus === RSVP_STATUS.WAITLISTED
              ? 'waitlisted'
              : 'none';

        return {
          id: event.id,
          clubId: String(event.clubId ?? ''),
          club: club?.name ?? 'Unknown Club',
          clubCategory: eventCategoryLabel(club?.category),
          title: event.title,
          date: event.date,
          location:
            event.building && event.room
              ? `${event.building} - ${event.room}`
              : event.building || event.room || 'TBD',
          description: event.description,
          filled: event.confirmedCount,
          capacity: event.capacity ?? 0,
          userState,
          checkedIn: userRsvp?.checkedIn ?? false,
          canCheckIn: eventDate ? eventDate <= now : false,
        };
      })
      .filter((event) => {
        const normalizedQuery = query.trim().toLowerCase();
        const matchesQuery =
          normalizedQuery === '' ||
          event.title.toLowerCase().includes(normalizedQuery) ||
          event.club.toLowerCase().includes(normalizedQuery);
        const matchesCategory = !category || event.clubCategory === category;

        return matchesQuery && matchesCategory;
      });
  }, [events, clubsById, rsvpsByEventId, query, category]);

  const canCreate = hostableClubs.length > 0;
  const isLoading = isLoadingEvents || isLoadingClubs;

  const requireAuth = () => {
    if (user) return false;
    navigate(ROUTES.LOGIN);
    return true;
  };

  const titleOf = (eventId) =>
    eventsForDisplay.find((event) => event.id === eventId)?.title ?? 'this event';

  const clubIdOf = (eventId) =>
    events.find((event) => event.id === eventId)?.clubId ?? null;

  const handlers = {
    onRsvp: (eventId) => {
      if (requireAuth()) return;

      createRsvp(
        { eventId, clubId: clubIdOf(eventId) },
        {
          onSuccess: ({ data }) => {
            const nextStatus =
              data.status === RSVP_STATUS.WAITLISTED ? 'waitlist' : 'confirmed RSVP';
            toast.success(`Added to ${nextStatus} for ${titleOf(eventId)}`);
          },
          onError: (error) => {
            const message = error?.response?.data?.Error || 'Failed to RSVP';
            toast.error(message);
          },
        },
      );
    },
    onCancel: (eventId) => {
      if (requireAuth()) return;

      updateRsvp(
        {
          eventId,
          userId: user.id,
          clubId: clubIdOf(eventId),
          payload: { status: RSVP_STATUS.CANCELLED },
        },
        {
          onSuccess: () => {
            toast.info(`RSVP cancelled for ${titleOf(eventId)}`);
          },
          onError: (error) => {
            const message = error?.response?.data?.Error || 'Failed to cancel RSVP';
            toast.error(message);
          },
        },
      );
    },
    onCheckIn: (eventId) => {
      if (requireAuth()) return;

      selfCheckIn(
        { eventId, clubId: clubIdOf(eventId) },
        {
          onSuccess: () => {
            toast.success(`Checked in to ${titleOf(eventId)}`);
          },
          onError: (error) => {
            const message = error?.response?.data?.Error || 'Failed to check in';
            toast.error(message);
          },
        },
      );
    },
    onWaitlist: (eventId) => {
      if (requireAuth()) return;

      const event = eventsForDisplay.find((entry) => entry.id === eventId);
      if (event?.userState === 'waitlisted') {
        deleteRsvp(
          { eventId, userId: user.id, clubId: clubIdOf(eventId) },
          {
            onSuccess: () => {
              toast.info(`Left the waitlist for ${titleOf(eventId)}`);
            },
            onError: (error) => {
              const message = error?.response?.data?.Error || 'Failed to leave the waitlist';
              toast.error(message);
            },
          },
        );
        return;
      }

      createRsvp(
        { eventId, clubId: clubIdOf(eventId) },
        {
          onSuccess: ({ data }) => {
            const message =
              data.status === RSVP_STATUS.WAITLISTED
                ? `Added to the waitlist for ${titleOf(eventId)}`
                : `You're confirmed for ${titleOf(eventId)}`;
            toast.success(message);
          },
          onError: (error) => {
            const message = error?.response?.data?.Error || 'Failed to join the waitlist';
            toast.error(message);
          },
        },
      );
    },
  };

  return (
    <div className="container page">
      <div className="page-head">
        <div className="page-head__titles">
          <h1 className="page-title">Upcoming Events</h1>
          <p className="page-subtitle">Discover and join events happening across campus</p>
        </div>
        {canCreate && (
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus size={16} />
            Create Event
          </Button>
        )}
      </div>

      <SearchBar
        value={query}
        onChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        categories={eventCategories}
        placeholder="Search events..."
      />

      {isLoading ? (
        <EmptyState
          icon={CalendarSearch}
          title="Loading events"
          hint="Fetching upcoming events across campus."
        />
      ) : eventsError || clubsError ? (
        <EmptyState
          icon={CalendarSearch}
          title="Unable to load events"
          hint="Try refreshing the page."
        />
      ) : eventsForDisplay.length === 0 ? (
        <EmptyState
          icon={CalendarSearch}
          title="No events found"
          hint={
            query || category
              ? 'Try a different search or filter.'
              : 'Check back soon for new events.'
          }
        />
      ) : (
        <div className="card-grid">
          {eventsForDisplay.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              {...handlers}
            />
          ))}
        </div>
      )}

      <CreateEventModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        clubs={hostableClubs}
      />
    </div>
  );
}
