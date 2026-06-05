import { useState } from 'react';
import { CalendarSearch, Plus } from 'lucide-react';
import { useEvents } from '../../hooks/useEvents.js';
import { useClubs } from '../../hooks/useClubs.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import SearchBar from '../../components/common/SearchBar.jsx';
import EventCard from '../../components/events/EventCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Button from '../../components/common/Button.jsx';
import CreateEventModal from '../../components/events/CreateEventModal.jsx';
import { eventCategories } from '../../data/fixtures.js';

// Image 1 — Upcoming Events grid.
export default function Events() {
  const { events } = useEvents();
  const { clubs } = useClubs();
  const { user } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  // clubs the current user may host events for
  const hostableClubs = (
    user?.role === 'Admin'
      ? clubs
      : clubs.filter((c) => c.viewerRole === 'Officer' || c.viewerRole === 'President')
  ).map((c) => ({ id: c.id, name: c.name }));
  const canCreate = hostableClubs.length > 0;

  const titleOf = (id) => events.find((e) => e.id === id)?.title ?? 'this event';

  const handlers = {
    onRsvp: (id) => toast(`You're confirmed for ${titleOf(id)}`),
    onCheckIn: (id) => toast(`Checked in to ${titleOf(id)}`),
    onCancel: (id) => toast(`RSVP cancelled for ${titleOf(id)}`, { variant: 'info' }),
    onWaitlist: (id) => {
      const ev = events.find((e) => e.id === id);
      if (ev?.userState === 'waitlisted') toast(`Left the waitlist for ${ev.title}`, { variant: 'info' });
      else toast(`Added to the waitlist for ${titleOf(id)}`);
    },
  };

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.club.toLowerCase().includes(query.toLowerCase())
  );

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
        categories={eventCategories}
        placeholder="Search events..."
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarSearch}
          title="No events found"
          hint={query ? `Nothing matches “${query}”. Try a different search.` : 'Check back soon for new events.'}
        />
      ) : (
        <div className="card-grid">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} {...handlers} />
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
