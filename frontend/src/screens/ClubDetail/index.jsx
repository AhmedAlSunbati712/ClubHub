import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, CalendarDays, MapPin } from 'lucide-react';
import { useClub } from '../../hooks/useClubs.js';
import { useToast } from '../../context/ToastContext.jsx';
import ClubHeader from '../../components/clubs/ClubHeader.jsx';
import ClubStats from '../../components/clubs/ClubStats.jsx';
import OfficerList from '../../components/clubs/OfficerList.jsx';
import CapacityBar from '../../components/common/CapacityBar.jsx';
import Button from '../../components/common/Button.jsx';
import CreateEventModal from '../../components/events/CreateEventModal.jsx';
import { getEventsByIds } from '../../data/fixtures.js';
import { formatEventDate } from '../../utils/format.js';

// Images 7, 8 — club hero + events + officers + stats.
export default function ClubDetail() {
  const { clubId } = useParams();
  const { club } = useClub(clubId);
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);

  if (!club) {
    return (
      <div className="container page">
        <p className="empty-state">Club not found.</p>
      </div>
    );
  }

  const canManage = club.viewerRole === 'Officer' || club.viewerRole === 'President';
  const clubEvents = getEventsByIds(club.events);

  return (
    <div className="container page">
      <ClubHeader club={club} />

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

          {clubEvents.length === 0 ? (
            <p className="empty-state">No upcoming events.</p>
          ) : (
            clubEvents.map((event) => (
              <article className="club-event-item" key={event.id}>
                <div className="club-event-item__head">
                  <h3 className="club-event-item__title">{event.title}</h3>
                  {canManage && (
                    <button
                      type="button"
                      className="club-link"
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      onClick={() => toast(`Manage “${event.title}” coming soon`, { variant: 'info' })}
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
          <OfficerList officers={club.officers} />
          <div className="card card-pad">
            <h2 className="section-title" style={{ marginBottom: 'var(--space-4)' }}>
              Club Stats
            </h2>
            <ClubStats stats={club.stats} />
          </div>
        </aside>
      </div>

      <CreateEventModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        clubs={[{ id: club.id, name: club.name }]}
        defaultClubId={club.id}
      />
    </div>
  );
}
