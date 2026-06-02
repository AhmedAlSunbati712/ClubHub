import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import CapacityBar from '../common/CapacityBar.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import Button from '../common/Button.jsx';
import { formatEventDate } from '../../utils/format.js';
import { capacityColor, isFull, seatsLeft } from '../../utils/capacity.js';

// full card w/ capacity + action buttons.
export default function EventCard({ event, onRsvp, onCancel, onCheckIn, onWaitlist }) {
  if (!event) return null;

  const full = isFull(event.filled, event.capacity);
  const near = capacityColor(event.filled, event.capacity) === 'near';
  const left = seatsLeft(event.filled, event.capacity);
  const status =
    event.userState === 'confirmed'
      ? 'confirmed'
      : event.userState === 'waitlisted'
        ? 'waitlisted'
        : full
          ? 'full'
          : null;

  return (
    <article className="card card-interactive event-card">
      <div className="event-card__head">
        <h3 className="event-card__title">{event.title}</h3>
        <StatusBadge status={status} />
      </div>

      <Link to={`/clubs/${event.clubId}`} className="club-link">
        <Users />
        {event.club}
      </Link>

      <div className="meta-list">
        <span className="meta-row">
          <CalendarDays />
          {formatEventDate(event.date)}
        </span>
        <span className="meta-row">
          <MapPin />
          {event.location}
        </span>
      </div>

      <p className="event-card__desc">{event.description}</p>

      <div className="event-card__spacer" />

      <CapacityBar filled={event.filled} total={event.capacity} />
      {event.userState === 'waitlisted' && near && (
        <p className="capacity-note">Only {left} spots left!</p>
      )}

      <div className="event-card__actions">
        {event.userState === 'confirmed' && (
          <>
            <Button variant="danger" onClick={() => onCancel?.(event.id)}>
              Cancel
            </Button>
            <Button className="btn-block" onClick={() => onCheckIn?.(event.id)}>
              Check In
            </Button>
          </>
        )}

        {event.userState === 'waitlisted' && (
          <Button variant="secondary" className="btn-block" onClick={() => onWaitlist?.(event.id)}>
            Leave Waitlist
          </Button>
        )}

        {event.userState === 'none' && !full && (
          <Button className="btn-block" onClick={() => onRsvp?.(event.id)}>
            RSVP Now
          </Button>
        )}

        {event.userState === 'none' && full && (
          <>
            <Button variant="secondary" disabled>
              Event Full
            </Button>
            <Button variant="secondary" className="btn-block" onClick={() => onWaitlist?.(event.id)}>
              Join Waitlist
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
